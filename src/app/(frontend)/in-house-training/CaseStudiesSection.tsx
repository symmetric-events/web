import React from "react";
import { CaseStudyCard } from "./CaseStudyCard";

interface CaseStudy {
  title: string;
  description: string;
}

interface CaseStudiesSectionProps {
  title?: string;
  caseStudies: CaseStudy[];
  className?: string;
}

export function CaseStudiesSection({
  title = "Consulting Case Studies",
  caseStudies,
  className = "",
}: CaseStudiesSectionProps) {
  return (
    <section className={`mx-auto max-w-5xl py-10 ${className}`}>
      <h2 className="mb-10 text-center text-2xl text-gray-800">
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
    </section>
  );
}
