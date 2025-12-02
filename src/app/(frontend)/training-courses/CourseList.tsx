'use client'

import React, { useState } from 'react'
import { Button } from '../components/Button'
import { CourseCard } from '../components/CourseCard'
import type { Event, Category } from '~/payload-types'

interface CourseListProps {
  events: Event[]
  categories: Category[]
}

export function CourseList({ events, categories }: CourseListProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filteredEvents = events.filter((event) => {
    if (activeCategory === 'all') return true

    // Check if event has the active category
    const eventCategories = event.category || []
    return eventCategories.some((cat) => {
      // Handle both populated (object) and unpopulated (ID) relationships
      if (typeof cat === 'object' && cat !== null) {
        return (cat as Category).slug === activeCategory
      }
      return false // Can't filter by ID if we only have slug in state, assume populated
    })
  })

  // Sort events by date if needed, but they should come sorted from server
  // The HomePage sorted by -createdAt, maybe we want by Start Date here? 
  // Usually upcoming courses are sorted by start date ascending.
  // I'll assume server provides them in a reasonable order or I can sort here.
  // For now, let's trust server order or sort by startDate.
  
  const sortedEvents = [...filteredEvents].sort((a, b) => {
     const dateA = a['Event Dates']?.[0]?.['Start Date']
     const dateB = b['Event Dates']?.[0]?.['Start Date']
     if (!dateA) return 1
     if (!dateB) return -1
     return new Date(dateA).getTime() - new Date(dateB).getTime()
  })


  return (
    <>
      {/* Filters */}
      <div className="mb-12 flex flex-wrap justify-center gap-2.5">
        <Button
          variant={activeCategory === 'all' ? 'filter-active' : 'filter'}
          size="sm"
          onClick={() => setActiveCategory('all')}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.slug ? 'filter-active' : 'filter'}
            size="sm"
            onClick={() => setActiveCategory(category.slug)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => {
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
            const startTime = firstDateRange?.['Start Time'] || undefined
            const endTime = firstDateRange?.['End Time'] || undefined

            // Featured image resolution
            const featured = event['Featured Image'] as string | undefined
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
               if (typeof firstCat === 'object' && firstCat !== null) {
                 categoryName = (firstCat as Category).name
               }
            }

            return (
              <CourseCard
                key={event.id}
                title={event.Title}
                slug={event.slug}
                status="Upcoming" // You might want to calculate this based on date
                statusColor="green"
                trainingType={event['Training Type']}
                trainingLocation={event['Training Location'] || undefined}
                featuredImage={featuredImage}
                startDate={startDate}
                endDate={endDate}
                startTime={startTime}
                endTime={endTime}
                category={categoryName}
              />
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-gray-500">No training courses found for this category.</p>
          </div>
        )}
      </div>
    </>
  )
}

