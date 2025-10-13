import React from 'react'
import { CaseStudyCard } from './CaseStudyCard'

interface CaseStudy {
  title: string
  description: string
}

interface CaseStudiesSectionProps {
  title?: string
  caseStudies: CaseStudy[]
  className?: string
}

export function CaseStudiesSection({ 
  title = "Consulting Case Studies", 
  caseStudies, 
  className = "" 
}: CaseStudiesSectionProps) {
  return (
    <section className={`py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-5">
        <h2 className="mb-16 text-center text-4xl font-bold text-gray-800">
          {title}
        </h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard
              key={index}
              title={caseStudy.title}
              description={caseStudy.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
