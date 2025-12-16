"use client";

import { CalendarPlus } from "lucide-react";
import { generateICS, downloadICS, type CalendarEvent } from "~/lib/calendar";
import posthog from "posthog-js";

interface AddToCalendarProps {
  event: CalendarEvent;
  className?: string;
}

export function AddToCalendar({ event, className = "" }: AddToCalendarProps) {
  const handleDownloadICS = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const icsContent = generateICS(event);
    const filename = `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
    downloadICS(icsContent, filename);

    // PostHog: Track calendar download
    posthog.capture("event_added_to_calendar", {
      event_title: event.title,
      event_start: event.startDate?.toISOString() || null,
      event_end: event.endDate?.toISOString() || null,
      event_location: event.location || null,
    });
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleDownloadICS}
        className="inline-flex items-center gap-1.5 rounded-lg p-1.5 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Add to calendar"
        title="Add to calendar"
      >
        <CalendarPlus className="h-4 w-4 text-gray-800" />
        <span className="text-xs font-medium text-gray-800">
          Add to calendar
        </span>
      </button>
    </div>
  );
}
