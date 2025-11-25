"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarPlus } from "lucide-react";
import {
  generateICS,
  downloadICS,
  generateGoogleCalendarURL,
  generateOutlookCalendarURL,
  generateYahooCalendarURL,
  type CalendarEvent,
} from "~/lib/calendar";

interface AddToCalendarProps {
  event: CalendarEvent;
  className?: string;
}

export function AddToCalendar({ event, className = "" }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDownloadICS = () => {
    const icsContent = generateICS(event);
    const filename = `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
    downloadICS(icsContent, filename);
    setIsOpen(false);
  };

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarURL(event), "_blank");
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    window.open(generateOutlookCalendarURL(event), "_blank");
    setIsOpen(false);
  };

  const handleYahooCalendar = () => {
    window.open(generateYahooCalendarURL(event), "_blank");
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Add to calendar"
        title="Add to calendar"
      >
        <CalendarPlus className="h-6 w-6 text-gray-800" />
        <span className="text-xs font-medium text-gray-800">Add to calendar</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            <button
              onClick={handleDownloadICS}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              📥 Download (.ics)
            </button>
            <button
              onClick={handleGoogleCalendar}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              📅 Google Calendar
            </button>
            <button
              onClick={handleOutlookCalendar}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              📧 Outlook
            </button>
            <button
              onClick={handleYahooCalendar}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              📆 Yahoo Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

