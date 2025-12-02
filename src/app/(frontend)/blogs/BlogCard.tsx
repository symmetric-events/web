import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { format } from 'date-fns'

interface BlogCardProps {
  slug: string
  title: string
  excerpt?: string
  featuredImageUrl?: string
  publishedAt?: string
  authorName?: string
  category?: string
  readingTime?: string
}

export const BlogCard: React.FC<BlogCardProps> = ({
  slug,
  title,
  excerpt,
  featuredImageUrl,
  publishedAt,
  authorName,
  category,
  readingTime,
}) => {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {featuredImageUrl ? (
          <Image
            src={featuredImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/20">
            <svg
              className="h-20 w-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
        
        {/* Category Badge */}
        {category && (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
            {category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-4 text-xs font-medium text-gray-500">
          {publishedAt && (
            <time dateTime={publishedAt}>
              {format(new Date(publishedAt), 'MMMM d, yyyy')}
            </time>
          )}
          {readingTime && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{readingTime} read</span>
            </>
          )}
        </div>

        <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-secondary">
          {title}
        </h3>

        {excerpt && (
          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm font-bold text-secondary group-hover:translate-x-1 transition-transform">
            Read Article →
          </span>
        </div>
      </div>
    </Link>
  )
}

