import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getPriceForQuantity } from '@/lib/pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function newSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function toPositiveInt(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? ''))
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.floor(n)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const sessionId = searchParams.get('sessionId')

    if (!orderId && !sessionId) {
      return NextResponse.json({ error: 'Missing orderId or sessionId' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    let order
    if (orderId) {
      order = await payload.findByID({ collection: 'orders', id: String(orderId) })
    } else if (sessionId) {
      const result = await payload.find({
        collection: 'orders',
        where: {
          sessionId: {
            equals: sessionId,
          },
        },
        limit: 1,
      })
      order = result.docs[0]
    }

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to fetch order', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

/**
 * Create an order (called once per order).
 *
 * Payload:
 * - email (optional)
 * - eventDateId
 * - quantity
 * - eventId
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string
      eventDateId?: string
      quantity?: number
      eventId?: string
      sessionId?: string
    }

    const eventId = String(body.eventId ?? '').trim()
    const eventDateId = String(body.eventDateId ?? '').trim()
    const quantity = toPositiveInt(body.quantity, 1)
    const email = body.email ? String(body.email).trim() : undefined
    const sessionId = body.sessionId ? String(body.sessionId).trim() : undefined

    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
    if (!eventDateId) return NextResponse.json({ error: 'Missing eventDateId' }, { status: 400 })

    const payload = await getPayload({ config })

    // Check if order with this sessionId already exists
    let existingOrder = null
    if (sessionId) {
      const result = await payload.find({
        collection: 'orders',
        where: {
          sessionId: {
            equals: sessionId,
          },
        },
        limit: 1,
      })
      existingOrder = result.docs[0]
    }

    const eventDoc = await payload.findByID({ collection: 'events', id: eventId })
    if (!eventDoc) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const eventDates = (eventDoc as any)?.['Event Dates'] || []
    const match = Array.isArray(eventDates)
      ? eventDates.find((r: any, idx: number) => String(r?.id ?? idx) === eventDateId)
      : undefined

    const startISO = match?.['Start Date']
    const endISO = match?.['End Date']
    if (!startISO || !endISO) {
      return NextResponse.json({ error: 'Invalid eventDateId (missing dates)' }, { status: 400 })
    }

    // Currency is not part of the create payload; default to EUR for storage.
    const currencyCode: 'EUR' | 'USD' = 'EUR'
    const currencySymbol: '€' | '$' = currencyCode === 'EUR' ? '€' : '$'

    // Store a draft total at creation time (no early bird here). Checkout will be source of truth.
    const totalAmount = getPriceForQuantity(startISO, endISO, quantity, { currency: currencySymbol })
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid price calculation for this event date' },
        { status: 400 },
      )
    }

    const orderData = {
      sessionId: sessionId || newSessionId(),
      status: 'draft',
      eventId: String((eventDoc as any).id ?? eventId),
      eventTitle: String((eventDoc as any)['Title'] ?? (eventDoc as any).title ?? 'Event'),
      eventSlug: String((eventDoc as any).slug ?? ''),
      eventDateId,
      startDate: startISO,
      endDate: endISO,
      quantity,
      currency: currencyCode,
      totalAmount,
      customerEmail: email,
      lastActivityAt: new Date().toISOString(),
    } as any

    let order
    if (existingOrder) {
      order = await payload.update({
        collection: 'orders',
        id: existingOrder.id,
        data: orderData,
      })
    } else {
      order = await payload.create({
        collection: 'orders',
        data: orderData,
      })
    }

    return NextResponse.json({
      success: true,
      orderId: (order as any).id,
      sessionId: (order as any).sessionId,
    })
  } catch (error) {
    console.error('Failed to create order', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}


