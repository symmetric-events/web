'use client'

import { useRef, useEffect } from 'react'

interface EventLearningObjectivesProps {
  event: any;
}

export function EventLearningObjectives({
  event,
}: EventLearningObjectivesProps) {
  const learningObjectives = event["Learning Objectives"] || [];

  if (learningObjectives.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-8 text-center text-3xl font-bold">
        LEARNING OBJECTIVES
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {learningObjectives.map((objective: any, index: number) => (
          <div 
            key={index} 
            className="flex gap-4 group cursor-pointer justify-center items-center"
          >
            <div className="flex-shrink-0">
              <img
                src="https://www.symmetric.events/wp-content/uploads/2025/12/learning_objective.png"
                alt="Learning Objective"
                width={50}
                height={50}
                className="transition-all duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold">{objective.Title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {objective.Description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
