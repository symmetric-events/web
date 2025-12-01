"use client";

import { CalendarPlus } from "lucide-react";
import { generateICS, downloadICS, type CalendarEvent } from "~/lib/calendar";

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
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleDownloadICS}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Add to calendar"
        title="Add to calendar"
      >
        <CalendarPlus className="h-6 w-6 text-gray-800" />
        <span className="text-xs font-medium text-gray-800">
          Add to calendar
        </span>
      </button>
    </div>
  );
}
