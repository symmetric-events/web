import React from 'react'
import Image from 'next/image'

interface Expert {
  name: string
  specialty: string
}

interface ServiceCardProps {
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  experts: Expert[]
}

export function ServiceCard({ 
  title, 
  description, 
  imageUrl, 
  imageAlt, 
  experts 
}: ServiceCardProps) {
  return (
    <div className="space-y-6">
      <div className="relative h-44 w-full overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
        />
      </div>
      <div>
        <h3 className="mb-4 text-2xl font-bold text-gray-800">
          {title}
        </h3>
        <p className="mb-4 text-gray-600">
          {description}
        </p>
        <div className="space-y-2 text-sm">
          {experts.map((expert, index) => (
            <p key={index}>
              <strong>{expert.name}</strong> – {expert.specialty}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
