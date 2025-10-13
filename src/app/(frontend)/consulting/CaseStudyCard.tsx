import React from 'react'

interface CaseStudyCardProps {
  title: string
  description: string
}

export function CaseStudyCard({ title, description }: CaseStudyCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-bold text-gray-800">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  )
}
