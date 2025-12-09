import { headers as getHeaders } from "next/headers.js";
import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import React from "react";

import config from "~/payload.config";
import { Button } from "./components/Button";
import { CourseCard } from "./components/CourseCard";
import { TestimonialCard } from "./components/TestimonialCard";
import { ClientLogosCarousel } from "./components/ClientLogosCarousel";
import { TrainerCard } from "./trainers/TrainerCard";

export default async function HomePage() {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  // Fetch all events to filter and sort by date
  const allEvents = await payload.find({
    collection: "events",
    limit: 1000,
    depth: 0,
  });

  // Get current date for filtering upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter and sort upcoming events
  const upcomingEvents = allEvents.docs
    .filter((event: any) => {
      // Get the earliest start date from Event Dates array
      const eventDates = event["Event Dates"] || [];
      if (eventDates.length === 0) {
        // Fallback to single Start Date field
        const startDate = event["Start Date"];
        if (!startDate) return false;
        const eventDate = new Date(startDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      }

      // Use the first date range's start date
      const firstDateRange = eventDates[0];
      const startDate = firstDateRange?.["Start Date"];
      if (!startDate) return false;
      
      const eventDate = new Date(startDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a: any, b: any) => {
      // Get start dates for comparison
      const getStartDate = (event: any) => {
        const eventDates = event["Event Dates"] || [];
        if (eventDates.length > 0) {
          return eventDates[0]?.["Start Date"] || event["Start Date"];
        }
        return event["Start Date"];
      };

      const dateA = getStartDate(a);
      const dateB = getStartDate(b);

      if (!dateA) return 1; // Events without dates go to end
      if (!dateB) return -1;

      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();
      return timeA - timeB; // Ascending order (closest first)
    })
    .slice(0, 6); // Limit to 6 events

  // Fetch featured trainers
  const featuredTrainersRes = await payload.find({
    collection: "trainers",
    where: {
      "Featured Trainer": {
        equals: true,
      },
    },
    depth: 1, // Include related data like images
    limit: 6, // Limit to 6 featured trainers
    sort: "name",
  });

  const featuredTrainers = featuredTrainersRes.docs;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-10 text-center text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://www.symmetric.events/wp-content/uploads/2020/12/bg.jpeg?id=2824"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-5 pt-20 pb-10">
          <div className="flex flex-col items-center gap-5">
            <h2 className="mb-5 text-2xl leading-tight font-bold">
              Your Partner for Pharma and Biotech Training
            </h2>
            <p className="mb-8 text-xl leading-relaxed opacity-90">
              We train clients from over 500 companies annually.
              <br />
              Enter our global educational platform for pharmaceutical
              professionals.
            </p>
            <Link href="/training-courses">
              <Button variant="primary">View All Training Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Training Courses */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h3 className="mb-10 text-center text-2xl text-gray-800">
            Upcoming Training Courses
          </h3>
          <div className="mb-12 flex flex-wrap justify-center gap-2.5">
            <Button size="sm">All</Button>
            <Button size="sm">Pharma & Biotech</Button>
            <Button size="sm">CMC</Button>
            <Button size="sm">Medical Devices</Button>
            <Button size="sm">Scale up</Button>
            <Button size="sm">Clinical Trials</Button>
            <Button size="sm">Combination Products</Button>
          </div>
          <div className="grid mx-auto max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event: any) => {
              // Handle multiple date ranges - use first range when available
              const eventDates = event["Event Dates"] || [];
              const firstDateRange = Array.isArray(eventDates) && eventDates.length > 0 ? eventDates[0] : undefined;

              const startDate = firstDateRange?.["Start Date"] || event["Start Date"] || undefined;
              const endDate = firstDateRange?.["End Date"] || event["End Date"] || undefined;
              const startTime = firstDateRange?.["Start Time"] || undefined;
              const endTime = firstDateRange?.["End Time"] || undefined;

              // Featured image resolution: supports absolute URLs or payload file proxy
              const featured = event["Featured Image"] as string | undefined;
              let featuredImage: string | undefined = undefined;
              if (featured) {
                featuredImage = /^https?:\/\//i.test(featured)
                  ? featured
                  : `/api/media/file/${encodeURIComponent(featured)}`;
              }

              return (
                <CourseCard
                  key={event.id}
                  title={event.Title}
                  slug={event.slug}
                  status="Upcoming"
                  statusColor="green"
                  trainingType={event['Training Type']}
                  trainingLocation={event['Training Location']}
                  featuredImage={featuredImage}
                  startDate={startDate}
                  endDate={endDate}
                  startTime={startTime}
                  endTime={endTime}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <ClientLogosCarousel />

      {/* Testimonials */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-5">
          <h3 className="mb-12 text-center text-2xl text-gray-800">
            Testimonials
          </h3>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="A great overview of state-of-the art PM in generic business. The discussions on topics from real experience with Dr. Ross were especially interesting given his broad area of expertise because it's all related!"
              author="Jiří Václavík"
              position="Project Manager"
              company="Zentiva"
            />
            <TestimonialCard
              quote="It was a good overview on Project Management tools and skills. A good starting point for PM implementation."
              author="Catarina Estevens"
              position="Project Manager Pharmaceutical"
              company="Development Tecnimede"
            />
            <TestimonialCard
              quote="Very rich content with real world examples. Trainer is very strong in rich information/right content. Worth to take this training if your routes cross VAM development."
              author="Araksya Topchyan"
              position="Global Marketing Manager Pharma"
              company="DSM"
            />
          </div>
        </div>
      </section>

      {/* Featured Trainers */}
      {featuredTrainers.length > 0 && (
        <section className="bg-gray-50 py-10">
          <div className="mx-auto max-w-6xl px-5">
            <h3 className="mb-12 text-center text-2xl text-gray-800">
              Featured Trainers
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredTrainers.map((trainer: any) => (
                <TrainerCard
                  key={trainer.id}
                  slug={trainer.slug || trainer.id}
                  name={trainer.name}
                  position={trainer.position}
                  excerpt={trainer.excerpt || trainer.biography}
                  imageUrl={
                    (typeof trainer.image === "object" && trainer.image?.url) ||
                    trainer.image_url ||
                    undefined
                  }
                  imageAlt={
                    (typeof trainer.image === "object" && trainer.image?.alt) ||
                    trainer.name
                  }
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/trainers">
                <Button variant="primary">View All Trainers</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
