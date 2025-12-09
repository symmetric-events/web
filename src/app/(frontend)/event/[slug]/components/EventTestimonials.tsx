interface EventTestimonialsProps {
  event: any
}

export function EventTestimonials({ event }: EventTestimonialsProps) {
  const testimonials = event.Testimonials || []

  if (testimonials.length === 0) return null

  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">TESTIMONIALS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial: any, index: number) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xl">★</span>
                ))}
              </div>
            </div>
            <blockquote className="text-gray-700 italic mb-4">
              "{testimonial.quote}"
            </blockquote>
            <div className="flex items-center gap-3">
              {testimonial.photo && (
                <img
                  src={typeof testimonial.photo === 'string' ? testimonial.photo : testimonial.photo.url}
                  alt={testimonial.name || 'Testimonial author'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                {testimonial.company && (
                  <p className="text-sm text-gray-600">
                    {testimonial.company}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
