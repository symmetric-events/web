'use client'

import { useEffect } from 'react'
import { updateTrainingCoursesCache } from '../training-courses/TrainingCoursesContent'

// This component prefetches training courses data when mounted
// The data is cached and will be available when navigating to /training-courses
export function PrefetchTrainingCourses() {
  useEffect(() => {
    // Prefetch training courses data in the background
    // This will populate the cache used by TrainingCoursesContent
    fetch('/api/training-courses')
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Failed to prefetch')
      })
      .then((data) => {
        // Update the cache so it's available when navigating to /training-courses
        updateTrainingCoursesCache({
          events: data.events,
          categories: data.categories,
        })
      })
      .catch((err) => {
        // Silently fail - prefetch is optional
        console.debug('Prefetch training courses failed:', err)
      })
  }, [])

  return null // This component doesn't render anything
}

