'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event } from '@/payload-types'

export async function getTrainerEvents(trainerId: number | string): Promise<Event[]> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch all events
  const allEventsRes = await payload.find({
    collection: 'events',
    depth: 1, // Populate categories and trainers relationships
    limit: 1000,
  })

  // Filter events where trainer is in the Trainers array
  const trainerEvents = allEventsRes.docs.filter((event: any) => {
    const trainers = event.Trainers || []
    if (trainers.length === 0) return false

    // Check if trainer ID matches (handle both populated objects and IDs)
    return trainers.some((t: any) => {
      const trainerIdValue = typeof t === 'object' && t !== null ? t.id : t
      return trainerIdValue === trainerId
    })
  }) as Event[]

  // Sort by event date (closest event first)
  trainerEvents.sort((a, b) => {
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

  return trainerEvents
}
