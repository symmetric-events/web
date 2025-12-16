"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/app/(frontend)/components/Button";
import type { Event } from "~/payload-types";
import posthog from "posthog-js";
import { trackHubSpotFormSubmission, identifyHubSpotUser } from "~/lib/hubspot";

interface RequestAgendaModalProps {
  eventSlug: string;
  eventTitle: string;
  eventId: number | string;
  trigger?: React.ReactNode;
  eventAgenda: Event["Agenda"];
}

export function RequestAgendaModal({
  eventSlug,
  eventTitle,
  eventId,
  trigger,
  eventAgenda,
}: RequestAgendaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  console.log("eventAgenda", eventAgenda);

  // Extract agenda image URL
  const agendaImage = eventAgenda?.["Agenda Image"];
  const agendaImageUrl =
    typeof agendaImage === "object" && agendaImage?.url
      ? agendaImage.url
      : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const name = (formData.get("name") as string) || "";
    const company = (formData.get("company") as string) || "";
    const email = (formData.get("email") as string) || "";
    const phone = (formData.get("phone") as string) || "";

    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Capture current URL
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";

    try {
      const response = await fetch("/api/request-agenda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          first_name: firstName,
          last_name: lastName,
          company,
          email,
          phone,
          event_slug: eventSlug,
          event_title: eventTitle,
          event_id: eventId,
          current_url: currentUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send agenda");
      }

      setIsSubmitted(true);
      // e.currentTarget.reset();

      // PostHog: Identify user and track agenda request
      if (email) {
        posthog.identify(email, {
          email: email,
          name: name,
          first_name: firstName,
          last_name: lastName,
          company: company,
          phone: phone,
        });
      }

      posthog.capture("agenda_requested", {
        event_id: String(eventId),
        event_slug: eventSlug,
        event_title: eventTitle,
        company: company,
      });

      // Track form submission to HubSpot
      const formLocation = typeof window !== 'undefined' ? window.location.pathname : ''
      trackHubSpotFormSubmission(
        {
          name,
          first_name: firstName,
          last_name: lastName,
          company,
          email,
          phone,
          event_slug: eventSlug,
          event_title: eventTitle,
          event_id: String(eventId),
          form_name: 'agenda_request_form',
          lead_type: 'agenda_request',
        },
        'agenda_request_form',
        formLocation
      )
      
      // Identify user in HubSpot
      if (email) {
        identifyHubSpotUser(email, {
          name,
          first_name: firstName,
          last_name: lastName,
          company,
          phone,
        })
      }

      // Close modal after successful submission
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "There was an error submitting your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form state when modal is closed
      setIsSubmitted(false);
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="primary" className="px-4 py-2 text-lg">
            Request Event Agenda
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        {isSubmitted ? (
          ""
        ) : (
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Request Event Agenda
            </DialogTitle>
          </DialogHeader>
        )}

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl text-green-600">✓</div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">
              Agenda Sent Successfully!
            </h3>
            <p className="text-gray-600">
              Check your inbox or spam folder for the email with the agenda.
            </p>
            <p className="text- mt-4 text-gray-600">
              If you haven&apos;t received the email, please contact us directly
              at{" "}
              <a
                href="mailto:laura.kristensen@symmetricevents.com"
                className="text-secondary hover:underline"
              >
                laura.kristensen@symmetricevents.com
              </a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="agenda-request-form space-y-5">
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Event Info with Image Thumbnail */}
            <div className="flex gap-4 rounded-lg border border-gray-200 bg-gray-50 p-2">
              {agendaImageUrl && (
                <div className="relative h-36 w-48 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={agendaImageUrl}
                    alt="Event Agenda Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <p className="font-medium tracking-wide text-gray-500 uppercase">
                  Event
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {eventTitle}
                </p>
                {agendaImageUrl && (
                  <p className="mt-1 text-gray-500">
                    Agenda will be sent to your email
                  </p>
                )}
              </div>
            </div>

            {/* 2x2 Grid of Inputs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="focus:border-secondary focus:ring-secondary w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  placeholder="Full name"
                />
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Your Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  className="focus:border-secondary focus:ring-secondary w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  placeholder="Company name"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Please enter a valid email address"
                  className="focus:border-secondary focus:ring-secondary w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Your Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="focus:border-secondary focus:ring-secondary w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Sending..." : "Request Agenda"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
