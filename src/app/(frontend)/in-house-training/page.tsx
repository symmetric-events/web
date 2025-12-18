import React from "react";
import { PageHeader } from "../components/PageHeader";
import { ClientLogosCarousel } from "../components/ClientLogosCarousel";
import { CtaButton } from "./CtaButton";
import { RequestConsultingForm } from "./RequestConsultingForm";
import { CaseStudiesSection } from "./CaseStudiesSection";
import { ServicesCarousel } from "./ServicesCarousel";
import { BenefitsList, type Benefit } from "./BenefitsList";
import { TestimonialCard } from "../components/TestimonialCard";

export const metadata = {
  title: "In-House Training - Symmetric",
  description:
    "Bring our expert training in-house. Flexible delivery, cost-efficient solutions, and tailored content for your team.",
};

const benefits: Benefit[] = [
  {
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg",
    imageAlt: "Flexible delivery icon",
    title: "Flexible delivery – onsite or online",
    description:
      "Train your team at the time and place that works best for you. Whether in your offices or virtually, we fit around your schedule.",
  },
  {
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg",
    imageAlt: "Cost-efficient icon",
    title: "Cost-efficient solution for entire teams",
    description:
      "Save on multiple delegate fees and travel expenses by training everyone together. A single program equips your whole department with the same knowledge and tools.",
  },
  {
    imageUrl:
      "https://www.symmetric.events/wp-content/uploads/2025/06/learning_objective.jpg",
    imageAlt: "Tailored content icon",
    title: "Tailored content & interactive workshops",
    description:
      "Get a program that speaks directly to your projects and challenges. We adapt the agenda, case studies, and exercises to your company's real-world needs.",
  },
];

const caseStudies = [
  {
    title: "Viral Safety for Biologics",
    description:
      "A biopharma company attempting to launch a virus clearance of biosimilars study was unsure about their plans for extended Phase I/II study and unable to create Phase III/market study. Thanks to Symmetric's support, the company developed and executed virus clearance study of 3 selected ATMPs in less than 6 months. Discussions and insights about viral clearance reporting to EMA & FDA, design and validation of scale-down models, worst-case parameters and critical process parameters set the team for success.",
  },
  {
    title: "Patient Centricity Opportunities",
    description:
      "An orphan-drugs focused pharmaceutical company was struggling to implement patient centricity into their clinical trials development. Symmetric helped the clinical research team apply patient-focused strategies, beyond standard clinical trials. Development of innovative PRO strategies helped this client reduce the usual clinical trial drop-out rate from 30% to just 5%.",
  },
  {
    title: "Paediatric Clinical Trials",
    description:
      "A biopharma company was aiming to launch its first paediatric clinical trial. Consulting sessions with one of our experts solved client's most burning issues regarding protocol writing, clinical trial model selection and recruitment of paediatric patients. Moreover, using our global networks, we helped the company cooperate with relevant patient advocacy groups. As a result, client was able to create 5 age-tailored information booklets explaining CTs' aims and procedures.",
  },
];

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
      <section className="mx-auto max-w-4xl py-18">
        <h2 className="mb-10 text-center text-2xl text-gray-800">
          Why choose our in-house training?
        </h2>
        <BenefitsList benefits={benefits} />
      </section>

      <PageHeader
        className="pt-14!"
        title="Request a Consulting Session"
        description="Besides online and in-house training, our team of experts is also providing consulting sessions that help clients overcome challenges of pharmaceutical development in order to launch their innovative treatment solutions. Get in touch using the form below today and our team will answer your questions in any area of your product lifecycle."
      >
        <div className="flex justify-center">
          <RequestConsultingForm />
        </div>
      </PageHeader>

      {/* Service Areas */}
      <ServicesCarousel />

      {/* Case Studies */}
      <CaseStudiesSection caseStudies={caseStudies} />

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

      {/* Client Logos Section */}
      <ClientLogosCarousel />
    </div>
  );
}
