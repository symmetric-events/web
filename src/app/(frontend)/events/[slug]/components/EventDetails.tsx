"use client";
import Image from "next/image";
import * as moment from "moment-timezone";
import { AddToCalendar } from "~/app/(frontend)/components/AddToCalendar";
import type { CalendarEvent } from "~/lib/calendar";
import { getPriceFromDates } from "~/lib/pricing";

interface EventDetailsProps {
  event: any;
}

// Timezone mappings for major cities
const TIMEZONE_MAPPINGS = {
  Vienna: "Europe/Vienna",
  London: "Europe/London",
  "New York": "America/New_York",
  "Los Angeles": "America/Los_Angeles",
};

const convertTimeToTimezone = (
  viennaTime: string,
  targetTimezone: string,
  eventDate: Date,
): string => {
  if (!viennaTime) return "";

  const timeParts = viennaTime.split(":");
  if (timeParts.length !== 2 || !timeParts[0] || !timeParts[1]) return "";

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return "";

  // Create a moment object in Vienna timezone for the event date
  const viennaMoment = moment
    .tz(eventDate, "Europe/Vienna")
    .hour(hours)
    .minute(minutes)
    .second(0);

  // Convert to target timezone (handles DST automatically)
  const targetMoment = viennaMoment.clone().tz(targetTimezone);

  return targetMoment.format("HH:mm");
};

// Generate training times based on Vienna time from database
const generateTrainingTimes = (
  viennaStartTime?: string,
  viennaEndTime?: string,
  eventDate?: Date,
) => {
  if (!viennaStartTime || !viennaEndTime || !eventDate) {
    return [
      { time: "TBA", city: "Vienna" },
      { time: "TBA", city: "London" },
      { time: "TBA", city: "New York" },
      { time: "TBA", city: "Los Angeles" },
    ];
  }

  return Object.entries(TIMEZONE_MAPPINGS).map(([city, timezone]) => {
    const startTime = convertTimeToTimezone(
      viennaStartTime,
      timezone,
      eventDate,
    );
    const endTime = convertTimeToTimezone(viennaEndTime, timezone, eventDate);
    return {
      time: `${startTime} - ${endTime}`,
      city,
    };
  });
};

