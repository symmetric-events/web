import { getPayload } from "payload";
import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import config from "~/payload.config";
import { CourseCard } from "~/app/(frontend)/components/CourseCard";
import type { Event, Category } from "~/payload-types";

interface TrainerPageProps {
  params: Promise<{
    id: string; // this is the trainer slug in the URL
  }>;
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id: slug } = await params;
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  try {
    // Fetch the specific trainer by slug (taken from the URL segment)
    const trainerRes = await payload.find({
      collection: "trainers",
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 1, // Include related data like images
      limit: 1,
    });

    console.log(trainerRes);

    let trainer = trainerRes.docs[0];

    // Fallback: support old numeric ID URLs or trainers without slug yet
    if (!trainer) {
      const numericId = Number(slug);
      if (!Number.isNaN(numericId)) {
        try {
          trainer = await payload.findByID({
            collection: "trainers",
            id: numericId,
            depth: 1,
          });
        } catch {
          // ignore and let notFound() handle it below
        }
      }
    }

    if (!trainer) {
      notFound();
    }

    // Fetch events where this trainer is included in the Trainers relationship
    const trainerId = trainer.id;
    
    // Fetch all published events and filter for this trainer
    // This approach is more reliable than querying relationship fields directly
    const allEventsRes = await payload.find({
      collection: "events",
      // where: {
      //   status: {
      //     equals: "published",
      //   },
      // },
      depth: 1, // Populate categories and trainers relationships
      limit: 1000,
    });

    console.log(allEventsRes);
    
    // Filter events where trainer is in the Trainers array
    const trainerEvents = allEventsRes.docs.filter((event: any) => {
      const trainers = event.Trainers || [];
      if (trainers.length === 0) return false;
      
      // Check if trainer ID matches (handle both populated objects and IDs)
      return trainers.some((t: any) => {
        const trainerIdValue = typeof t === "object" && t !== null ? t.id : t;
        return trainerIdValue === trainerId;
      });
    }) as Event[];
    
    // Sort by creation date (newest first)
    trainerEvents.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return (
      <div className="pt-12">
        <section className="bg-primary py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="text-center">
              <Link
                href="/trainers"
                className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                ← Back to Trainers
              </Link>

              {/* Trainer Image */}
              <div className="mb-8 flex justify-center">
                <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-gray-100">
                  {(typeof trainer.image === "object" && trainer.image?.url) ||
                  trainer.image_url ? (
                    <Image
                      src={
                        (typeof trainer.image === "object" &&
                          trainer.image?.url) ||
                        trainer.image_url ||
                        ""
                      }
                      alt={
                        (typeof trainer.image === "object" &&
                          trainer.image?.alt) ||
                        trainer.name
                      }
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <div className="text-6xl font-bold text-gray-400">
                        {trainer.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trainer Info */}
              <h1 className="mb-4 text-5xl font-bold text-gray-800">
                {trainer.name}
              </h1>
              {trainer.position && (
                <p className="mb-6 text-2xl font-medium text-blue-600">
                  {trainer.position}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-5">
            <div className="prose prose-lg max-w-none">
              {/* Excerpt */}
              {trainer.excerpt && (
                <div className="mb-8">
                  <h2 className="mb-4 text-2xl font-bold text-gray-800">
                    Overview
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-600">
                    {trainer.excerpt}
                  </p>
                </div>
              )}

              {/* Biography */}
              {trainer.biography && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-gray-800">
                    Biography
                  </h2>
                  <div className="leading-relaxed whitespace-pre-line text-gray-600">
                    {trainer.biography}
                  </div>
                </div>
              )}

              {/* Fallback if no content */}
              {!trainer.excerpt && !trainer.biography && (
                <div className="py-12 text-center">
                  <p className="text-lg text-gray-500">
                    More information about {trainer.name} will be available
                    soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Training Courses Section */}
        {trainerEvents.length > 0 && (
          <section className="bg-gray-50 py-20">
            <div className="mx-auto max-w-7xl px-5">
              <h2 className="mb-8 text-center text-4xl font-bold text-gray-800">
                Training Courses by {trainer.name}
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {trainerEvents.map((event) => {
                  // Handle multiple date ranges - use first range when available
                  const eventDates = event["Event Dates"] || [];
                  const firstDateRange =
                    Array.isArray(eventDates) && eventDates.length > 0
                      ? eventDates[0]
                      : undefined;

                  const startDate =
                    firstDateRange?.["Start Date"] || undefined;
                  const endDate =
                    firstDateRange?.["End Date"] || undefined;
                  const startTime =
                    firstDateRange?.["Start Time"] || undefined;
                  const endTime = firstDateRange?.["End Time"] || undefined;

                  // Featured image resolution
                  const featured = event["Featured Image"] as
                    | string
                    | undefined;
                  let featuredImage: string | undefined = undefined;
                  if (featured) {
                    featuredImage = /^https?:\/\//i.test(featured)
                      ? featured
                      : `/api/media/file/${encodeURIComponent(featured)}`;
                  }

                  // Get primary category name for display
                  let categoryName = "";
                  if (event.category && event.category.length > 0) {
                    const firstCat = event.category[0];
                    if (
                      typeof firstCat === "object" &&
                      firstCat !== null
                    ) {
                      categoryName = (firstCat as Category).name;
                    }
                  }

                  return (
                    <CourseCard
                      key={event.id}
                      title={event.Title}
                      slug={event.slug}
                      status="Upcoming"
                      statusColor="green"
                      trainingType={event["Training Type"]}
                      trainingLocation={
                        event["Training Location"] || undefined
                      }
                      featuredImage={featuredImage}
                      startDate={startDate}
                      endDate={endDate}
                      startTime={startTime}
                      endTime={endTime}
                      category={categoryName}
                      description={event.Description || undefined}
                      priceEUR={event.Price?.EUR}
                      priceUSD={event.Price?.USD}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Back to Trainers CTA */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-5 text-center">
            <h2 className="mb-6 text-3xl font-bold text-gray-800">
              Meet More Expert Trainers
            </h2>
            <p className="mb-8 text-xl text-gray-600">
              Discover our full team of industry-leading experts.
            </p>
            <Link
              href="/trainers"
              className="inline-flex items-center rounded-full bg-blue-600 px-8 py-4 font-bold text-white transition-colors duration-300 hover:bg-blue-700"
            >
              View All Trainers
            </Link>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Error fetching trainer:", error);
    notFound();
  }
}

// Generate static params for all trainers (optional - for better performance)
export async function generateStaticParams() {
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  try {
    const trainers = await payload.find({
      collection: "trainers",
      limit: 0, // Get all trainers
      depth: 0,
    });

    return trainers.docs.map((trainer) => ({
      id: trainer.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
