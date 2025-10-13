"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface EventDetailsProps {
  event: any;
}

const TRAINING_TIMES = [
  { time: "13:30 - 18:00", city: "Vienna" },
  { time: "12:30 - 17:00", city: "London" },
  { time: "07:30 - 12:00", city: "New York" },
  { time: "04:30 - 09:00", city: "Los Angeles" },
];

export function EventDetails({ event }: EventDetailsProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const parseDate = (iso?: string) => {
    if (!iso) return undefined;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  const eventDates = event["Event Dates"] || [];
  
  const formatDateRange = (startDate: Date, endDate: Date) => {
    const startMonth = startDate.toLocaleDateString("en-GB", {
      month: "long",
    });
    const endMonth = endDate.toLocaleDateString("en-GB", { month: "long" });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startDate.getTime() === endDate.getTime()) {
      return startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    if (startMonth === endMonth && startYear === endYear) {
      return `${startDate.getDate()} – ${endDate.getDate()} ${startMonth} ${startYear}`;
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
      return `${startFormatted} – ${endFormatted}`;
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

    return `${startFormatted} – ${endFormatted}`;
  };

  const formatAllDateRanges = () => {
    if (!eventDates || eventDates.length === 0) return "Date to be announced";
    
    const formattedRanges = eventDates.map((dateRange: any) => {
      const startDate = parseDate(dateRange["Start Date"]);
      const endDate = parseDate(dateRange["End Date"]);
      
      if (!startDate || !endDate) return null;
      return formatDateRange(startDate, endDate);
    }).filter(Boolean);
    
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
    mutationFn: async (params: { orderId?: string; sessionId?: string; field: string; value: unknown }) => {
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
      await mutateOrder.mutateAsync({ sessionId, field: "event_slug", value: slug });
    } catch (e) {
      console.error("Failed to initialize draft order", e);
      return;
    }

    router.push('/register');
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-center">
        <div className="space-y-8">
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {formatAllDateRanges().split('\n').map((date: string, index: number) => (
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
          <div className="flex gap-6">
            <div className="tracking-wide">
              <p className="mb-4 text-lg font-bold">TRAINING TIMES</p>
              <ul className="space-y-2">
                {TRAINING_TIMES.map(({ time, city }) => (
                  <li key={city} className="flex gap-3 text-lg">
                    <span className="font-mono">{time}</span>
                    <span>{city}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center flex-1 text-[#FBBB00]">
              <Image
                src="https://www.symmetric.events/wp-content/uploads/2025/06/online_training.jpg"
                alt="Online Training"
                width={150}
                height={150}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
