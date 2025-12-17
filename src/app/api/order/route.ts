import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '~/payload.config'
import { getPriceForQuantity } from '~/lib/pricing'

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
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    const payload = await getPayload({ config })
    const order = await payload.findByID({ collection: 'orders', id: String(orderId) })
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
    }

    const eventId = String(body.eventId ?? '').trim()
    const eventDateId = String(body.eventDateId ?? '').trim()
    const quantity = toPositiveInt(body.quantity, 1)
    const email = body.email ? String(body.email).trim() : undefined

    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
    if (!eventDateId) return NextResponse.json({ error: 'Missing eventDateId' }, { status: 400 })

    const payload = await getPayload({ config })
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

    const created = await payload.create({
      collection: 'orders',
      data: {
        sessionId: newSessionId(),
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
      } as any,
    })

    return NextResponse.json({ success: true, orderId: (created as any).id })
  } catch (error) {
    console.error('Failed to create order', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}


