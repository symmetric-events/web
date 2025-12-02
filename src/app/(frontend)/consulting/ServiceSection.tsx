import React from 'react'
import { ServiceCard } from '../components/ServiceCard'

interface Expert {
  name: string
  specialty: string
}

interface Service {
  description: string
  imageUrl: string
  imageAlt: string
  experts: Expert[]
}

interface ServiceSectionProps {
  services: Service[]
  className?: string
}

export function ServiceSection({ services, className = "" }: ServiceSectionProps) {
  return (
    <div className={`grid grid-cols-1 gap-12 lg:grid-cols-2 ${className}`}>
      {services.map((service, index) => (
        <ServiceCard
          key={index}
          description={service.description}
          imageUrl={service.imageUrl}
          imageAlt={service.imageAlt}
          experts={service.experts}
        />
      ))}
    </div>
  )
}
