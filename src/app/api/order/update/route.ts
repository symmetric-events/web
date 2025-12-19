import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getPriceForQuantity, type Currency } from '@/lib/pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_UPDATE_FIELDS = new Set([
  // order basics
  'quantity',
  'currency',
  'eventDateId',
  'startDate',
  'endDate',
  'paymentMethod',

  // contact
  'customerEmail',
  'customerFirstName',
  'customerLastName',
  'customerPhone',
  'customerCompany',

  // billing
  'vatNumber',
  'poNumber',
  'notes',

  // address group
  'address',

  // participants array
  'participants',
  'sessionId',
])

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown> & {
      orderId?: string | number
      sessionId?: string
    }
    const orderId = body.orderId
    const sessionId = body.sessionId

    if (
      (orderId === undefined || orderId === null || orderId === '') &&
      (sessionId === undefined || sessionId === null || sessionId === '')
    ) {
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

    // Build update payload with allowlist
    const data: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (key === 'orderId') continue
      if (!ALLOWED_UPDATE_FIELDS.has(key)) continue
      data[key] = value
    }

    // Merge address updates to avoid clobbering fields
    if (data.address && typeof data.address === 'object' && data.address !== null) {
      data.address = { ...((order as any).address ?? {}), ...(data.address as any) }
    }

    // Recalculate totalAmount if currency changes
    if ('currency' in data && typeof data.currency === 'string') {
      const newCurrency = data.currency.toUpperCase()
      const currencySymbol: Currency = newCurrency === 'USD' ? '$' : '€'
      
      // Get current order values (use updated values if they're in the update)
      const startDate = (data.startDate as string) ?? (order as any).startDate
      const endDate = (data.endDate as string) ?? (order as any).endDate
      const quantity = typeof data.quantity === 'number' ? data.quantity : ((order as any).quantity ?? 1)
      
      // Only recalculate if we have dates
      if (startDate && endDate) {
        const newTotal = getPriceForQuantity(startDate, endDate, quantity, { currency: currencySymbol })
        data.totalAmount = newTotal
      }
    }

    // Always update lastActivityAt
    data.lastActivityAt = new Date().toISOString()

    if (Object.keys(data).length === 1 && 'lastActivityAt' in data) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await payload.update({
      collection: 'orders',
      id: String((order as any).id),
      data: data as any,
    })

    return NextResponse.json({
      success: true,
      orderId: (updated as any).id,
      sessionId: (updated as any).sessionId,
    })
  } catch (error) {
    console.error('Failed to update order', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}


