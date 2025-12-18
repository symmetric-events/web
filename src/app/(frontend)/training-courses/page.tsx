import React, { Suspense } from 'react'
import { TrainingCoursesContent } from './TrainingCoursesContent'

export default function TrainingCoursesPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 md:pt-24">
        <div className="bg-gray-50 py-12">
          <div className="mx-auto max-w-5xl px-5">
            <div className="text-center">
              <p className="text-xl text-gray-500">Loading training courses...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <TrainingCoursesContent />
    </Suspense>
  )
}

