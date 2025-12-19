import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ParticipantInput = {
  name: string
  email: string
  jobPosition: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function toPositiveInt(value: string | null): number | null {
  if (!value) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const i = Math.floor(n)
  if (i <= 0) return null
  return i
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      orderId?: string | number
      sessionId?: string
      participantNumber?: number
      participant?: Partial<ParticipantInput>
    }

    const orderId = body.orderId
    const sessionId = body.sessionId
    const participantNumber = body.participantNumber
    const participant = body.participant

    if (
      (orderId === undefined || orderId === null || orderId === '') &&
      (sessionId === undefined || sessionId === null || sessionId === '')
    ) {
      return NextResponse.json({ error: 'Missing orderId or sessionId' }, { status: 400 })
    }
    if (!participantNumber || !Number.isFinite(participantNumber) || participantNumber <= 0) {
      return NextResponse.json({ error: 'Missing/invalid participantNumber' }, { status: 400 })
    }
    if (!participant) {
      return NextResponse.json({ error: 'Missing participant' }, { status: 400 })
    }

    const name = String(participant.name ?? '').trim()
    const email = String(participant.email ?? '').trim()
    const jobPosition = String(participant.jobPosition ?? '').trim()

    if (!name) return NextResponse.json({ error: 'Participant name is required' }, { status: 400 })
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Participant email is required and must be valid' }, { status: 400 })
    }
    if (!jobPosition) return NextResponse.json({ error: 'Participant jobPosition is required' }, { status: 400 })

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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const effectiveOrderId = (order as any).id
    const status = String((order as any).status ?? '')
    if (!['draft', 'pending', 'pending_invoice'].includes(status)) {
      return NextResponse.json(
        { error: 'This order can no longer be modified' },
        { status: 400 },
      )
    }

    const participantId = `${String(effectiveOrderId)}-${participantNumber}`
    const existingParticipants = Array.isArray((order as any).participants) ? (order as any).participants : []

    const nextParticipants = [...existingParticipants]
    const idx = nextParticipants.findIndex((p: any) => String(p?.participantId ?? '') === participantId)
    const nextItem = { participantId, name, email, jobPosition }

    if (idx >= 0) nextParticipants[idx] = { ...nextParticipants[idx], ...nextItem }
    else nextParticipants.push(nextItem)

    const updated = await payload.update({
      collection: 'orders',
      id: effectiveOrderId,
      data: {
        participants: nextParticipants,
        lastActivityAt: new Date().toISOString(),
      } as any,
    })

    return NextResponse.json({
      success: true,
      participantId,
      participants: (updated as any).participants ?? nextParticipants,
    })
  } catch (error) {
    console.error('Failed to upsert participant', error)
    return NextResponse.json({ error: 'Failed to upsert participant' }, { status: 500 })
  }
}
