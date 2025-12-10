import React from 'react'

interface TestimonialCardProps {
  quote: string
  author: string
  position: string
  company: string
}

export function TestimonialCard({ quote, author, position, company }: TestimonialCardProps) {
  return (
    <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-secondary">
      <blockquote className="italic text-base leading-relaxed mb-5 text-gray-600">
        "{quote}"
      </blockquote>
      <cite className="not-italic text-gray-800 text-sm">
        <strong className="text-secondary">{author}</strong><br />
        {position}, {company}
      </cite>
    </div>
  )
}
