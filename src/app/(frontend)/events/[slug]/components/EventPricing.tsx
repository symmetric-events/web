"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getPriceForQuantity } from "~/lib/pricing";

interface EventPricingProps {
  event: any;
}

export function EventPricing({ event }: EventPricingProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const eventDates = event?.["Event Dates"] || [];
  const firstDateRange =
    Array.isArray(eventDates) && eventDates.length > 0
      ? eventDates[0]
      : undefined;
  const startDate = firstDateRange?.["Start Date"];
  const endDate = firstDateRange?.["End Date"];
  
  const price1 = startDate && endDate ? getPriceForQuantity(startDate, endDate, 1) : 0;
  const price2 = startDate && endDate ? getPriceForQuantity(startDate, endDate, 2) : 0;
  const price3 = startDate && endDate ? getPriceForQuantity(startDate, endDate, 3) : 0;
  
  const isOnline = event?.["Training Type"] === "online";

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

  const handleRegister = async (quantity: number) => {
    if (!event) return;
    if (!sessionId) return;

    const slug = String(event.slug ?? "");
    try {
      // Initialize order with event slug
      await mutateOrder.mutateAsync({
        sessionId,
        field: "event_slug",
        value: slug,
      });
      
      // Set the quantity for the order
      await mutateOrder.mutateAsync({
        sessionId,
        field: "quantity",
        value: quantity,
      });
    } catch (e) {
      console.error("Failed to initialize draft order", e);
      return;
    }

    router.push(`/register?quantity=${quantity}`);
  };

  if (!price1 || !price2 || !price3) return null;

  const features = [
    isOnline ? "Online Participation" : "In-Person Participation",
    "Workbook & Material",
    "Certificate",
  ];

  return (
    <div id="pricing" className="grid gap-6 md:grid-cols-3 items-center my-10">
      {/* 1 Participant */}
      <div className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-8 text-center">
          <h3 className="mb-8 text-lg font-bold uppercase tracking-wide text-gray-900">
            1 Participant
          </h3>
          <div className="text-5xl font-bold text-[#FBBB00]">
            €{price1.toLocaleString("en-US")}
          </div>
        </div>

        <ul className="mb-8 flex-1 space-y-4 text-center text-gray-600">
          {features.map((feature, i) => (
            <li key={i} className="">
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleRegister(1)}
          className="w-full cursor-pointer rounded-full bg-[#FBBB00] py-4 text-lg font-bold text-gray-900 uppercase transition-colors hover:bg-[#e5aa00]"
        >
          Buy Ticket
        </button>
      </div>

      {/* 2 Participants (Highlight) */}
      <div className="relative flex h-full flex-col rounded-3xl bg-[#FBBB00] p-8 text-gray-900 shadow-lg transform md:scale-105 z-10">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-sm font-bold text-[#FBBB00] uppercase ring-1 ring-gray-100 shadow-sm">
          Top Seller
        </div>
        <div className="mb-8 text-center">
          <h3 className="mb-8 text-lg font-bold uppercase tracking-wide">
            2 Participants
          </h3>
          <div className="mb-2 text-xl text-gray-700 line-through decoration-red-500 decoration-2">
            €{(price1 * 2).toLocaleString("en-US")}
          </div>
          <div className="text-5xl font-bold">
            €{price2.toLocaleString("en-US")}
          </div>
        </div>

        <ul className="mb-8 flex-1 space-y-4 text-center font-medium">
          {features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>

        <button
          onClick={() => handleRegister(2)}
          className="w-full cursor-pointer rounded-full bg-white py-4 text-lg font-bold text-[#FBBB00] uppercase transition-colors hover:bg-gray-50"
        >
          Buy Ticket
        </button>
      </div>

      {/* 3 FOR 2 */}
      <div className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-8 text-center">
          <h3 className="mb-8 text-lg font-bold uppercase tracking-wide text-gray-900">
            3 For 2
          </h3>
          <div className="mb-2 text-xl text-gray-400 line-through decoration-red-500 decoration-2">
            €{(price1 * 3).toLocaleString("en-US")}
          </div>
          <div className="text-5xl font-bold text-[#FBBB00]">
            €{price3.toLocaleString("en-US")}
          </div>
        </div>

        <ul className="mb-8 flex-1 space-y-4 text-center text-gray-600">
          {features.map((feature, i) => (
            <li key={i} className="">
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleRegister(3)}
          className="w-full cursor-pointer rounded-full bg-[#FBBB00] py-4 text-lg font-bold text-gray-900 uppercase transition-colors hover:bg-[#e5aa00]"
        >
          Buy Ticket
        </button>
      </div>
    </div>
  );
}
