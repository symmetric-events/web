"use client";
import Image from "next/image";
import * as moment from "moment-timezone";
import { Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AddToCalendar } from "@/app/(frontend)/components/AddToCalendar";
import type { CalendarEvent } from "@/lib/calendar";
import { getPriceFromDates, getPriceForQuantity } from "@/lib/pricing";
import { useCurrency } from "@/app/(frontend)/context/CurrencyContext";
import { RequestAgendaModal } from "./RequestAgendaModal";

interface EventDetailsProps {
  event: any;
}

interface PricingInfo {
  basePrice: number;
  earlyBirdEligible: boolean;
  earlyBirdDiscount: number;
  finalPrice: number;
  participantCount: number;
  remainingEarlyBirdSpots: number;
  wouldGetEarlyBird: boolean;
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
  const { currency, setCurrency } = useCurrency();
  const slug = event?.slug;

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

  interface DateRangeInfo {
    dateStr: string;
    timeStr?: string;
    startDate: Date;
    endDate: Date;
    startTime?: string;
    endTime?: string;
  }

  const formatDateRange = (
    startDate: Date,
    endDate: Date,
    startTime?: string,
    endTime?: string,
  ): DateRangeInfo => {
    const startMonth = startDate.toLocaleDateString("en-GB", {
      month: "long",
    });
    const endMonth = endDate.toLocaleDateString("en-GB", { month: "long" });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    const timeStr =
      startTime && endTime
        ? `${startTime} – ${endTime}`
        : startTime || undefined;

    let dateStr: string;

    if (startDate.getTime() === endDate.getTime()) {
      dateStr = startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (startMonth === endMonth && startYear === endYear) {
      dateStr = `${startDate.getDate()} – ${endDate.getDate()} ${startMonth} ${startYear}`;
    } else if (startYear === endYear) {
      const startFormatted = startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      });
      const endFormatted = endDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      dateStr = `${startFormatted} – ${endFormatted}`;
    } else {
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
      dateStr = `${startFormatted} – ${endFormatted}`;
    }

