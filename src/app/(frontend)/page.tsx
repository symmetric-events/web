import { headers as getHeaders } from "next/headers.js";
import Image from "next/image";
import Link from "next/link";
import { getPayload } from "payload";
import React from "react";

import config from "~/payload.config";
import { Button } from "./components/Button";
import { CourseCard } from "./components/CourseCard";
import { TestimonialCard } from "./components/TestimonialCard";
import { ClientLogo } from "./components/clientLogo";

export default async function HomePage() {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  const latest = await payload.find({
    collection: "events",
    sort: "-createdAt",
    limit: 12,
    depth: 0,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 text-center text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/api/media/file/hero.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 pt-20 pb-10">
          <div className="flex flex-col items-center gap-5">
            <h2 className="mb-5 text-4xl leading-tight font-bold">
              Your Partner for Pharma and Biotech Training
            </h2>
            <p className="mb-8 text-xl leading-relaxed font-bold opacity-90">
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
        <div className="mx-auto max-w-7xl px-5">
          <h3 className="mb-10 text-center text-4xl text-gray-800">
            Upcoming Training Courses
          </h3>
          <div className="mb-12 flex flex-wrap justify-center gap-2.5">
            <Button>All</Button>
            <Button>Pharma & Biotech</Button>
            <Button>CMC</Button>
            <Button>Medical Devices</Button>
            <Button>Scale up</Button>
            <Button>Clinical Trials</Button>
            <Button>Combination Products</Button>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latest.docs.map((event: any) => {
              // Handle multiple date ranges - use first date range or fallback to legacy field
              const eventDates = event["Event Dates"] || [];
              let displayDate = "Date to be announced";
              
              if (eventDates && eventDates.length > 0) {
                const firstDateRange = eventDates[0];
                if (firstDateRange["Start Date"]) {
                  displayDate = firstDateRange["Start Date"];
                }
              } else if (event["Start Date"]) {
                // Fallback to legacy field for backward compatibility
                displayDate = event["Start Date"];
              }

              return (
                <CourseCard
                  key={event.id}
                  title={event.Title}
                  date={displayDate}
                  slug={event.slug}
                  status="Upcoming"
                  statusColor="green"
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h3 className="mb-12 text-center text-4xl text-gray-800">
            Clients that have benefited from our courses
          </h3>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {/* Row 1 */}
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/astra-2-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/annvie-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/teva-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/boe-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/gsk-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/johnson-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/merck-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/novartis.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/novo-1-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/pfizer-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/rocje-1.png" />
            <ClientLogo src="https://www.symmetric.events/wp-content/uploads/2022/02/sanofi-1.png" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h3 className="mb-12 text-center text-4xl text-gray-800">
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
    </div>
  );
}
