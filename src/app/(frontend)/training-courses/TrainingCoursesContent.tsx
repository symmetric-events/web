'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { CourseList } from './CourseList'
import { PageHeader } from '../components/PageHeader'
import type { Event, Category } from '~/payload-types'

// Module-level cache to persist across navigations
let cachedData: {
  events: Event[]
  categories: Category[]
  timestamp: number
} | null = null

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Export function to update cache (for prefetching)
export function updateTrainingCoursesCache(data: { events: Event[]; categories: Category[] }) {
  cachedData = {
    events: data.events,
    categories: data.categories,
    timestamp: Date.now(),
  }
}

export function TrainingCoursesContent() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize the courses data
  const memoizedCourses = useMemo(() => {
    // Check if we have valid cached data
    if (
      cachedData &&
      Date.now() - cachedData.timestamp < CACHE_DURATION
    ) {
      return {
        events: cachedData.events,
        categories: cachedData.categories,
      }
    }
    return null
  }, [])

  useEffect(() => {
    // If we have memoized data, use it immediately
    if (memoizedCourses) {
      setEvents(memoizedCourses.events)
      setCategories(memoizedCourses.categories)
      setLoading(false)
      return
    }

    // Otherwise, fetch from API
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/training-courses')
        
        if (!response.ok) {
          throw new Error('Failed to fetch training courses')
        }

        const data = await response.json()
        
        // Update cache
        cachedData = {
          events: data.events,
          categories: data.categories,
          timestamp: Date.now(),
        }

        setEvents(data.events)
        setCategories(data.categories)
        setError(null)
      } catch (err) {
        console.error('Error fetching training courses:', err)
        setError(err instanceof Error ? err.message : 'Failed to load training courses')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [memoizedCourses])

  if (error) {
    return (
      <div>
        <PageHeader
          title="Training Courses"
          description="Browse our comprehensive list of pharmaceutical and biotech training courses."
          className="pt-20 md:pt-24"
        />
        <section className="bg-gray-50">
          <div className="mx-auto max-w-5xl px-5 py-12">
            <div className="text-center">
              <p className="text-xl text-red-600">{error}</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Training Courses"
        description="Browse our comprehensive list of pharmaceutical and biotech training courses."
        className="pt-20 md:pt-24"
      />

      {/* Course List Section */}
      <section className="bg-gray-50 pb-10">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <>
              {/* Filter Buttons Skeleton */}
              <div className="mb-12 flex flex-wrap justify-center gap-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-20 animate-pulse rounded-full bg-gray-300"
                  ></div>
                ))}
              </div>

              {/* Course Cards Grid Skeleton */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    {/* Image Skeleton */}
                    <div className="relative h-32 w-full flex-shrink-0 animate-pulse bg-gray-200">
                      {/* Status Badge Skeleton */}
                      <div className="absolute top-3 right-3 h-5 w-16 animate-pulse rounded-full bg-gray-300"></div>
                      {/* Category Badge Skeleton */}
                      <div className="absolute top-3 left-3 h-5 w-20 animate-pulse rounded-full bg-gray-300"></div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex flex-grow flex-col p-5">
                      {/* Title Skeleton */}
                      <div className="mb-2 space-y-2">
                        <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
                      </div>

                      {/* Date/Time Box Skeleton */}
                      <div className="mb-4 rounded-lg bg-gray-50 p-2.5">
                        <div className="mb-1.5 flex items-center gap-2">
                          <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-300"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3.5 w-3.5 animate-pulse rounded bg-gray-300"></div>
                          <div className="h-3.5 w-24 animate-pulse rounded bg-gray-300"></div>
                        </div>
                      </div>

                      {/* Location/Type Skeleton */}
                      <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-3">
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                        <div className="h-3.5 w-20 animate-pulse rounded bg-gray-300"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CourseList events={events} categories={categories} />
          )}
        </div>
      </section>
    </div>
  )
}

