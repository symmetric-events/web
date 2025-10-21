"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import * as moment from "moment-timezone";

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
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
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

  const priceEUR = event?.Price?.EUR ?? null;

  // Ensure we have a persistent session id on client for draft orders
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem("sessionId");
    if (existing) {
      setSessionId(existing);
    } else {
      const sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem("sessionId", sid);
      setSessionId(sid);
    }
  }, []);

  const mutateOrder = useMutation({
    mutationKey: ["mutateOrder"],
    mutationFn: async (params: {
      orderId?: string;
      sessionId?: string;
      field: string;
      value: unknown;
    }) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update order");
      }
      return res.json() as Promise<{ orderId?: string }>;
    },
  });

  const handleRegister = async () => {
    if (!event) return;
    if (!sessionId) return;

    const slug = String(event.slug ?? "");
    try {
      await mutateOrder.mutateAsync({
        sessionId,
        field: "event_slug",
        value: slug,
      });
    } catch (e) {
      console.error("Failed to initialize draft order", e);
      return;
    }

    router.push("/register");
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center">
        <div className="space-y-8">
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {formatAllDateRanges()
                .split("\n")
                .map((date: string, index: number) => (
                  <div key={index}>{date}</div>
                ))}
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
              disabled={mutateOrder.isPending || !sessionId}
              className="hover:bg-primary hover:text-secondary w-full cursor-pointer rounded-full border-2 border-[#FBBB00] bg-[#FBBB00] py-4 text-lg font-semibold uppercase transition-colors duration-200 disabled:opacity-70"
            >
              {mutateOrder.isPending ? "Preparing…" : "Register Now"}
            </button>
            <button className="w-full cursor-pointer rounded-full border-2 border-[#FBBB00] py-4 text-lg font-semibold text-[#FBBB00] uppercase transition-colors duration-200 hover:bg-[#FBBB00] hover:text-black">
              Request Event Agenda
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
