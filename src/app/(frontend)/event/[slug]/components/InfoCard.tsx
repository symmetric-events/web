import React from 'react'

interface InfoCardProps {
  title: string
  description: string
  className?: string
}

export function InfoCard({ title, description, className = '' }: InfoCardProps) {
  return (
    <div
      className={`rounded-lg border border-secondary bg-secondary/10 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${className}`}
    >
      <h3 className="mb-3 font-semibold text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