    return { dateStr, timeStr, startDate, endDate, startTime, endTime };
  };

  const getFormattedDateRanges = (): DateRangeInfo[] => {
    if (!eventDates || eventDates.length === 0) return [];

    return eventDates
      .map((dateRange: any) => {
        const startDate = parseDate(dateRange["Start Date"]);
        const endDate = parseDate(dateRange["End Date"]);
        const startTime = dateRange["Start Time"];
        const endTime = dateRange["End Time"];

        if (!startDate || !endDate) return null;
        return formatDateRange(startDate, endDate, startTime, endTime);
      })
      .filter(Boolean) as DateRangeInfo[];
  };

  const formattedDateRanges = getFormattedDateRanges();

  const startDate = firstDateRange?.["Start Date"];
  const endDate = firstDateRange?.["End Date"];

  // Fetch pricing info for quantity 1 (to get early bird pricing)
  const fetchPricing = async (
    quantity: number,
    currencyParam: "€" | "$",
  ): Promise<PricingInfo | null> => {
    if (!slug || !startDate || !endDate) return null;

    try {
      const res = await fetch(
        `/api/events/${slug}/pricing?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&quantity=${quantity}&currency=${currencyParam}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
      return null;
    }
  };

  // Query for current currency
  const pricingQuery = useQuery({
    queryKey: ["pricing", slug, startDate, endDate, 1, currency],
    queryFn: () => fetchPricing(1, currency),
    enabled: !!slug && !!startDate && !!endDate,
  });

  // Prefetch the other currency
  const otherCurrency = currency === "€" ? "$" : "€";
  useQuery({
    queryKey: ["pricing", slug, startDate, endDate, 1, otherCurrency],
    queryFn: () => fetchPricing(1, otherCurrency),
    enabled: !!slug && !!startDate && !!endDate,
    staleTime: Infinity, // Keep prefetched data fresh
  });

  // Calculate base price per person
  const basePrice =
    startDate && endDate ? getPriceFromDates(startDate, endDate, currency) : 0;

  // Use final price (with early bird discount if applicable) or fallback to base price
  const finalPrice =
    pricingQuery.data?.finalPrice ??
    (startDate && endDate
      ? getPriceForQuantity(startDate, endDate, 1, { currency })
      : 0);

  const basePriceForDisplay = pricingQuery.data?.basePrice ?? basePrice;
  const hasEarlyBird = (pricingQuery.data?.earlyBirdDiscount ?? 0) > 0;

  const handleSeePricing = () => {
    // Scroll to pricing section with 100px offset
    const pricingElement = document.getElementById("pricing");
    if (pricingElement) {
      const elementPosition = pricingElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Prepare calendar event data for a specific date range
  const getCalendarEvent = (dateRange: any): CalendarEvent | null => {
    if (!dateRange) return null;

    const startDate = parseDate(dateRange["Start Date"]);
    const endDate = parseDate(dateRange["End Date"]);
    const startTime = dateRange["Start Time"];
    const endTime = dateRange["End Time"];

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
        ? `${window.location.origin}/event/${event.slug}`
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

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center">
        <div className="space-y-4">
          {/* Date Cards */}
          <div className="space-y-3">
            {formattedDateRanges.length > 0 ? (
              formattedDateRanges.map((dateRange, index) => (
                <div
                  key={index}
                  className="group border-secondary/20 from-secondary/5 relative overflow-hidden rounded-lg border-2 bg-linear-to-br to-transparent px-4 py-2 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Calendar Icon Badge */}
                    <div className="bg-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>

                    {/* Date & Time Info */}

                    <p className="tracking-tight text-gray-900">
                      {dateRange.dateStr}
                    </p>

                    {/* Add to Calendar Button - show on first and second date ranges */}
                    {(index === 0 || index === 1) &&
                      (() => {
                        const calendarEvent = getCalendarEvent(
                          eventDates[index],
                        );
                        return calendarEvent ? (
                          <AddToCalendar
                            event={calendarEvent}
                            className="shrink-0"
                          />
                        ) : null;
                      })()}
                  </div>

                  {/* Subtle accent line */}
                  <div className="from-secondary via-secondary/50 absolute bottom-0 left-0 h-1 w-full bg-linear-to-r to-transparent opacity-0 transition-opacity duration-300" />
                </div>
              ))
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-200">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-500">
                    Date to be announced
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Price and Currency Switcher */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-2 py-2">
              {/* Price Display */}
              <div className="flex justify-center gap-4">
                {finalPrice > 0 ? (
                  <>
                    <span className="ml-2 text-3xl font-bold text-gray-900">
                      {finalPrice.toLocaleString("en-US")}
                      {currency}
                    </span>
                    {hasEarlyBird && (
                      <div className="ml-2 flex items-center gap-2">
                        <span className="bg-secondary/10 text-secondary rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                          Early Bird
                        </span>
                        <span className="text-xs font-semibold text-gray-500 line-through">
                          {basePriceForDisplay.toLocaleString("en-US")}
                          {currency}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-500">
                    Price calculation...
                  </span>
                )}
              </div>

              {/* Currency Buttons */}
              <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setCurrency("€")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    currency === "€"
                      ? "bg-secondary text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  €
                </button>
                <button
                  onClick={() => setCurrency("$")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    currency === "$"
                      ? "bg-secondary text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  $
                </button>
              </div>
            </div>

            <button
              onClick={handleSeePricing}
              className="hover:bg-primary hover:text-secondary border-secondary bg-secondary w-full cursor-pointer rounded-full border-2 py-2 text-lg font-semibold uppercase transition-colors duration-200"
            >
              See Pricing
            </button>
            {event["Agenda"]?.pdf && (
              <RequestAgendaModal
                eventSlug={slug || ""}
                eventTitle={event?.Title || ""}
                eventId={event?.id || ""}
                eventAgenda={event["Agenda"]}
                trigger={
                  <button className="border-secondary text-secondary hover:bg-secondary w-full cursor-pointer rounded-full border-2 py-2 text-lg font-semibold uppercase transition-colors duration-200 hover:text-gray-900">
                    Request Training Agenda
                  </button>
                }
              />
            )}
          </div>
        </div>

        <div className="border-secondary rounded-3xl border-2 px-4 py-4 shadow-sm md:py-10">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-around">
            <div className="w-full tracking-wide lg:w-auto">
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
                      <li
                        key={city}
                        className="flex items-center justify-between gap-3 text-lg lg:justify-start"
                      >
                        <span className="shrink-0 font-mono">{time}</span>
                        <span className="text-right lg:text-left">{city}</span>
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
              className="shrink-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
