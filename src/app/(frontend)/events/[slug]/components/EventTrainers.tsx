import Link from 'next/link'
import Image from 'next/image'

interface EventTrainersProps {
  event: any
}

export function EventTrainers({ event }: EventTrainersProps) {
  const trainers = event.Trainers || []

  if (trainers.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">TRAINERS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer: any, index: number) => {
          const slug = trainer.slug || trainer.id
          
          return (
          <Link 
            key={index} 
            href={`/trainer/${slug}`}
            className="block group"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {/* Trainer Photo */}
              <div className="mb-4 flex justify-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                  {(typeof trainer.image === 'object' && trainer.image?.url) || trainer.image_url ? (
                    <Image
                      src={(typeof trainer.image === 'object' && trainer.image?.url) || trainer.image_url || ""}
                      alt={trainer.name || 'Trainer photo'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-2xl font-bold">
                        {trainer.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trainer Info */}
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">
                  {trainer.name}
                </h3>
                {trainer.position && (
                  <p className="font-medium mb-3">
                    {trainer.position}
                  </p>
                )}
                {trainer.excerpt && (
                  <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {trainer.excerpt}
                  </p>
                )}
                {!trainer.excerpt && trainer.biography && (
                  <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {trainer.biography}
                  </p>
                )}
              </div>

              {/* Read More Indicator */}
              <div className="mt-4 text-center">
                <span className="text-blue-600 text-sm font-medium group-hover:underline">
                  Learn More →
                </span>
              </div>
            </div>
          </Link>
        )})}
      </div>
    </section>
  )
}
