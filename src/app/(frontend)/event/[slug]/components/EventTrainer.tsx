import Link from "next/link";
import Image from "next/image";

interface EventTrainerProps {
  trainer: any;
}

export function EventTrainer({ trainer }: EventTrainerProps) {
  if (!trainer) return null;

  const slug = trainer.slug || trainer.id;

  return (
    <Link href={`/trainer/${slug}`} className="group block h-full md:w-[calc((100%_-_3rem)_/_3)]">
      <div className="flex h-full flex-col justify-around gap-2 rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Trainer Photo */}
        <div className="relative h-28 w-28 mx-auto overflow-hidden rounded-full border-2 border-gray-100">
          {(typeof trainer.image === "object" && trainer.image?.url) ||
          trainer.image_url ? (
            <Image
              src={
                (typeof trainer.image === "object" && trainer.image?.url) ||
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

        {/* Trainer Info */}
          <h3 className="text-center text-lg font-semibold">{trainer.name}</h3>
          {trainer.position && (
            <p className="text-center font-medium">{trainer.position}</p>
          )}
          {trainer.excerpt && (
            <p className="text-center line-clamp-3 text-sm leading-relaxed text-gray-600">
              {trainer.excerpt}
            </p>
          )}
          {!trainer.excerpt && trainer.biography && (
            <p className="text-center line-clamp-3 text-sm leading-relaxed text-gray-600">
              {trainer.biography}
            </p>
          )}
          <p className="text-center text-sm font-medium text-blue-600 group-hover:underline">
            Learn More →
          </p>
      </div>
    </Link>
  );
}
