"use client";

import { useEffect } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import type { Event } from "@/payload-types";

interface EventViewTrackerProps {
  event: Event;
}

/**
 * Tracks when a user views an event page
 * Sends a dataLayer event to Google Tag Manager
 */
export function EventViewTracker({ event }: EventViewTrackerProps) {
  useEffect(() => {
    // Extract category name(s) - handle both populated and unpopulated relationships
    const categoryNames = event.category
      ? event.category
          .map((cat) => {
            if (typeof cat === "object" && cat !== null && "name" in cat) {
              return cat.name;
            }
            return null;
          })
          .filter((name): name is string => name !== null && typeof name === "string")
      : [];

    sendGTMEvent({
      event: "event_view",
      event_id: String(event.id),
      event_slug: event.slug,
      event_title: event.Title,
      event_category: categoryNames.length > 0 ? categoryNames.join(", ") : undefined,
      event_status: event.status,
      event_price_eur: event.Price?.EUR,
      event_price_usd: event.Price?.USD,
      training_type: event["Training Type"],
      training_location: event["Training Location"],
      page_path: window.location.pathname,
    });
  }, [event]);

  return null;
}
