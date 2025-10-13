import React from 'react'
import Image from 'next/image'

interface TeamMemberCardProps {
  name: string
  position: string
  imageUrl: string
  linkedinUrl?: string
}

export function TeamMemberCard({ 
  name, 
  position, 
  imageUrl, 
  linkedinUrl 
}: TeamMemberCardProps) {
  const content = (
    <div className="text-center">
      <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <p className="text-sm">
        <strong className="text-gray-800">{name}</strong>
        <br />
        <span className="text-gray-600">{position}</span>
      </p>
    </div>
  )

  if (linkedinUrl) {
    return (
      <a 
        href={linkedinUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-105"
      >
        {content}
      </a>
    )
  }

  return content
}
