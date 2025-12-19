import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { PageHeader } from '../components/PageHeader'
import { BlogCard } from './BlogCard'
import type { Blog, Category } from '@/payload-types'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const blogsRes = await payload.find({
    collection: 'blog',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    depth: 1,
    limit: 100,
  })

  const blogs = blogsRes.docs as Blog[]

  return (
    <div>
      <PageHeader
        title="Latest Insights & News"
        description="Explore our latest articles on pharmaceutical development, regulatory updates, and industry trends."
        className="pt-20 md:pt-24"
      />

      <section className="bg-gray-50 py-10 max-w-5xl mx-auto">
        <div className="mx-auto max-w-6xl px-5">
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => {
                // Resolve featured image URL
                let featuredImageUrl = blog.featuredImageUrl
                if (!featuredImageUrl && blog.featuredImage) {
                  if (typeof blog.featuredImage === 'string') {
                    // If it's an ID, we might need to fetch or use API route (simplified here)
                    // In depth=1, it should be an object if relation is populated
                  } else if (typeof blog.featuredImage === 'object' && blog.featuredImage.url) {
                    featuredImageUrl = blog.featuredImage.url
                  }
                }

                // Resolve primary category
                let categoryName = ''
                if (blog.categories && blog.categories.length > 0) {
                  const firstCat = blog.categories[0]
                  if (typeof firstCat === 'object' && firstCat !== null) {
                    categoryName = (firstCat as Category).name
                  }
                }

                return (
                  <BlogCard
                    key={blog.id}
                    slug={blog.slug}
                    title={blog.title}
                    excerpt={blog.excerpt || undefined}
                    featuredImageUrl={featuredImageUrl || undefined}
                    publishedAt={blog.publishedAt || blog.createdAt}
                    authorName={blog.authorName || undefined}
                    category={categoryName}
                    readingTime={blog.readingTime || undefined}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No articles found
              </h3>
              <p className="mt-1 text-gray-500">
                Check back soon for new updates.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

