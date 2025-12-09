import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '~/payload.config'
import { getPriceForQuantity, type Currency } from '~/lib/pricing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Check if event is 3+ months away from today
 */
function isEarlyBirdEligible(startDate: string): boolean {
  const eventStart = new Date(startDate)
  const today = new Date()
  
  // Normalize to midnight to avoid time issues
  const eventMidnight = new Date(
    eventStart.getFullYear(),
    eventStart.getMonth(),
    eventStart.getDate(),
  )
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
  
  // Calculate months difference
  const monthsDiff =
    (eventMidnight.getFullYear() - todayMidnight.getFullYear()) * 12 +
    (eventMidnight.getMonth() - todayMidnight.getMonth())
  
  // Also account for days in the month
  const daysDiff = eventMidnight.getDate() - todayMidnight.getDate()
  const adjustedMonthsDiff = monthsDiff + (daysDiff >= 0 ? 0 : -1)
  
  return adjustedMonthsDiff >= 3
}

/**
 * Get early bird discount amount
 * -100 EUR/USD if 1 participant
 * -200 EUR/USD if 2 or more participants
 * Only applies if total participants (including current quantity) <= 5
 */
function getEarlyBirdDiscount(
  quantity: number,
  currentParticipantCount: number,
): number {
  const totalParticipants = currentParticipantCount + quantity
  
  // Early bird only applies to first 5 participants
  if (totalParticipants > 5) {
    return 0
  }
  
  if (quantity === 1) {
    return 100
  }
  
  if (quantity >= 2) {
    return 200
  }
  
  return 0
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { searchParams } = new URL(request.url)
    const { slug } = await params
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const quantityParam = searchParams.get('quantity')
    const quantity = quantityParam ? parseInt(quantityParam, 10) : 1
    const currency = (searchParams.get('currency') as Currency) || '€'

    if (!slug) {
      return NextResponse.json(
        { error: 'Event slug is required' },
        { status: 400 },
      )
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 },
      )
    }

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Count confirmed participants for this event date
    const confirmedOrders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { eventSlug: { equals: slug } },
          { startDate: { equals: startDate } },
          { endDate: { equals: endDate } },
          {
            or: [
              { status: { equals: 'paid' } },
              { status: { equals: 'pending' } },
            ],
          },
        ],
      },
      limit: 1000, // Get all matching orders
    })

    // Sum up quantities from confirmed orders
    const participantCount = confirmedOrders.docs.reduce(
      (sum, order) => sum + (order.quantity || 0),
      0,
    )

    // Check if early bird is eligible (3+ months away)
    const eligible = isEarlyBirdEligible(startDate)

    // Get base price for the quantity
    const basePrice = getPriceForQuantity(startDate, endDate, quantity, { currency })

    // Calculate early bird discount if eligible
    const earlyBirdDiscount = eligible
      ? getEarlyBirdDiscount(quantity, participantCount)
      : 0

    // Calculate final price
    const finalPrice = Math.max(0, basePrice - earlyBirdDiscount)

    // Calculate remaining early bird spots
    const remainingEarlyBirdSpots = Math.max(
      0,
      5 - participantCount,
    )

    return NextResponse.json({
      slug,
      startDate,
      endDate,
      quantity,
      basePrice,
      earlyBirdEligible: eligible,
      earlyBirdDiscount,
      finalPrice,
      participantCount,
      remainingEarlyBirdSpots,
      // Indicate if current order would get early bird
      wouldGetEarlyBird: eligible && earlyBirdDiscount > 0,
    })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing information' },
      { status: 500 },
    )
  }
}

