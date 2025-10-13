import React from 'react'
import Link from 'next/link'

interface CourseCardProps {
  title: string
  date: string
  slug: string
  status?: string
  statusColor?: 'green' | 'blue' | 'yellow' | 'red'
}

export function CourseCard({ 
  title, 
  date, 
  slug,
  status = 'Upcoming', 
  statusColor = 'green' 
}: CourseCardProps) {
  const statusColorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }
  
  return (
    <Link href={`/events/${slug}`} className="block">
      <div className="bg-white rounded-lg p-6 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg relative cursor-pointer">
        {status && (
          <div className={`absolute top-4 right-4 ${statusColorClasses[statusColor]} text-white px-2.5 py-1 rounded-full text-xs font-bold`}>
            {status}
          </div>
        )}
        <h4 className="text-lg mb-4 text-gray-800 leading-snug">{title}</h4>
        <div className="text-gray-600 text-sm font-medium">
          {date}
        </div>
      </div>
    </Link>
  )
}
