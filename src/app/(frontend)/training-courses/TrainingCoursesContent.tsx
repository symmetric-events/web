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

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
          className="!pt-20 md:!pt-24"
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
        className="!pt-20 md:!pt-24"
      />

      {/* Course List Section */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-5xl px-5">
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-xl text-gray-500">Loading courses...</p>
            </div>
          ) : (
            <CourseList events={events} categories={categories} />
          )}
        </div>
      </section>
    </div>
  )
}

