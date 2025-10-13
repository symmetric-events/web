import React from "react";
import Image from "next/image";
import { ContactPageForm } from "../components/ContactPageForm";

export const metadata = {
  title: "Contact Us - Symmetric",
  description:
    "Get in touch with Symmetric for training courses, consulting, and support. Contact our team for existing customers, new customers, or general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="pt-12">
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold text-gray-800">
              Contact Us
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Get in touch with our team for training courses, consulting, and
              support
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Sections */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Existing Symmetric Customer */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Existing Symmetric Customer
              </h2>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full">
                    <Image
                      src="https://www.symmetric.events/wp-content/uploads/2024/08/DSC_1335-15x20-1-300x300.jpg"
                      alt="Susan Sykora"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="mb-3 text-gray-600 italic">
                    Questions regarding invoicing, payment or training
                    logistics.
                  </p>
                  <p className="mb-2 font-bold text-gray-800">Susan Sykora</p>
                  <p className="mb-1 text-gray-600">US: +1 857 392 2714</p>
                  <p className="mb-1 text-gray-600">Europe: +421 948 262 346</p>
                  <a
                    href="mailto:operations@symmetric-courses.com"
                    className="hover:text-secondary underline"
                  >
                    operations@symmetric-courses.com
                  </a>
                </div>
              </div>
            </div>

            {/* New Symmetric Customer */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">
                New Symmetric Customer
              </h2>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full">
                    <Image
                      src="https://www.symmetric.events/wp-content/uploads/2025/07/lk-300x300.jpg"
                      alt="Laura Kristensen"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="mb-3 text-gray-600 italic">
                    Questions regarding training agenda, registration,
                    consulting or in-house courses.
                  </p>
                  <p className="mb-2 font-bold text-gray-800">
                    Laura Kristensen
                  </p>
                  <p className="mb-1 text-gray-600">US: +1 857 392 2714</p>
                  <p className="mb-1 text-gray-600">Europe: +421 222 200 543</p>
                  <a
                    href="mailto:laura.kristensen@symmetricevents.com"
                    className="hover:text-secondary underline"
                  >
                    laura.kristensen@symmetricevents.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Consulting Contact */}
          <div className="mt-12">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-full">
                  <Image
                    src="https://www.symmetric.events/wp-content/uploads/2020/12/5da9ae3aa56f394b1ab1a028_Matej-p-500-300x300.jpeg"
                    alt="Matej Boda"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-3 text-gray-600 italic">
                  Questions regarding consulting and in-house courses.
                </p>
                <p className="mb-2 font-bold text-gray-800">Matej Boda</p>
                <a
                  href="mailto:m.boda@symmetric.events"
                  className="hover:text-secondary underline"
                >
                  m.boda@symmetric.events
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-5">
        <div className="border-t border-gray-300"></div>
      </div>

      {/* Contact Form and Company Details */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="mb-8 text-3xl font-bold text-gray-800">
                Contact Us
              </h2>
              <ContactPageForm />
            </div>

            {/* Company Details */}
            <div>
              <h2 className="mb-8 text-3xl font-bold text-gray-800">
                Company Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-gray-800">Symmetric s.r.o.</p>
                  <p className="text-gray-600">Mliekarenska 7</p>
                  <p className="text-gray-600">82109 Bratislava</p>
                </div>

                <div>
                  <p className="text-gray-600">ID: 47 068 124</p>
                  <p className="text-gray-600">VAT No: SK2023741973</p>
                </div>

                <div>
                  <p className="text-gray-600">
                    E-mail:{" "}
                    <a
                      href="mailto:info@symmetric.events"
                      className="hover:text-secondary underline"
                    >
                      info@symmetric.events
                    </a>
                  </p>
                  <p className="text-gray-600">
                    Linkedin:{" "}
                    <a
                      href="https://sk.linkedin.com/company/symmetrictraining"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-secondary underline"
                    >
                      symmetrictraining
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
