'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event } from '@/payload-types'

export async function getRelatedEvents(eventIds: (number | string | Event)[]): Promise<Event[]> {
  if (!eventIds || eventIds.length === 0) {
    return []
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Extract actual IDs from the array (handle both IDs and populated objects)
  const ids = eventIds.map((item) => {
    if (typeof item === 'object' && item !== null && 'id' in item) {
      return item.id
    }
    return item
  }).filter((id): id is number | string => id !== null && id !== undefined)

  if (ids.length === 0) {
    return []
  }

  // Fetch all events and filter by IDs (Payload may not support 'in' operator)
  const eventsRes = await payload.find({
    collection: 'events',
    depth: 1, // Populate categories and trainers relationships
    limit: 1000,
  })

  // Filter events that match the provided IDs
  const events = eventsRes.docs.filter((event: any) => {
    return ids.includes(event.id)
  }) as Event[]

  // Sort by event date (closest event first)
  events.sort((a, b) => {
    const now = new Date().getTime()

    // Helper function to get the earliest future date from an event
    const getEarliestFutureDate = (event: any): number | null => {
      const eventDates = event['Event Dates'] || []
      if (!Array.isArray(eventDates) || eventDates.length === 0) {
        return null // No dates
      }

      let earliestFutureDate: number | null = null

      for (const dateRange of eventDates) {
        const startDateStr = dateRange?.['Start Date']
        if (!startDateStr) continue

        const startDate = new Date(startDateStr).getTime()

        // Only consider future dates
        if (startDate >= now) {
          if (earliestFutureDate === null || startDate < earliestFutureDate) {
            earliestFutureDate = startDate
          }
        }
      }

      return earliestFutureDate
    }

    const dateA = getEarliestFutureDate(a)
    const dateB = getEarliestFutureDate(b)

    // Events without dates go to the end
    if (dateA === null && dateB === null) return 0
    if (dateA === null) return 1 // a goes after b
    if (dateB === null) return -1 // b goes after a

    // Sort by date (earliest first)
    return dateA - dateB
  })

  return events
}
