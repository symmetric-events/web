import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "~/payload.config";
import { cookies } from "next/headers";
import Link from "next/link";
import { EventDetails } from "./components/EventDetails";
import { EventPricing } from "./components/EventPricing";
import { EventWhyAttend } from "./components/EventWhyAttend";
import { EventTrainingExperience } from "./components/EventTrainingExperience";
import { EventLearningObjectives } from "./components/EventLearningObjectives";
import { EventWhoIsTrainingFor } from "./components/EventWhoIsTrainingFor";
import { EventKeyTopics } from "./components/EventKeyTopics";
import { EventTrainers } from "./components/EventTrainers";
import { EventTestimonials } from "./components/EventTestimonials";
import { EventHeader } from "./components/EventHeader";

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

    // Check if user is authenticated by checking for Payload auth cookie
    let isAuthenticated = false;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("payload-token");
      isAuthenticated = !!token?.value;
    } catch {
      // User is not authenticated
      isAuthenticated = false;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-5 py-12 relative">
          {/* Edit Button - Only show if authenticated */}
          {isAuthenticated && (
            <div className="absolute right-10 flex">
              <Link
                href={`/admin/collections/events/${event.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0zM15 6l3 3m-5 11h8"
                  />
                </svg>
                Edit in Admin
              </Link>
            </div>
          )}
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
          <EventTrainers event={event} />
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
