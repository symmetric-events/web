import React from "react";
import { PageHeader } from "../components/PageHeader";
import { ClientLogo } from "../components/clientLogo";
import { InHouseTrainingForm } from "./InHouseTrainingForm";

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
      />

      {/* Why Choose Section */}
      <section className="bg-white max-w-4xl mx-auto py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-800">
            WHY CHOOSE AN IN-HOUSE COURSE?
          </h2>
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Benefit 1 */}
            <div className="flex flex-col items-start">
                {/* <img src="https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg" alt="arrow" /> */}
              
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Flexible delivery – onsite or online
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Train your team at the time and place that works best for you.
                Whether in your offices or virtually, we fit around your
                schedule.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col items-start">
                {/* <img src="https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg" alt="arrow" /> */}
              
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Cost-efficient solution for entire teams
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Save on multiple delegate fees and travel expenses by training
                everyone together. A single program equips your whole department
                with the same knowledge and tools.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col items-start">
                {/* <img src="https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg" alt="arrow" /> */}
              
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Tailored content & interactive workshops
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get a program that speaks directly to your projects and
                challenges. We adapt the agenda, case studies, and exercises to
                your company's real-world needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section className="bg-primary py-20" id="request-form-in-house">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
            Request a Tailored In-House Training
          </h2>
          <p className="mb-8 text-center text-lg text-gray-600 max-w-3xl mx-auto">
            Fill out this quick form and our team will be in touch to design a
            program that fits your needs.
          </p>
          <InHouseTrainingForm />
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="pt-10 pb-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-800">
            Clients that have benefited from our courses
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
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
    </div>
  );
}

