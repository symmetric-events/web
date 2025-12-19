'use client'

import { useEffect, useState } from 'react'
import { CourseCard } from '@/app/(frontend)/components/CourseCard'
import type { Event, Category } from '@/payload-types'
import { getRelatedEvents } from './actions'

interface RelatedEventsProps {
  eventIds: (number | string | Event)[]
}

export function RelatedEvents({ eventIds }: RelatedEventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const relatedEvents = await getRelatedEvents(eventIds)
        setEvents(relatedEvents)
      } catch (error) {
        console.error('Error fetching related events:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventIds && eventIds.length > 0) {
      fetchEvents()
    } else {
      setLoading(false)
    }
  }, [eventIds])

  if (loading) {
    return null // Or return a loading skeleton
  }

  if (events.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 py-20 mt-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Where to go from here
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            // Handle multiple date ranges - use first range when available
            const eventDates = event['Event Dates'] || []
            const firstDateRange =
              Array.isArray(eventDates) && eventDates.length > 0
                ? eventDates[0]
                : undefined

            const startDate =
              firstDateRange?.['Start Date'] || undefined
            const endDate =
              firstDateRange?.['End Date'] || undefined
            const startTime =
              firstDateRange?.['Start Time'] || undefined
            const endTime = firstDateRange?.['End Time'] || undefined

            // Featured image resolution
            const featured = event['Featured Image'] as
              | string
              | undefined
            let featuredImage: string | undefined = undefined
            if (featured) {
              featuredImage = /^https?:\/\//i.test(featured)
                ? featured
                : `/api/media/file/${encodeURIComponent(featured)}`
            }

            // Get primary category name for display
            let categoryName = ''
            if (event.category && event.category.length > 0) {
              const firstCat = event.category[0]
              if (
                typeof firstCat === 'object' &&
                firstCat !== null
              ) {
                categoryName = (firstCat as Category).name
              }
            }

            return (
              <CourseCard
                key={event.id}
                title={event.Title}
                slug={event.slug}
                status="Upcoming"
                statusColor="green"
                trainingType={event['Training Type']}
                trainingLocation={
                  event['Training Location'] || undefined
                }
                featuredImage={featuredImage}
                startDate={startDate}
                endDate={endDate}
                startTime={startTime}
                endTime={endTime}
                category={categoryName}
                description={event.Description || undefined}
                priceEUR={event.Price?.EUR}
                priceUSD={event.Price?.USD}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
