import React from 'react'
import { getPayload } from 'payload'
import config from '~/payload.config'
import { CourseList } from './CourseList'
import { PageHeader } from '../components/PageHeader'

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
      <PageHeader
        title="Training Courses"
        description="Browse our comprehensive list of pharmaceutical and biotech training courses."
        className="!pt-20 md:!pt-24"
      />

      {/* Course List Section */}
      <section className="bg-gray-50 ">
        <div className="mx-auto max-w-5xl px-5">
          <CourseList 
            events={eventsRes.docs as any} 
            categories={categoriesRes.docs as any} 
          />
        </div>
      </section>
    </div>
  )
}

