import React from 'react'

export default function TrainingCoursesLoading() {
  return (
    <div>
      {/* PageHeader Skeleton */}
      <section className="bg-primary pb-12 pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <div className="mb-6 animate-pulse">
              <div className="mx-auto h-9 w-64 bg-gray-300 rounded"></div>
            </div>
            <div className="mx-auto max-w-3xl animate-pulse">
              <div className="mx-auto h-5 w-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Course List Section Skeleton */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-5xl px-5 py-12">
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
        </div>
      </section>
    </div>
  )
}

