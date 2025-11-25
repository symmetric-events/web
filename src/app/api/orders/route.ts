
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '~/payload.config'
import { buildAirtablePayload } from '~/lib/airtable'
import { env } from '~/env'
import { getPriceFromDates } from '~/lib/pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


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
        airtablePayload: airtablePayload
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

    return NextResponse.json({ error: 'Missing orderId or sessionId' }, { status: 400 })
  } catch (error) {
    console.error('Failed to fetch order', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, sessionId, field, value } = body as { orderId?: string; sessionId?: string; field: string; value: unknown }

    if (!field) {
      return NextResponse.json({ error: 'Missing field' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Special test Airtable branch
    if (field === 'test_airtable') {
      // Get latest order
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
      
      // Post to Hookdeck webhook
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
          webhookResult: result
        })
      } catch (error) {
        console.error('Failed to post to webhook:', error)
        return NextResponse.json({ 
          error: 'Failed to post to webhook', 
          details: error instanceof Error ? error.message : 'Unknown error',
          airtablePayload: airtablePayload
        }, { status: 500 })
      }
    }

    // Special create-from-event branch
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

      // Derive price globally from event duration (2-day / 3-day pricing)
      const eventDates = eventDoc?.['Event Dates'] || []
      const firstDateRange =
        Array.isArray(eventDates) && eventDates.length > 0
          ? eventDates[0]
          : undefined
      const startISO = firstDateRange?.['Start Date']
      const endISO = firstDateRange?.['End Date']
      const derivedPrice = getPriceFromDates(startISO, endISO)

      // Prices in both currencies (same numeric value for simplicity)
      const priceEUR = derivedPrice
      const priceUSD = derivedPrice
      // Prepare order data
      const data: any = {
        status: 'draft',
        eventId: String(eventDoc.id ?? eventDoc._id ?? eventDoc.slug ?? ''),
        eventTitle: String(eventDoc['Title'] ?? eventDoc.title ?? 'Event'),
        eventSlug: slug,
        currency: "EUR",
        priceEUR,
        priceUSD,
        quantity: 1,
        totalAmount: priceEUR,
        lastActivityAt: new Date().toISOString(),
      }

      if (orderId) {
        const updated = await payload.update({ collection: 'orders', id: orderId, data })
        return NextResponse.json({ orderId: (updated as any).id })
      }

      if (sessionId) {
        const existing = await payload.find({
          collection: 'orders',
          where: { and: [{ sessionId: { equals: sessionId } }, { status: { equals: 'draft' } }] },
          limit: 1,
        })
        const doc = existing.docs?.[0]
        if (doc) {
          const updated = await payload.update({ collection: 'orders', id: (doc as any).id, data })
          return NextResponse.json({ orderId: (updated as any).id })
        }
      }

      // Create new draft if none found
      const created = await payload.create({
        collection: 'orders',
        data: {
          sessionId: sessionId || `${Date.now()}`,
          ...data,
        },
      })
      return NextResponse.json({ orderId: (created as any).id })
    }

    // Otherwise, try to find an existing draft by sessionId
    if (sessionId) {
      const existing = await payload.find({
        collection: 'orders',
        where: {
          and: [
            { sessionId: { equals: sessionId } },
            { status: { equals: 'draft' } },
          ],
        },
        limit: 1,
      })
      const doc = existing.docs?.[0]
      if (doc) {
        const baseData = mapFieldToOrderData(field, value) as any

        // Recompute totals when quantity or currency changes
        const nextData: any = { ...baseData }
        const currentQuantity = typeof doc.quantity === 'number' ? doc.quantity : 1
        const quantityFromUpdate = typeof (baseData?.quantity) === 'number' ? baseData.quantity : undefined
        const nextQuantity = typeof quantityFromUpdate === 'number' ? quantityFromUpdate : currentQuantity

        const currentCurrency = typeof doc.currency === 'string' ? doc.currency : 'EUR'
        const currencyFromUpdate = typeof (baseData?.currency) === 'string' ? baseData.currency : undefined
        const nextCurrency = currencyFromUpdate ?? currentCurrency

        if (['quantity', 'currency'].includes(field)) {
          const unit = nextCurrency === 'EUR' ? (doc as any).priceEUR ?? 0 : (doc as any).priceUSD ?? 0
          nextData.totalAmount = unit * nextQuantity
        }

        const updated = await payload.update({
          collection: 'orders',
          id: doc.id,
          data: nextData,
        })
        return NextResponse.json({ orderId: (updated as any).id })
      }
    }

  } catch (error) {
    console.error('Failed to save draft field', error)
    return NextResponse.json({ error: 'Failed to save draft field' }, { status: 500 })
  }
}

function mapFieldToOrderData(field: string, value: unknown) {
  const valueString = typeof value === 'string' ? value : String(value ?? '')
  switch (field) {
    case 'email':
      return { customerEmail: valueString };
    case 'firstName':
      return { customerFirstName: valueString };
    case 'lastName':
      return { customerLastName: valueString };
    case 'phone':
      return { customerPhone: valueString };
    case 'company':
      return { customerCompany: valueString };
    case 'vatNumber':
      return { vatNumber: valueString };
    case 'notes':
      return { notes: valueString };
    case 'country':
      return { address: { country: valueString } };
    case 'address1':
      return { address: { address1: valueString } };
    case 'address2':
      return { address: { address2: valueString } };
    case 'city':
      return { address: { city: valueString } };
    case 'state':
      return { address: { state: valueString } };
    case 'postcode':
      return { address: { postcode: valueString } };
    case 'startDate':
      return { startDate: valueString };
    case 'endDate':
      return { endDate: valueString };
    case 'currency':
      return { currency: valueString };
    case 'quantity': {
      const asNumber = typeof value === 'number' ? value : Number(valueString)
      const safe = Number.isFinite(asNumber) && asNumber > 0 ? Math.floor(asNumber) : 1
      return { quantity: safe }
    }
    default:
      return {};
  }

}