export function EventDetails({ event }: EventDetailsProps) {
  const parseDate = (iso?: string) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  const eventDates = event["Event Dates"] || [];

  // Get Vienna times from the first event date range (assuming Vienna is the base timezone)
  const firstDateRange = eventDates[0];
  const viennaStartTime = firstDateRange?.["Start Time"];
  const viennaEndTime = firstDateRange?.["End Time"];
  const eventDate = parseDate(firstDateRange?.["Start Date"]);

  // Generate training times for all timezones based on Vienna time
  const trainingTimes = generateTrainingTimes(
    viennaStartTime,
    viennaEndTime,
    eventDate,
  );

  const formatDateRange = (
    startDate: Date,
    endDate: Date,
    startTime?: string,
    endTime?: string,
  ) => {
    const startMonth = startDate.toLocaleDateString("en-GB", {
      month: "long",
    });
    const endMonth = endDate.toLocaleDateString("en-GB", { month: "long" });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    // Format time display
    const formatTime = (time?: string) => {
      if (!time) return "";
      return ` at ${time}`;
    };

    if (startDate.getTime() === endDate.getTime()) {
      const dateStr = startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const timeStr =
        startTime && endTime
          ? ` ${startTime} - ${endTime}`
          : formatTime(startTime);
      return `${dateStr}${timeStr}`;
    }

    if (startMonth === endMonth && startYear === endYear) {
      const dateStr = `${startDate.getDate()} – ${endDate.getDate()} ${startMonth} ${startYear}`;
      const timeStr =
        startTime && endTime
          ? ` ${startTime} - ${endTime}`
          : formatTime(startTime);
      return `${dateStr}${timeStr}`;
    }

    if (startYear === endYear) {
      const startFormatted = startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      });
      const endFormatted = endDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const dateStr = `${startFormatted} – ${endFormatted}`;
      const timeStr =
        startTime && endTime
          ? ` ${startTime} - ${endTime}`
          : formatTime(startTime);
      return `${dateStr}${timeStr}`;
    }

    const startFormatted = startDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const endFormatted = endDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const dateStr = `${startFormatted} – ${endFormatted}`;
    const timeStr =
      startTime && endTime
        ? ` ${startTime} - ${endTime}`
        : formatTime(startTime);
    return `${dateStr}${timeStr}`;
  };

  const formatAllDateRanges = () => {
    if (!eventDates || eventDates.length === 0) return "Date to be announced";

    const formattedRanges = eventDates
      .map((dateRange: any) => {
        const startDate = parseDate(dateRange["Start Date"]);
        const endDate = parseDate(dateRange["End Date"]);
        const startTime = dateRange["Start Time"];
        const endTime = dateRange["End Time"];

        if (!startDate || !endDate) return null;
        return formatDateRange(startDate, endDate, startTime, endTime);
      })
      .filter(Boolean);

    if (formattedRanges.length === 0) return "Date to be announced";
    if (formattedRanges.length === 1) return formattedRanges[0];

    // For multiple date ranges, display them vertically
    return formattedRanges.join("\n");
  };

  const priceEUR =
    firstDateRange && firstDateRange["Start Date"] && firstDateRange["End Date"]
      ? getPriceFromDates(
          firstDateRange["Start Date"],
          firstDateRange["End Date"],
        )
      : 0;

  const handleRegister = () => {
    // Scroll to pricing section
    const pricingElement = document.getElementById("pricing");
    if (pricingElement) {
      pricingElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Prepare calendar event data
  const getCalendarEvent = (): CalendarEvent | null => {
    if (!firstDateRange || !eventDate) return null;

    const startDate = parseDate(firstDateRange["Start Date"]);
    const endDate = parseDate(firstDateRange["End Date"]);
    const startTime = firstDateRange["Start Time"];
    const endTime = firstDateRange["End Time"];

    if (!startDate || !endDate) return null;

    // Convert Vienna time to UTC for calendar (ICS format uses UTC)
    let calendarStartDate = startDate;
    let calendarEndDate = endDate;
    let calendarStartTime = startTime;
    let calendarEndTime = endTime;

    if (startTime && endTime) {
      // Create moment objects in Vienna timezone
      const viennaStartMoment = moment
        .tz(startDate, "Europe/Vienna")
        .hour(parseInt(startTime.split(":")[0], 10))
        .minute(parseInt(startTime.split(":")[1], 10))
        .second(0);

      const viennaEndMoment = moment
        .tz(endDate, "Europe/Vienna")
        .hour(parseInt(endTime.split(":")[0], 10))
        .minute(parseInt(endTime.split(":")[1], 10))
        .second(0);

      // Convert to UTC for calendar
      calendarStartDate = viennaStartMoment.utc().toDate();
      calendarEndDate = viennaEndMoment.utc().toDate();
      calendarStartTime = viennaStartMoment.utc().format("HH:mm");
      calendarEndTime = viennaEndMoment.utc().format("HH:mm");
    }

    const eventUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/events/${event.slug}`
        : "";

    return {
      title: event.Title || "Training Event",
      description: event.Description || undefined,
      location:
        event["Training Type"] === "in-person"
          ? event["Training Location"] || undefined
          : "Online Training",
      startDate: calendarStartDate,
      endDate: calendarEndDate,
      startTime: calendarStartTime,
      endTime: calendarEndTime,
      url: eventUrl,
    };
  };

  const calendarEvent = getCalendarEvent();

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center">
        <div className="space-y-8">
          <div>
            <div className="flex items-start gap-3">
              <div className="text-xl font-semibold text-gray-900">
                {formatAllDateRanges()
                  .split("\n")
                  .map((date: string, index: number) => (
                    <div key={index}>{date}</div>
                  ))}
              </div>
              {calendarEvent && (
                <AddToCalendar event={calendarEvent} className="mt-1" />
              )}
            </div>
            {priceEUR != null && priceEUR > 0 && (
              <p className="mt-2 text-4xl font-bold text-gray-900">
                {priceEUR.toLocaleString("en-US", { minimumFractionDigits: 0 })}{" "}
                €
              </p>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRegister}
              className="hover:bg-primary hover:text-secondary w-full cursor-pointer rounded-full border-2 border-[#FBBB00] bg-[#FBBB00] py-4 text-lg font-semibold uppercase transition-colors duration-200"
            >
              Register Now
            </button>
            <button className="w-full cursor-pointer rounded-full border-2 border-[#FBBB00] py-4 text-lg font-semibold text-[#FBBB00] uppercase transition-colors duration-200 hover:bg-[#FBBB00] hover:text-black">
              Request Training Agenda
            </button>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-[#FBBB00] p-8 px-10 shadow-sm">
          <div className="flex items-center justify-around">
            <div className="tracking-wide">
              {event["Training Type"] === "in-person" ? (
                <>
                  <p className="mb-4 text-lg font-bold">TRAINING LOCATION</p>
                  <div className="flex items-center gap-3 text-lg">
                    <span className="font-semibold">
                      {event["Training Location"] || "Location TBA"}
                    </span>
                  </div>
                  <div className="pt-4 font-mono">
                    {firstDateRange["Start Time"]} -{" "}
                    {firstDateRange["End Time"]}
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4 text-lg font-bold">TRAINING TIMES</p>
                  <ul className="space-y-2">
                    {trainingTimes.map(({ time, city }) => (
                      <li key={city} className="flex gap-3 text-lg">
                        <span className="font-mono">{time}</span>
                        <span>{city}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <Image
              src={
                event["Training Type"] === "in-person"
                  ? "https://www.symmetric.events/wp-content/uploads/2025/08/face2face.png"
                  : "https://www.symmetric.events/wp-content/uploads/2025/06/online_training.jpg"
              }
              alt={
                event["Training Type"] === "in-person"
                  ? "In-Person Training"
                  : "Online Training"
              }
              width={150}
              height={150}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
