import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "~/payload.config";
import { EventDetails } from "./components/EventDetails";
import { EventPricing } from "./components/EventPricing";
import { EventWhyAttend } from "./components/EventWhyAttend";
import { EventTrainingExperience } from "./components/EventTrainingExperience";
import { EventLearningObjectives } from "./components/EventLearningObjectives";
import { EventWhoIsTrainingFor } from "./components/EventWhoIsTrainingFor";
import { EventKeyTopics } from "./components/EventKeyTopics";
import { EventTrainer } from "./components/EventTrainer";
import { EventTestimonials } from "./components/EventTestimonials";
import { EventHeader } from "./components/EventHeader";
import { EditButton } from "~/app/(frontend)/components/EditButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const payload = await getPayload({ config: await config });

  try {
    const eventRes = await payload.find({
      collection: "events",
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 2,
      limit: 1,
    });

    const event = eventRes.docs[0];

    if (!event) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative mx-auto max-w-6xl px-5 py-12">
          {/* Edit Button - Only show if authenticated */}
          <EditButton collection="events" id={event.id} />
          <EventHeader event={event} />
          <EventDetails event={event} />
          <br />
          <EventWhyAttend event={event} />
          <br />
          <EventTrainingExperience event={event} />
          <br />
          <EventLearningObjectives event={event} />
          <br />
          <EventWhoIsTrainingFor event={event} />
          <br />
          <EventKeyTopics event={event} />
          <br />
          {/* Trainers, Video, and Sneak Peek Section */}
          {(() => {
            const trainerCount = event.Trainers?.length || 0;
            const hasVideo = !!event.video;
            const hasSneakPeek = !!event.sneekPeek?.imageUrl;

            // Only show section if at least one item exists
            if (trainerCount === 0 && !hasVideo && !hasSneakPeek) {
              return null;
            }

            return (
              <div className="pt-12">
                {/* Title Row */}
                {trainerCount > 0 && (
                  <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                    TRAINER{trainerCount > 1 ? "S" : ""}
                  </h2>
                )}

                {/* Cards Row - 1/3 per item */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
                  {/* Trainers - 1/3 each */}
                  {event.Trainers?.map((trainer: any) => (
                    <EventTrainer key={trainer.id} trainer={trainer} />
                  ))}

                  {/* Video Card - 1/3 width */}
                  {hasVideo && event.video && (
                    <div className="flex flex-col justify-around rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300">
                      <iframe
                        src={event.video}
                        className="h-[200px] w-full rounded-lg"
                        allowFullScreen
                      ></iframe>
                      <h3 className="text-center text-lg font-semibold">
                        Video Invitation
                      </h3>
                      <p className="line-clamp-3 text-center text-sm leading-relaxed text-gray-600">
                        Watch the video invitation from the trainer.
                      </p>
                    </div>
                  )}

                  {/* Sneak Peek Card - 1/3 width */}
                  {hasSneakPeek && event.sneekPeek?.imageUrl && (
                    <a
                      href={event.sneekPeek.pdfLink || "#"}
                      target={event.sneekPeek.pdfLink ? "_blank" : undefined}
                      rel={
                        event.sneekPeek.pdfLink
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="group block w-full rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex flex-col gap-2">
                        <img
                          src={event.sneekPeek.imageUrl}
                          alt="Sneak peek"
                          className="h-[200px] w-full rounded-lg object-cover"
                        />
                        <h3 className="mt-2 text-center text-lg font-semibold">
                          Sneak Peek
                        </h3>
                        <p className="line-clamp-3 text-center text-sm leading-relaxed text-gray-600">
                          Take a sneak peek at the trainer&apos;s presentation.
                        </p>
                        <p className="text-center text-sm font-medium text-blue-600 group-hover:underline">
                          View PDF →
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
          <br />
          <EventTestimonials event={event} />
          <br />
          <EventPricing event={event} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching event:", error);
    notFound();
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: await config });

  const events = await payload.find({
    collection: "events",
    where: {
      status: {
        equals: "published",
      },
    },
    limit: 100,
  });

  return events.docs.map((event) => ({
    slug: event.slug,
  }));
}
