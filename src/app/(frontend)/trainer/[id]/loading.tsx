export default function TrainerPageLoading() {
  return (
    <div>
      {/* Header Section Skeleton */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            {/* Back Link Skeleton */}
            <div className="mb-6 flex justify-center">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-300"></div>
            </div>

            {/* Trainer Image Skeleton */}
            <div className="mb-8 flex justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-gray-300"></div>
            </div>

            {/* Trainer Name Skeleton */}
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-64 animate-pulse rounded bg-gray-300"></div>
            </div>

            {/* Position Skeleton */}
            <div className="mb-6 flex justify-center">
              <div className="h-8 w-48 animate-pulse rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="prose prose-lg max-w-none">
            {/* Overview Section Skeleton */}
            <div className="mb-8">
              <div className="mb-4 h-8 w-32 animate-pulse rounded bg-gray-300"></div>
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Biography Section Skeleton */}
            <div>
              <div className="mb-4 h-8 w-32 animate-pulse rounded bg-gray-300"></div>
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Courses Section Skeleton */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          {/* Section Title Skeleton */}
          <div className="mb-8 flex justify-center">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-300"></div>
          </div>

          {/* Course Cards Grid Skeleton */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
                  <div className="mb-3 h-6 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>

                  {/* Date/Time Skeleton */}
                  <div className="mb-3 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  </div>

                  {/* Description Skeleton */}
                  <div className="mb-4 flex-grow space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-full animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200"></div>
                  </div>

                  {/* Price Skeleton */}
                  <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200"></div>

                  {/* Button Skeleton */}
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Trainers CTA Skeleton */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-300"></div>
          </div>
          <div className="mb-8 flex justify-center">
            <div className="h-6 w-96 animate-pulse rounded bg-gray-300"></div>
          </div>
          <div className="flex justify-center">
            <div className="h-12 w-48 animate-pulse rounded-full bg-gray-300"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
