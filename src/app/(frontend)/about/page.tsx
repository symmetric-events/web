import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TeamMemberCard } from "./TeamMemberCard";
import { PageHeader } from "../components/PageHeader";
import { getPayload } from "payload";
import config from "~/payload.config";

export const metadata = {
  title: "About Us - Symmetric",
  description:
    "Learn about Symmetric, a leading international training provider for Pharma & Biotech professionals. Discover our mission, training portfolio, and management team.",
};

const payloadConfig = await config;
const payload = await getPayload({ config: payloadConfig });

const bea = await payload.findByID({
  collection: "media",
  id: 20,
});

export default function AboutUsPage() {
  const teamMembers = [

    {
      name: "Attila Molnar",
      position: "Strategy & Management",
      imageUrl:
        "https://www.symmetric.events/wp-content/uploads/2020/12/5d8b52b4af3a4f9fe4d107cf_Attila-p-500.jpeg",
      linkedinUrl: "https://www.linkedin.com/in/attila-molnar-193a4689/",
    },
    {
      name: "Michal Laco",
      position: "Business Strategy, Operations",
      imageUrl:
        "https://www.symmetric.events/wp-content/uploads/2020/12/5d8b5b9b5cfd9745cc4504cd_Michal-p-500.jpeg",
      linkedinUrl: "https://www.linkedin.com/in/michal-laco-a7520071/",
    },
    {
      name: "Bea Zalubel",
      position: "",
      imageUrl:
        bea.url,
      linkedinUrl: "",
    },
    {
      name: "Matej Boda",
      position: "Biotech & Medical Devices Division",
      imageUrl:
        "https://www.symmetric.events/wp-content/uploads/2020/12/5da9ae3aa56f394b1ab1a028_Matej-p-500.jpeg",
      linkedinUrl: "https://sk.linkedin.com/in/matej-boda",
    },
    {
      name: "Marek Babusiak PhD.",
      position: "Pharma, Biotech Division",
      imageUrl:
        "https://www.symmetric.events/wp-content/uploads/2020/12/5d8b53023d7d1898fc0a6eea_Marek-p-500.jpeg",
      linkedinUrl: "https://www.linkedin.com/in/marek-babusiak-a4b229102/",
    },
    {
      name: "Susan Sykora",
      position: "Finance & Operations",
      imageUrl:
        "https://www.symmetric.events/wp-content/uploads/2025/10/generated-image-300x300.jpg",
    },
  ];

  return (
    <div>
      <PageHeader
        title="About Us"
        description="Learn about Symmetric, a leading international training provider for Pharma & Biotech professionals"
      />

      {/* Main Content */}
      <div className="mx-auto my-20 max-w-6xl px-5">
        <section className="mb-20">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-800">
            Our Team
          </h2>
          <div className="grid grid-cols-2 justify-items-center gap-8 lg:grid-cols-3 xl:grid-cols-6">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={index}
                name={member.name}
                position={member.position}
                imageUrl={member.imageUrl}
                linkedinUrl={member.linkedinUrl}
              />
            ))}
          </div>
        </section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Column */}
          {/* Management Team Section */}
          <div className="space-y-8">
            {/* Our Mission */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-800">
                Our Mission
              </h2>
              <p className="mb-6 leading-relaxed">
                Symmetric is a leading international training provider for
                Pharma & Biotech professionals in fields of drug development,
                pharmaceutical quality, process management, manufacturing,
                regulatory affairs and clinical trials. We train{" "}
                <Link
                  href="/clients"
                  className="hover:text-secondary font-bold underline transition"
                >
                  clients from over 500 companies annually
                </Link>
                . Enter our global educational platform for pharmaceutical
                professionals.
              </p>
            </div>

            {/* Client Logos */}
            <div className="relative h-32 w-full overflow-hidden rounded-lg">
              <Image
                src="https://www.symmetric.events/wp-content/uploads/2022/02/LOGA_WEB_ABOUT_US_FAREBNE-1024x264.png"
                alt="pharmaceutical clients"
                fill
                className="object-contain"
              />
            </div>

            {/* Main Goals */}
            <div>
              <h4 className="mb-4 text-xl font-semibold text-gray-800">
                Main goal of Symmetric is to help our clients:
              </h4>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  enhance crucial hard skills
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  boost career by completing our certified online live courses
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  network with industry professionals from all over the world
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  solve burning work challenges with top experts
                </li>
              </ul>
              <p className="leading-relaxed">
                The company was established in 2015 by a group of experienced
                training and development professionals with a passion for
                professional education and an understanding of the pharma and
                biotech industries. Over the years, we have developed a
                portfolio of{" "}
                <strong>30+ established hard-skill training courses</strong>.
                Our trainers are experienced industry professionals with a
                thorough understanding of the challenges faced by our clients.
                Symmetric's <strong>team of over 20 experts</strong> provides
                not only online live courses, but also bespoke in-house training
                tailored to the requirements of our clients and consulting upon
                request.
              </p>
            </div>

            {/* Live Online Courses */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-800">
                Our Live Online Courses
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  All of our public courses are delivered in a live online
                  environment via the Zoom platform.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  During the training, delegates are able to take part in
                  discussions and ask the tutor any questions.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  Courses' agendas are filled with Q&As, case studies, group
                  exercises and polls to ensure interactive experience.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  Each delegate gains exclusive access to our client zone – a
                  single source for all training materials as well as pre and
                  post-training communication.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  Participants are able to revisit full recordings of the course
                  for 7 days.
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-gray-800">•</span>
                  After the course, each delegate receives a digital
                  certificate, also suitable for LinkedIn.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Training Portfolio */}
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-800">
                Our Training Portfolio
              </h2>
              <p className="mb-6">
                All public courses can also be delivered privately, either
                online or face-to-face. Our portfolio currently covers following
                pharma & biotech topics:
              </p>
            </div>

            {/* Drug Development */}
            <div>
              <h4 className="mb-4 text-xl font-semibold text-gray-800">
                Drug Development:
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://www.symmetric.events/event/bioequivalence-and-ivivc/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Bioequivalence and IVIVC
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/dissolution-testing-equipment-requirements-quality-control-biowaivers/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Dissolution Testing, Equipment Requirements, Quality Control
                    & Biowaivers
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/cmc-regulatory-compliance-for-biological-drug-products/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    CMC Regulatory Compliance for Biological Drug Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/viral-safety-for-biologics/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Viral Safety for Biologics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Process Scale-up */}
            <div>
              <h4 className="mb-4 text-xl font-semibold text-gray-800">
                Process Scale-up, Validation & Technology Transfer:
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://www.symmetric.events/event/process-scale-up-tech-transfer-for-injectables/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    for Injectables
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/process-scale-up-validation-and-technology-transfer-for-biologics/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    for Biologics
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/process-scale-up-validation-technology-transfer/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    for Solids
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/process-design-scale-up-and-technology-transfer-for-medical-devices-us-edition/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    for Medical Devices
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/advanced-industrial-process-and-unit-operations-scale-up/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    for Industrial Processes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pharmaceutical Quality */}
            <div>
              <h4 className="mb-4 text-xl font-semibold text-gray-800">
                Pharmaceutical Quality:
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://www.symmetric.events/event/pharmaceutical-quality-qrm-capa-root-cause-analysis/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Pharmaceutical Quality: QRM, CAPA & Root Cause Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/quality-requirements-for-biologics/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Quality Requirements for Biologics
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/quality-requirements-for-solids/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Quality Requirements for Solids
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/extractables-and-leachables-control-strategies/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Extractables and Leachables Control Strategies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Regulatory, Clinical Trials & Market Access */}
            <div>
              <h4 className="mb-4 text-xl font-semibold text-gray-800">
                Regulatory, Clinical Trials & Market Access:
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://www.symmetric.events/event/drug-device-combination-products-quality-regulatory-requirements/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Drug-Device Combination Products: Quality & Regulatory
                    Requirements
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/value-added-medicines-scientific-regulatory-and-ip-analysis/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Value Added Medicines / Scientific, Regulatory and IP
                    Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/accelerating-development-of-gene-cell-therapy/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Accelerating Development of Gene & Cell Therapy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Orphan Drugs Strategy */}
            <div>
              <h4 className="mb-4 text-xl font-semibold text-gray-800">
                Orphan Drugs Strategy:
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://www.symmetric.events/event/patient-centricity/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Patient Centricity: PROs & Clinical Outcomes Assessments
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/using-rwe-to-accelerate-market-access-in-rare-diseases/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Using RWE to Accelerate Market Access in Rare Diseases
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.symmetric.events/event/orphan-drugs-clinical-trials/"
                    className="hover:text-secondary text-gray-800 underline transition"
                  >
                    Orphan Drugs Clinical Trials
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
