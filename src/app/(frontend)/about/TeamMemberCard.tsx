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
    <div className="text-center w-full max-w-xs mx-auto">
      <div className="relative mx-auto mb-4 h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 overflow-hidden rounded-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
        />
      </div>
      <div className="px-2">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 leading-tight">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {position}
        </p>
      </div>
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
