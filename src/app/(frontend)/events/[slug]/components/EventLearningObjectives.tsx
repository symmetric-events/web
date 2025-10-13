'use client'

import { useRef, useEffect } from 'react'

interface EventLearningObjectivesProps {
  event: any;
}

export function EventLearningObjectives({
  event,
}: EventLearningObjectivesProps) {
  const learningObjectives = event["Learning Objectives"] || [];
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  // Store timeout IDs per item so we can clear/restart reliably
  const revertTimeoutsRef = useRef<Record<number, number>>({})

  if (learningObjectives.length === 0) return null;

  const handleMouseEnter = (index: number) => {
    // Clear any pending revert for this index
    const existing = revertTimeoutsRef.current[index]
    if (existing) {
      clearTimeout(existing)
      delete revertTimeoutsRef.current[index]
    }
    // Force GIF to restart by changing src every time
    const img = imgRefs.current[index];
    if (img) {
      img.src = "/img/arrow.gif?" + Date.now(); // Add timestamp to force reload
    }
  };

  // Clean up all timeouts on unmount/navigation
  useEffect(() => {
    return () => {
      Object.values(revertTimeoutsRef.current).forEach((id) => clearTimeout(id))
      revertTimeoutsRef.current = {}
    }
  }, [])

  return (
    <section className="mt-8">
      <h2 className="mb-8 text-center text-3xl font-bold">
        LEARNING OBJECTIVES
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {learningObjectives.map((objective: any, index: number) => (
          <div 
            key={index} 
            className="flex gap-4 group cursor-pointer"
            onMouseEnter={() => handleMouseEnter(index)}
          >
            <div className="flex-shrink-0">
              <img
                src="/img/learning_objective.webp"
                alt="Learning Objective"
                width={50}
                height={50}
                className="transition-all duration-300 group-hover:scale-110"
                onLoad={(e) => {
                  const imgEl = e.currentTarget
                  // Only schedule revert if the loaded src is the GIF
                  const isGif = imgEl.src.includes('arrow.gif')
                  if (!isGif) return
                  // Clear any existing scheduled revert for this index
                  const existing = revertTimeoutsRef.current[index]
                  if (existing) {
                    clearTimeout(existing)
                    delete revertTimeoutsRef.current[index]
                  }
                  const timeoutId = window.setTimeout(() => {
                    const img = imgRefs.current[index]
                    if (img) {
                      img.src = '/img/learning_objective.webp'
                    }
                    delete revertTimeoutsRef.current[index]
                  }, 360) // Duration of GIF playback; adjust to exact length
                  revertTimeoutsRef.current[index] = timeoutId
                }}
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
