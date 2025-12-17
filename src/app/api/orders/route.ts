import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '~/payload.config'
import { buildAirtablePayload } from '~/lib/airtable'
import { getPriceForQuantity, getPriceFromDates } from '~/lib/pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Allowed fields for order draft updates.
// IMPORTANT: This route must not do any payment processing and should not
// recompute/overwrite pricing totals on incremental updates.
const ALLOWED_CONTACT_FIELDS = [
  // order initialization
  'event_slug',

  // order non-payment fields (used by EventPricing/Register)
  'quantity',
  'currency',
  'startDate',
  'endDate',

  // contact fields
  'email',
  'firstName',
  'lastName',
  'phone',
  'company',
  'vatNumber',
  'poNumber',
  'notes',
  'country',
  'region',
  'address1',
  'address2',
  'city',
  'state',
  'postcode',
  'participants',
] as const

type ContactField = (typeof ALLOWED_CONTACT_FIELDS)[number]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || undefined
    const testAirtable = searchParams.get('testAirtable') === 'true'

    const payload = await getPayload({ config })
    
    if (testAirtable) {
      // Get latest order for testing
      const found = await payload.find({
        collection: 'orders',
        sort: '-createdAt',
        limit: 1,
      })
      const order = found.docs?.[0]
      if (!order) {
        return NextResponse.json({ error: 'No orders found' }, { status: 404 })
      }
      
      // Build Airtable payload
      const airtablePayload = buildAirtablePayload(order as any)
      return NextResponse.json({
        order: order,
        airtablePayload: airtablePayload,
      })
    }
    
    if (sessionId) {
      const found = await payload.find({
        collection: 'orders',
        where: { and: [{ sessionId: { equals: sessionId } }, { status: { equals: 'draft' } }] },
        limit: 1,
      })
      const doc = found.docs?.[0]
      if (doc) return NextResponse.json(doc)
      return NextResponse.json(null)
    }

    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  } catch (error) {
    console.error('Failed to fetch order', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, field, value } = body as {
      sessionId?: string
      field: string
      value: unknown
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    if (!field) {
      return NextResponse.json({ error: 'Missing field' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Special test Airtable branch
    if (field === 'test_airtable') {
      const found = await payload.find({
        collection: 'orders',
        sort: '-createdAt',
        limit: 1,
      })
      const order = found.docs?.[0]
      if (!order) {
        return NextResponse.json({ error: 'No orders found' }, { status: 404 })
      }

      const airtablePayload = buildAirtablePayload(order as any)
      
      try {
        const webhookUrl = 'https://hkdk.events/dm3pw8amcsw1dt'
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(airtablePayload),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Webhook error: ${response.status} ${errorText}`)
        }

        const result = await response.json()
        return NextResponse.json({
          success: true,
          order: order,
          airtablePayload: airtablePayload,
          webhookResult: result,
        })
      } catch (error) {
        console.error('Failed to post to webhook:', error)
        return NextResponse.json(
          {
          error: 'Failed to post to webhook', 
          details: error instanceof Error ? error.message : 'Unknown error',
            airtablePayload: airtablePayload,
          },
          { status: 500 },
        )
      }
    }

    // Validate field is allowed for draft updates
    if (!ALLOWED_CONTACT_FIELDS.includes(field as ContactField)) {
      return NextResponse.json(
        { error: `Field '${field}' is not allowed.` },
        { status: 400 },
      )
    }

    // Special initialize-from-event branch (creates/updates a draft order)
    if (field === 'event_slug') {
      if (!value || typeof value !== 'string') {
        return NextResponse.json({ error: 'Missing event slug' }, { status: 400 })
      }

      const slug = String(value)
      const ev = await payload.find({
        collection: 'events',
        where: { slug: { equals: slug } },
        limit: 1,
      })
      const eventDoc = ev.docs?.[0] as any
      if (!eventDoc) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      const eventDates = eventDoc?.['Event Dates'] || []
      const firstDateRange =
        Array.isArray(eventDates) && eventDates.length > 0 ? eventDates[0] : undefined
      const startISO = firstDateRange?.['Start Date']
      const endISO = firstDateRange?.['End Date']

      if (!startISO || !endISO) {
        return NextResponse.json({ error: 'Event dates missing for this event' }, { status: 400 })
      }

      // Default draft values (EventPricing will overwrite quantity/dates as user selects)
      const quantity = 1
      const currencyCode: 'EUR' | 'USD' = 'EUR'
      const currency: '€' | '$' = currencyCode === 'EUR' ? '€' : '$'

      // Use pricing lib for the draft total (group pricing baked in, no early bird here)
      const price = getPriceForQuantity(startISO, endISO, quantity, { currency })

      const data: any = {
        status: 'draft',
        eventId: String(eventDoc.id ?? eventDoc._id ?? eventDoc.slug ?? ''),
        eventTitle: String(eventDoc['Title'] ?? eventDoc.title ?? 'Event'),
        eventSlug: slug,
        quantity,
        currency: currencyCode,
        totalAmount: price,
        // initialize dates with the first range (EventPricing will overwrite selected range)
        startDate: startISO,
        endDate: endISO,
        lastActivityAt: new Date().toISOString(),
      }

      const existing = await payload.find({
        collection: 'orders',
        where: { and: [{ sessionId: { equals: sessionId } }, { status: { equals: 'draft' } }] },
        limit: 1,
      })
      const doc = existing.docs?.[0] as any
      if (doc) {
        const updated = await payload.update({ collection: 'orders', id: doc.id, data })
        return NextResponse.json({ orderId: (updated as any).id, success: true })
      }

      const created = await payload.create({
        collection: 'orders',
        data: {
          sessionId: sessionId || `${Date.now()}`,
          ...data,
        },
      })
      return NextResponse.json({ orderId: (created as any).id, success: true })
    }

    // Find existing draft by sessionId
    const existing = await payload.find({
      collection: 'orders',
      where: {
        and: [{ sessionId: { equals: sessionId } }, { status: { equals: 'draft' } }],
      },
      limit: 1,
    })

    const doc = existing.docs?.[0]
    if (!doc) {
      return NextResponse.json({ error: 'Draft order not found' }, { status: 404 })
    }

    // Map field to order data
    const updateData = mapFieldToOrderData(field as ContactField, value)

    // Merge address updates so we don't clobber other address fields
    if ((updateData as any).address) {
      ;(updateData as any).address = { ...(doc as any).address, ...(updateData as any).address }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid data to update' }, { status: 400 })
    }

    const updated = await payload.update({
      collection: 'orders',
      id: doc.id,
      data: {
        ...updateData,
        lastActivityAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ orderId: (updated as any).id, success: true })
  } catch (error) {
    console.error('Failed to update order contact info', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

function mapFieldToOrderData(field: ContactField, value: unknown): Record<string, unknown> {
  const valueString = typeof value === 'string' ? value : String(value ?? '')

  switch (field) {
    case 'quantity': {
      const asNumber = typeof value === 'number' ? value : Number(valueString)
      const safe = Number.isFinite(asNumber) && asNumber > 0 ? Math.floor(asNumber) : 1
      return { quantity: safe }
    }
    case 'currency': {
      const cur = valueString.toUpperCase()
      if (cur === 'EUR' || cur === 'USD') return { currency: cur }
      return {}
    }
    case 'startDate':
      return { startDate: valueString }
    case 'endDate':
      return { endDate: valueString }
    case 'email':
      return { customerEmail: valueString }
    case 'firstName':
      return { customerFirstName: valueString }
    case 'lastName':
      return { customerLastName: valueString }
    case 'phone':
      return { customerPhone: valueString }
    case 'company':
      return { customerCompany: valueString }
    case 'vatNumber':
      return { vatNumber: valueString }
    case 'poNumber':
      return { poNumber: valueString }
    case 'notes':
      return { notes: valueString }
    case 'country':
      return { address: { country: valueString } }
    case 'region':
      // Country/region selector stores "region" which maps best to address.state
      return { address: { state: valueString } }
    case 'address1':
      return { address: { address1: valueString } }
    case 'address2':
      return { address: { address2: valueString } }
    case 'city':
      return { address: { city: valueString } }
    case 'state':
      return { address: { state: valueString } }
    case 'postcode':
      return { address: { postcode: valueString } }
    case 'participants':
      // Participants should be an array of participant objects
      if (Array.isArray(value)) {
        return { participants: value }
      }
      // Try parsing if it's a JSON string
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) {
            return { participants: parsed }
    }
        } catch {
          // Invalid JSON, ignore
        }
      }
      return {}
    default:
      return {}
  }
}
