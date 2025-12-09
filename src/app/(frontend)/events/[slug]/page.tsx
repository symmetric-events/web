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
import { EventTrainers } from "./components/EventTrainers";
import { EventTestimonials } from "./components/EventTestimonials";
import { EventHeader } from "./components/EventHeader";
import { EditButton } from "./components/EditButton";

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
        <div className="mx-auto max-w-6xl px-5 py-12 relative">
          {/* Edit Button - Only show if authenticated (client-side check) */}
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
      and: [
        {
          status: {
            equals: "published",
          },
        },
        {
          "Event Dates.Start Date": {
            exists: true,
          },
        },
      ],
    },
    limit: 100,
  });

  // Filter out events where all dates are TBD (null)
  const eventsWithDates = events.docs.filter((event) => {
    const eventDates = event["Event Dates"];
    if (!eventDates || !Array.isArray(eventDates) || eventDates.length === 0) {
      return false;
    }
    // Check if at least one date range has a valid Start Date
    return eventDates.some(
      (dateRange: any) => dateRange?.["Start Date"] != null,
    );
  });

  return eventsWithDates.map((event) => ({
    slug: event.slug,
  }));
}
