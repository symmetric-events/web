import { getPayload } from "payload";
import React from "react";
import config from "~/payload.config";
import { TrainerCard } from "./TrainerCard";
import type { Trainer } from "~/payload-types";

export default async function TrainersPage() {
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  // Fetch all trainers from the API
  const trainersResponse = await payload.find({
    collection: "trainers",
    sort: "name",
    depth: 1, // Include related data like images
    limit: 0, // 0 means no limit - fetch all trainers
  });

  const trainers: Trainer[] = trainersResponse.docs;

  return (
    <div className="pt-12">
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold text-gray-800">
              Our Expert Trainers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our team of industry-leading experts who bring decades of experience 
              in pharmaceutical and biotech development to our training programs.
            </p>
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="pb-20 bg-primary">
        <div className="mx-auto max-w-7xl px-5">
          {trainers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {trainers.map((trainer) => (
                <TrainerCard
                  key={trainer.id}
                  id={trainer.id}
                  name={trainer.name}
                  position={trainer.position}
                  excerpt={trainer.excerpt || trainer.biography}
                  imageUrl={(typeof trainer.image === 'object' && trainer.image?.url) || trainer.image_url || undefined}
                  imageAlt={(typeof trainer.image === 'object' && trainer.image?.alt) || trainer.name}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-500 text-lg">
                No trainers found. Please check back later.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">{trainers.length}+</div>
              <div className="text-xl">Expert Trainers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-xl">Years Average Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-xl">Industry Professionals</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
