import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '~/payload.config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').trim()
    if (!code) {
      return NextResponse.json({ valid: false, message: 'Missing code' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'discount-codes',
      where: {
        and: [
          { code: { equals: code } },
          { active: { equals: true } },
        ],
      },
      limit: 1,
    })

    const doc = found.docs?.[0] as any
    if (!doc) {
      return NextResponse.json({ valid: false, message: 'Invalid code' }, { status: 404 })
    }

    // Check expiry
    if (doc.expiresAt) {
      const now = new Date()
      const exp = new Date(doc.expiresAt)
      if (isFinite(exp.getTime()) && exp.getTime() < now.getTime()) {
        return NextResponse.json({ valid: false, message: 'Code expired' }, { status: 410 })
      }
    }

    // Check uses only if limitedUsage is true
    if (doc.limitedUsage) {
      const remaining = typeof doc.usesLeft === 'number' ? doc.usesLeft : 0
      if (remaining < 1) {
        return NextResponse.json({ valid: false, message: 'Code has no uses left' }, { status: 409 })
      }
    }

    const result = {
      valid: true,
      code: String(doc.code),
      type: String(doc.type) as 'percentage' | 'flat',
      value: Number(doc.value) || 0,
      message: 'OK',
      limitedUsage: Boolean(doc.limitedUsage),
      usesLeft: typeof doc.usesLeft === 'number' ? doc.usesLeft : null,
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to validate discount code', error)
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 })
  }
}


