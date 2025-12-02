import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '~/payload.config'

export async function GET() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Fetch all categories
    const categoriesRes = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'name',
    })

    // Fetch all events
    const eventsRes = await payload.find({
      collection: 'events',
      limit: 1000,
      depth: 1, // Necessary to populate categories for filtering
      sort: '-createdAt', // Default sort, CourseList re-sorts by date
    })

    return NextResponse.json({
      events: eventsRes.docs,
      categories: categoriesRes.docs,
    })
  } catch (error) {
    console.error('Error fetching training courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training courses' },
      { status: 500 }
    )
  }
}

