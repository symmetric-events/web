import React from "react";
import { Target } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ClientLogosCarousel } from "../components/ClientLogosCarousel";
import { InHouseTrainingForm } from "./InHouseTrainingForm";
import { CtaButton } from "./CtaButton";

export const metadata = {
  title: "In-House Training - Symmetric",
  description:
    "Bring our expert training in-house. Flexible delivery, cost-efficient solutions, and tailored content for your team.",
};

export default function InHouseTrainingPage() {
  return (
    <div>
      <PageHeader
        title="BRING OUR EXPERT TRAINING IN-HOUSE"
        description="Looking to train your team without the hassle of travel and adjusting schedules? Our in-house training programs are designed to deliver maximum value – on your terms."
      >
        <CtaButton />
      </PageHeader>

      {/* Why Choose Section */}
      <section className="mx-auto max-w-4xl bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="mb-12 text-center text-4xl font-extrabold text-gray-900 uppercase">
            WHY CHOOSE AN IN-HOUSE COURSE?
          </h2>

          <div className="">
            {/* Benefit 1 */}
            <div className="flex gap-4 pb-8">
              <div className="h-18 w-18">
                <img
                  src="https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg"
                  alt="arrow"
                />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Flexible delivery – onsite or online
                </h3>
                <p className="text-base leading-relaxed text-gray-700">
                  Train your team at the time and place that works best for you.
                  Whether in your offices or virtually, we fit around your
                  schedule.
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200"></div>

            {/* Benefit 2 */}
            <div className="flex gap-4 pt-8 pb-8">
              <div className="h-18 w-18">
                <img
                  src="https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg"
                  alt="arrow"
                />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Cost-efficient solution for entire teams
                </h3>
                <p className="text-base leading-relaxed text-gray-700">
                  Save on multiple delegate fees and travel expenses by training
                  everyone together. A single program equips your whole
                  department with the same knowledge and tools.
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200"></div>

            {/* Benefit 3 */}
            <div className="flex gap-4 pt-8">
              <div className="h-18 w-18">
                <img
                  src="https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg"
                  alt="arrow"
                />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Tailored content & interactive workshops
                </h3>
                <p className="text-base leading-relaxed text-gray-700">
                  Get a program that speaks directly to your projects and
                  challenges. We adapt the agenda, case studies, and exercises
                  to your company's real-world needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section className="bg-primary py-20" id="request-form-in-house">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
            Request a Tailored In-House Training
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-center text-lg text-gray-600">
            Fill out this quick form and our team will be in touch to design a
            program that fits your needs.
          </p>
          <InHouseTrainingForm />
        </div>
      </section>

      {/* Client Logos Section */}
      <ClientLogosCarousel />
    </div>
  );
}
