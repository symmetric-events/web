import { getPayload } from "payload";
import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import config from "~/payload.config";
import { EditButton } from "~/app/(frontend)/components/EditButton";
import { TrainersEvents } from "./TrainersEvents";

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

    return (
      <div>
        <EditButton collection="trainers" id={trainer.id} />
        <section className="bg-primary py-20">
          <div className="mx-auto max-w-6xl px-5">
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
        <TrainersEvents trainerId={trainer.id} trainerName={trainer.name} />

        {/* Back to Trainers CTA */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-6xl px-5 text-center">
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
