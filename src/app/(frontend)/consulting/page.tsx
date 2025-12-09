import React from "react";
import Image from "next/image";
import { ContactForm } from "./ContactForm";
import { ClientLogo } from "../components/clientLogo";
import { ServiceSection } from "./ServiceSection";
import { CaseStudiesSection } from "./CaseStudiesSection";
import { PageHeader } from "../components/PageHeader";
import { ClientLogosCarousel } from "../components/ClientLogosCarousel";

export default function ConsultingPage() {
  // Service data
  const drugDevelopmentServices = [
    {
      title: "Drug Development",
      description: "Helping clients develop cutting-edge new drugs for the worldwide market. Applying latest trends in bioequivalence and dissolution testing to speed up research & development initiatives.",
      imageUrl: "https://www.symmetric.events/wp-content/uploads/2022/03/Drug-Development_TEXT-1024x322.jpg",
      imageAlt: "pharmaceutical drug development",
      experts: [
        { name: "Dr. Paula Muniz", specialty: "Bioequivalence, IVIVC" },
        { name: "Dr. Klaus Rensing", specialty: "ATMPs" },
        { name: "Franz Nothelfer", specialty: "Viral Safety" },
        { name: "Dr. Malcolm Ross", specialty: "Dissolution" }
      ]
    },
    {
      title: "Pharmaceutical Quality",
      description: "Ensuring compliance of quality management systems throughout all phases of drug development.",
      imageUrl: "https://www.symmetric.events/wp-content/uploads/2022/03/Pharmaceutical-Quality_TEXT-1024x322.jpg",
      imageAlt: "pharmaceutical quality systems training certification",
      experts: [
        { name: "Dr. Tony Cundell", specialty: "Stability, Microbial Testing – Biologics" },
        { name: "Dr. Malcolm Ross", specialty: "Stability, Shelf-life – Solid Dosage" }
      ]
    }
  ];

  const processServices = [
    {
      title: "Process Scale-up & Validation",
      description: "Helping companies successfully scale-up manufacturing of biologics, solid dosage forms, injectables and medical devices. Applying best practices in validation and technology transfer to our customer's current goals.",
      imageUrl: "https://www.symmetric.events/wp-content/uploads/2022/03/Process-Scale-up-Validation-Technology-Transfer_TEXT-1024x322.jpg",
      imageAlt: "pharmaceutical process scale-up consulting",
      experts: [
        { name: "Dr. Michael Braun", specialty: "Solid Dosage" },
        { name: "Dr. Samuel Denby", specialty: "Biologics" },
        { name: "Dr. Laura Butafoco", specialty: "Injectables" },
        { name: "Jan Harmsen", specialty: "Industrial processes" }
      ]
    },
    {
      title: "Regulatory & Clinical Trials",
      description: "Navigating clients through the complex regulatory landscape of pharmaceuticals and biologics. Co-creating and co-analyzing clinical trials while focusing on fast-to-patient market access strategy.",
      imageUrl: "https://www.symmetric.events/wp-content/uploads/2022/03/Regulatory-Clinical-Trials-Market-Access-1024x322.jpg",
      imageAlt: "pharma regulatory certification",
      experts: [
        { name: "Dr. Karl-Heinz Huemer", specialty: "Paediatric Clinical Trials" },
        { name: "Dr. Simon Day", specialty: "Orphan Drugs Clinical Trials" },
        { name: "David Schwicker", specialty: "Orphan Drugs Market Access" },
        { name: "Dr. Malcolm Ross", specialty: "Value Added Medicines" }
      ]
    }
  ];

  const orphanDrugsService = [
    {
      title: "Orphan Drugs Strategy",
      description: "Helping clients develop and launch new orphan drugs while staying compliant with the current regulations. Using our orphan drugs market know-how, from both EMA/FDA and industry perspective, to benefit from growing possibilities in rare diseases.",
      imageUrl: "https://www.symmetric.events/wp-content/uploads/2022/03/Orphan-Drugs-Strategy_TEXT-1024x322.jpg",
      imageAlt: "orphan drugs strategy",
      experts: [
        { name: "David Schwicker", specialty: "Clinical Development, Regulatory, Market Access and Patient Centricity" },
        { name: "Dr. Simon Day", specialty: "Orphan Drugs Clinical Trials, Biostatistics" }
      ]
    }
  ];

  const caseStudies = [
    {
      title: "Viral Safety for Biologics",
      description: "A biopharma company attempting to launch a virus clearance of biosimilars study was unsure about their plans for extended Phase I/II study and unable to create Phase III/market study. Thanks to Symmetric's support, the company developed and executed virus clearance study of 3 selected ATMPs in less than 6 months. Discussions and insights about viral clearance reporting to EMA & FDA, design and validation of scale-down models, worst-case parameters and critical process parameters set the team for success."
    },
    {
      title: "Patient Centricity Opportunities",
      description: "An orphan-drugs focused pharmaceutical company was struggling to implement patient centricity into their clinical trials development. Symmetric helped the clinical research team apply patient-focused strategies, beyond standard clinical trials. Development of innovative PRO strategies helped this client reduce the usual clinical trial drop-out rate from 30% to just 5%."
    },
    {
      title: "Paediatric Clinical Trials",
      description: "A biopharma company was aiming to launch its first paediatric clinical trial. Consulting sessions with one of our experts solved client's most burning issues regarding protocol writing, clinical trial model selection and recruitment of paediatric patients. Moreover, using our global networks, we helped the company cooperate with relevant patient advocacy groups. As a result, client was able to create 5 age-tailored information booklets explaining CTs' aims and procedures."
    }
  ];

  return (
    <div>
      <PageHeader
        title="Request a Consulting Session"
        description="Besides online and in-house training, our team of experts is also providing consulting sessions that help clients overcome challenges of pharmaceutical development in order to launch their innovative treatment solutions. Get in touch using the form below today and our team will answer your questions in any area of your product lifecycle."
      >
        <div className="flex justify-center">
          <ContactForm />
        </div>
      </PageHeader>

      {/* Service Areas */}
      <section className="py-10 max-w-4xl mx-auto">
        <div className="px-5">
          {/* Drug Development & Quality */}
          <ServiceSection services={drugDevelopmentServices} className="mb-16" />
          
          {/* Process Scale-up & Regulatory */}
          <ServiceSection services={processServices} className="mb-16" />
          
          {/* Orphan Drugs Strategy */}
          <ServiceSection services={orphanDrugsService} />
        </div>
      </section>

      {/* Consulting Banner */}
      <section className="bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-5">
          <div className="relative aspect-[1024/427] w-full overflow-hidden rounded-lg">
            <Image
              src="https://www.symmetric.events/wp-content/uploads/2022/03/Consulting_Banner-01-1-1024x427.png"
              alt="pharmaceutical consulting experts"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
              priority={false}
            />
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <CaseStudiesSection caseStudies={caseStudies} />

      {/* Client Logos */}
      <ClientLogosCarousel />
    </div>
  );
}
