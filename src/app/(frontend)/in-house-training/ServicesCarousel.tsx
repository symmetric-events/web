"use client";
import React, { useState } from "react";
import { ServiceCard } from "../components/ServiceCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
  type CarouselApi,
} from "~/components/ui/carousel";

const allServices = [
  {
    title: "Drug Development",
    description:
      "Helping clients develop cutting-edge new drugs for the worldwide market. Applying latest trends in bioequivalence and dissolution testing to speed up research & development initiatives.",
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2022/03/Drug-Development_TEXT-1024x322.jpg",
    imageAlt: "pharmaceutical drug development",
    experts: [
      { name: "Dr. Paula Muniz", specialty: "Bioequivalence, IVIVC" },
      { name: "Dr. Klaus Rensing", specialty: "ATMPs" },
      { name: "Franz Nothelfer", specialty: "Viral Safety" },
      { name: "Dr. Malcolm Ross", specialty: "Dissolution" },
    ],
  },
  {
    title: "Pharmaceutical Quality",
    description:
      "Ensuring compliance of quality management systems throughout all phases of drug development.",
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2022/03/Pharmaceutical-Quality_TEXT-1024x322.jpg",
    imageAlt: "pharmaceutical quality systems training certification",
    experts: [
      {
        name: "Dr. Tony Cundell",
        specialty: "Stability, Microbial Testing – Biologics",
      },
      {
        name: "Dr. Malcolm Ross",
        specialty: "Stability, Shelf-life – Solid Dosage",
      },
    ],
  },
  {
    title: "Process Scale-up & Validation",
    description:
      "Helping companies successfully scale-up manufacturing of biologics, solid dosage forms, injectables and medical devices. Applying best practices in validation and technology transfer to our customer's current goals.",
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2022/03/Process-Scale-up-Validation-Technology-Transfer_TEXT-1024x322.jpg",
    imageAlt: "pharmaceutical process scale-up consulting",
    experts: [
      { name: "Dr. Michael Braun", specialty: "Solid Dosage" },
      { name: "Dr. Samuel Denby", specialty: "Biologics" },
      { name: "Dr. Laura Butafoco", specialty: "Injectables" },
      { name: "Jan Harmsen", specialty: "Industrial processes" },
    ],
  },
  {
    title: "Regulatory & Clinical Trials",
    description:
      "Navigating clients through the complex regulatory landscape of pharmaceuticals and biologics. Co-creating and co-analyzing clinical trials while focusing on fast-to-patient market access strategy.",
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2022/03/Regulatory-Clinical-Trials-Market-Access-1024x322.jpg",
    imageAlt: "pharma regulatory certification",
    experts: [
      {
        name: "Dr. Karl-Heinz Huemer",
        specialty: "Paediatric Clinical Trials",
      },
      { name: "Dr. Simon Day", specialty: "Orphan Drugs Clinical Trials" },
      { name: "David Schwicker", specialty: "Orphan Drugs Market Access" },
      { name: "Dr. Malcolm Ross", specialty: "Value Added Medicines" },
    ],
  },
  {
    title: "Orphan Drugs Strategy",
    description:
      "Helping clients develop and launch new orphan drugs while staying compliant with the current regulations. Using our orphan drugs market know-how, from both EMA/FDA and industry perspective, to benefit from growing possibilities in rare diseases.",
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2022/03/Orphan-Drugs-Strategy_TEXT-1024x322.jpg",
    imageAlt: "orphan drugs strategy",
    experts: [
      {
        name: "David Schwicker",
        specialty:
          "Clinical Development, Regulatory, Market Access and Patient Centricity",
      },
      {
        name: "Dr. Simon Day",
        specialty: "Orphan Drugs Clinical Trials, Biostatistics",
      },
    ],
  },
];

export const ServicesCarousel = () => {
  return (
    <section className="mx-auto max-w-6xl py-10">
      <div className="px-5">
        <Carousel
          autoPlay={true}
          autoPlayInterval={4000}
          opts={{
            align: "start",
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <div className="relative">
            <CarouselContent className="-ml-2 cursor-grab active:cursor-grabbing sm:-ml-3 md:-ml-4">
              {allServices.map((service, index) => (
                <CarouselItem
                  key={index}
                  className="flex-shrink-0 basis-full pl-2 select-none sm:basis-1/2 sm:pl-3 md:basis-1/3 md:pl-4"
                >
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    imageUrl={service.imageUrl}
                    imageAlt={service.imageAlt}
                    experts={service.experts}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          <CarouselDots />
        </Carousel>
      </div>
    </section>
  );
};
