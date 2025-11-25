import React from 'react'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '~/payload.config'
import { CourseList } from './CourseList'

export const dynamic = 'force-dynamic'

export default async function TrainingCoursesPage() {
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

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 text-center text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/api/media/file/hero.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 pt-10 pb-10">
          <div className="flex flex-col items-center gap-5">
            <h1 className="mb-5 text-5xl font-bold">Training Courses</h1>
            <p className="text-xl font-medium opacity-90 max-w-2xl">
              Browse our comprehensive list of pharmaceutical and biotech training courses.
            </p>
          </div>
        </div>
      </section>

      {/* Course List Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <CourseList 
            events={eventsRes.docs as any} 
            categories={categoriesRes.docs as any} 
          />
        </div>
      </section>
    </div>
  )
}

