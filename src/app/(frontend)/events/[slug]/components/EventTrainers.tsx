import Link from "next/link";
import Image from "next/image";

interface EventTrainersProps {
  event: any;
}

export function EventTrainers({ event }: EventTrainersProps) {
  const trainers = event.Trainers || [];

  if (trainers.length === 0) return null;

  // If 2 trainers, they take 2/3 width, video takes 1/3
  // Otherwise, trainers take 1/3 width, video takes 2/3
  const trainersWidth = trainers.length === 2 ? "md:w-2/3" : "md:w-1/3";
  const videoWidth = trainers.length === 2 ? "md:w-1/3" : "md:w-2/3";

  return (
    <section className="mt-8">
      <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
        TRAINERS
      </h2>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Trainers Container */}
        <div className={`w-full space-y-6 ${trainersWidth}`}>
          {trainers.map((trainer: any, index: number) => {
            const slug = trainer.slug || trainer.id;

            return (
              <Link key={index} href={`/trainer/${slug}`} className="group block">
                <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  {/* Trainer Photo */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-100">
                      {(typeof trainer.image === "object" &&
                        trainer.image?.url) ||
                      trainer.image_url ? (
                        <Image
                          src={
                            (typeof trainer.image === "object" &&
                              trainer.image?.url) ||
                            trainer.image_url ||
                            ""
                          }
                          alt={trainer.name || "Trainer photo"}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <div className="text-2xl font-bold text-gray-400">
                            {trainer.name?.charAt(0).toUpperCase() || "T"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trainer Info */}
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold">{trainer.name}</h3>
                    {trainer.position && (
                      <p className="mb-3 font-medium">{trainer.position}</p>
                    )}
                    {trainer.excerpt && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                        {trainer.excerpt}
                      </p>
                    )}
                    {!trainer.excerpt && trainer.biography && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                        {trainer.biography}
                      </p>
                    )}
                  </div>

                  {/* Read More Indicator */}
                  <div className="mt-4 text-center">
                    <span className="text-sm font-medium text-blue-600 group-hover:underline">
                      Learn More →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Video Container */}
        <div className={`w-full ${videoWidth}`}>
          <div className="aspect-video w-full">
            <iframe
              src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="h-full w-full"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
