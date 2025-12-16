import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '~/payload.config'
import { buildAirtablePayload } from '~/lib/airtable'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Allowed fields for contact information updates
const ALLOWED_CONTACT_FIELDS = [
  'email',
  'firstName',
  'lastName',
  'phone',
  'company',
  'vatNumber',
  'poNumber',
  'notes',
  'country',
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

    // Validate field is allowed for contact updates
    if (!ALLOWED_CONTACT_FIELDS.includes(field as ContactField)) {
      return NextResponse.json(
        { error: `Field '${field}' is not allowed. Only contact information fields can be updated.` },
        { status: 400 },
      )
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
