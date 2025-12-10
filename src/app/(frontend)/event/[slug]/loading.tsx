export default function EventPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative mx-auto max-w-6xl px-5 py-12">
        {/* Event Header Skeleton */}
        <div className="mt-8">
          <div className="mx-auto py-8">
            {/* Featured Image Skeleton */}
            <div className="h-64 w-full animate-pulse rounded-lg bg-gray-300"></div>
            {/* Title Skeleton */}
            <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-gray-300"></div>
          </div>
        </div>

        {/* Event Details Skeleton */}
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center">
            <div className="space-y-4">
              {/* Date Cards Skeleton */}
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-gray-200"
                  ></div>
                ))}
              </div>

              {/* Price and Currency Switcher Skeleton */}
              <div className="h-20 animate-pulse rounded-lg bg-gray-200"></div>

              {/* Buttons Skeleton */}
              <div className="space-y-4">
                <div className="h-12 w-full animate-pulse rounded-full bg-gray-200"></div>
                <div className="h-12 w-full animate-pulse rounded-full bg-gray-200"></div>
              </div>
            </div>

            {/* Training Location/Times Skeleton */}
            <div className="rounded-3xl border-2 border-gray-200 p-8">
              <div className="flex items-center justify-around">
                <div className="space-y-4">
                  <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-5 w-32 animate-pulse rounded bg-gray-200"
                      ></div>
                    ))}
                  </div>
                </div>
                {/* Image Skeleton */}
                <div className="h-32 w-32 animate-pulse rounded-lg bg-gray-200"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
