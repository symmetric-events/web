"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { sendGTMEvent } from "@next/third-parties/google";
import { getPriceForQuantity, getPriceFromDates } from "~/lib/pricing";
import { useCurrency } from "~/app/(frontend)/context/CurrencyContext";
import { BuyTicketButton } from "./BuyTicketButton";

interface EventPricingProps {
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

export function EventPricing({ event }: EventPricingProps) {
  const router = useRouter();
  const { currency } = useCurrency();
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loadingQuantity, setLoadingQuantity] = useState<number | null>(null);
  const eventDates = event?.["Event Dates"] || [];

  // Date selection state
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const selectedDateRange = useMemo(() => {
    return Array.isArray(eventDates) && eventDates.length > selectedDateIndex
      ? eventDates[selectedDateIndex]
      : eventDates[0];
  }, [eventDates, selectedDateIndex]);

  const startDate = selectedDateRange?.["Start Date"];
  const endDate = selectedDateRange?.["End Date"];
  const slug = event?.slug;

  const isOnline = event?.["Training Type"] === "online";

  // Format date for display
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDay = startDate.toDateString() === endDate.toDateString();

    if (sameDay) {
      return startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const startFormatted = startDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: sameYear ? undefined : "numeric",
    });
    const endFormatted = endDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return `${startFormatted} – ${endFormatted}`;
  };

  // Calculate early bird end date (3 months before event start)
  const earlyBirdEndDate = useMemo(() => {
    if (!startDate) return null;
    const eventStart = new Date(startDate);
    const endDate = new Date(eventStart);
    endDate.setMonth(endDate.getMonth() - 3);
    return endDate;
  }, [startDate]);

  // Format date as DD.MM.YYYY
  const formatDateShort = (date: Date) => {
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  };

  // Format date as DD. MONTH YYYY (e.g., "19. JANUARY 2025")
  const formatDateLong = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "long" });
    const year = date.getFullYear();
    return `${day}. ${month.toUpperCase()} ${year}`;
  };

  // Fetch pricing info for each quantity
  const fetchPricing = async (
    quantity: number,
  ): Promise<PricingInfo | null> => {
    if (!slug || !startDate || !endDate) return null;

    try {
      const res = await fetch(
        `/api/events/${slug}/pricing?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&quantity=${quantity}&currency=${currency}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
      return null;
    }
  };

  const pricing1Query = useQuery({
    queryKey: ["pricing", slug, startDate, endDate, 1, currency],
    queryFn: () => fetchPricing(1),
    enabled: !!slug && !!startDate && !!endDate,
  });

  const pricing2Query = useQuery({
    queryKey: ["pricing", slug, startDate, endDate, 2, currency],
    queryFn: () => fetchPricing(2),
    enabled: !!slug && !!startDate && !!endDate,
  });

  const pricing3Query = useQuery({
    queryKey: ["pricing", slug, startDate, endDate, 3, currency],
    queryFn: () => fetchPricing(3),
    enabled: !!slug && !!startDate && !!endDate,
  });

  // Calculate base price per person
  const basePricePerPerson = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return getPriceFromDates(startDate, endDate, currency);
  }, [startDate, endDate, currency]);

  // Calculate base prices and group discounts for each quantity
  const basePrice1 =
    pricing1Query.data?.basePrice ??
    (startDate && endDate
      ? getPriceForQuantity(startDate, endDate, 1, { currency })
      : 0);
  const basePrice2 =
    pricing2Query.data?.basePrice ??
    (startDate && endDate
      ? getPriceForQuantity(startDate, endDate, 2, { currency })
      : 0);
  const basePrice3 =
    pricing3Query.data?.basePrice ??
    (startDate && endDate
      ? getPriceForQuantity(startDate, endDate, 3, { currency })
      : 0);

  // Calculate group discounts
  const groupDiscount2 = basePricePerPerson * 2 - basePrice2;
  const groupDiscount3 = basePricePerPerson * 3 - basePrice3;

  // Final prices (with early bird if applicable)
  const price1 = pricing1Query.data?.finalPrice ?? basePrice1;
  const price2 = pricing2Query.data?.finalPrice ?? basePrice2;
  const price3 = pricing3Query.data?.finalPrice ?? basePrice3;

  // Get early bird info (use pricing1Query as reference for eligibility)
  const earlyBirdInfo = pricing1Query.data;

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
    if (!startDate || !endDate) return;
    if (loadingQuantity !== null) return; // Prevent multiple clicks

    setLoadingQuantity(quantity);
    const slug = String(event.slug ?? "");

    // Get pricing info for the selected quantity
    const pricingInfo =
      quantity === 1
        ? pricing1Query.data
        : quantity === 2
          ? pricing2Query.data
          : pricing3Query.data;

    const finalPrice =
      quantity === 1 ? price1 : quantity === 2 ? price2 : price3;

    const basePrice =
      quantity === 1 ? basePrice1 : quantity === 2 ? basePrice2 : basePrice3;

    // Extract category names
    const categoryNames = event.category
      ? event.category
          .map((cat: any) => {
            if (typeof cat === "object" && cat !== null && "name" in cat) {
              return cat.name;
            }
            return null;
          })
          .filter(
            (name: any): name is string =>
              name !== null && typeof name === "string",
          )
      : [];

    // Send begin_checkout event to GTM
    sendGTMEvent({
      event: "begin_checkout",
      event_id: String(event.id),
      event_slug: slug,
      event_title: event.Title,
      event_category:
        categoryNames.length > 0 ? categoryNames.join(", ") : undefined,
      quantity: quantity,
      value: finalPrice,
      currency: currency,
      price: finalPrice,
      base_price: basePrice,
      discount: pricingInfo?.earlyBirdDiscount ?? 0,
      training_type: event["Training Type"],
      training_location: event["Training Location"],
      start_date: startDate,
      end_date: endDate,
    });

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

      // Set the selected dates
      await mutateOrder.mutateAsync({
        sessionId,
        field: "startDate",
        value: startDate,
      });
      await mutateOrder.mutateAsync({
        sessionId,
        field: "endDate",
        value: endDate,
      });
    } catch (e) {
      console.error("Failed to initialize draft order", e);
      setLoadingQuantity(null);
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
    <div id="pricing" className="my-10 space-y-6">
      {/* Date and Currency Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {eventDates.length > 1 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Select Date:
            </label>
            <div className="flex flex-col flex-wrap gap-2">
              {eventDates.map((dateRange: any, index: number) => {
                const rangeStart = dateRange?.["Start Date"];
                const rangeEnd = dateRange?.["End Date"];
                if (!rangeStart || !rangeEnd) return null;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDateIndex(index)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedDateIndex === index
                        ? "bg-[#FBBB00] text-gray-900"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {formatDateRange(rangeStart, rangeEnd)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Early Bird Banner */}
      {earlyBirdInfo?.earlyBirdEligible && (
        <div className="mx-auto mb-8 w-full max-w-2xl rounded-lg bg-[#FBBB00] px-6 py-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-900">
            <span className="font-bold">EARLY BIRD PRICE</span>
            <span>|</span>
            <span>
              {earlyBirdInfo.remainingEarlyBirdSpots > 0 ? (
                <>
                  ONLY{" "}
                  <span className="font-bold">
                    {earlyBirdInfo.remainingEarlyBirdSpots} OF 5
                  </span>{" "}
                  DISCOUNTED SPOTS LEFT
                </>
              ) : (
                "EARLY BIRD SPOTS FILLED"
              )}
            </span>
            <span>|</span>
            {earlyBirdEndDate && (
              <span>ENDS {formatDateLong(earlyBirdEndDate)}</span>
            )}
          </div>
        </div>
      )}

      <div className="grid items-start gap-8 md:grid-cols-3">
        {/* 1 Participant */}
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#FBBB00] shadow-lg">
          {/* Dark grey top section */}
          <div className="mx-5 border-b-2 border-[#FBBB00] px-6 py-4 text-center">
            <h3 className="text-2xl font-bold tracking-widest uppercase">
              1 Participant
            </h3>
          </div>

          {/* Yellow bottom section */}
          <div className="flex flex-1 flex-col px-6 py-6">
            {/* Standard price - show if early bird exists */}
            {(pricing1Query.data?.earlyBirdDiscount ?? 0) > 0 && (
              <div className="mb-4 text-center">
                <div className="text-xl font-semibold line-through opacity-40">
                  {basePrice1.toLocaleString("en-US")}
                  {currency}
                </div>
              </div>
            )}

            {/* Price (Early Bird if available, otherwise base price) */}
            <div className="flex h-full flex-col justify-around">
              <div className="mb-4 text-center">
                <div className="text-5xl font-bold">
                  {price1.toLocaleString("en-US")}
                  {currency}
                </div>
              </div>

              {/* Early Bird discount button */}
              {(pricing1Query.data?.earlyBirdDiscount ?? 0) > 0 && (
                <div className="mb-4 flex justify-center">
                  <div className="bg-secondary rounded-lg px-2 py-1 tracking-widest">
                    <span className="text-sm font-bold text-gray-900">
                      EARLY BIRD -{currency}
                      {pricing1Query.data?.earlyBirdDiscount}
                    </span>
                  </div>
                </div>
              )}

              {/* Features */}
              <ul className="mb-6 space-y-2 text-center text-sm text-gray-900">
                {features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>

            <BuyTicketButton
              quantity={1}
              loadingQuantity={loadingQuantity}
              onClick={handleRegister}
              variant="primary"
            />
          </div>
        </div>

        {/* 2 Participants (Highlight) - TOP SELLER */}
        <div className="mb-2 text-center relative mt-6 md:mt-0">
          <span className="text-2xl font-light tracking-widest absolute -top-10 left-1/2 -translate-x-1/2">
            TOP SELLER
          </span>
          <div className="bg-secondary z-10 flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#FBBB00] text-gray-900 shadow-lg">
            {/* TOP SELLER label */}
            {/* Dark grey top section */}
            <div className="mx-5 border-b-2 border-gray-900 py-4 text-center">
              <h3 className="text-2xl font-bold tracking-widest uppercase">
                2 Participants
              </h3>
            </div>

            {/* Yellow bottom section */}
            <div className="flex flex-1 flex-col px-6 py-6">
              {/* Standard price - show if early bird exists, or show regular price struck through if no early bird */}
              {(pricing2Query.data?.earlyBirdDiscount ?? 0) > 0 ? (
                <div className="mb-4 text-center">
                  <div className="text-xl font-semibold line-through opacity-65">
                    {basePrice2.toLocaleString("en-US")}
                    {currency}
                  </div>
                </div>
              ) : (
                <div className="mb-4 text-center">
                  <div className="text-xl font-semibold line-through opacity-65">
                    {(basePricePerPerson * 2).toLocaleString("en-US")}
                    {currency}
                  </div>
                </div>
              )}

              {/* Price (Early Bird if available, otherwise base price) */}
              <div className="mb-4 text-center">
                <div className="text-5xl font-bold">
                  {price2.toLocaleString("en-US")}
                  {currency}
                </div>
              </div>

              {/* Early Bird discount button */}
              {(pricing2Query.data?.earlyBirdDiscount ?? 0) > 0 && (
                <div className="mb-4 flex justify-center">
                  <div className="rounded-lg bg-gray-900 px-2 py-1 tracking-widest">
                    <span className="text-secondary text-sm font-bold">
                      EARLY BIRD -{currency}
                      {pricing2Query.data?.earlyBirdDiscount}
                    </span>
                  </div>
                </div>
              )}

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-2 text-center text-sm">
                {features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>

              <BuyTicketButton
                quantity={2}
                loadingQuantity={loadingQuantity}
                onClick={handleRegister}
                variant="secondary"
              />
            </div>
          </div>
        </div>

        {/* 3 FOR 2 */}
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#FBBB00] shadow-lg">
          {/* Dark grey top section */}
          <div className="mx-5 border-b-2 border-[#FBBB00] px-6 py-4 text-center">
            <h3 className="text-2xl font-bold tracking-widest uppercase">
              3 For 2
            </h3>
          </div>

          {/* Yellow bottom section */}
          <div className="flex flex-1 flex-col px-6 py-6">
            {/* Standard price - show if early bird exists, or show regular price struck through if no early bird */}
            {(pricing3Query.data?.earlyBirdDiscount ?? 0) > 0 ? (
              <div className="mb-4 text-center">
                <div className="text-xl font-semibold line-through opacity-40">
                  {basePrice3.toLocaleString("en-US")}
                  {currency}
                </div>
              </div>
            ) : (
              <div className="mb-4 text-center">
                <div className="text-xl font-semibold line-through opacity-40">
                  {(basePricePerPerson * 3).toLocaleString("en-US")}
                  {currency}
                </div>
              </div>
            )}

            {/* Price (Early Bird if available, otherwise base price) */}
            <div className="mb-4 text-center">
              <div className="text-5xl font-bold">
                {price3.toLocaleString("en-US")}
                {currency}
              </div>
            </div>

            {/* Early Bird discount button */}
            {(pricing3Query.data?.earlyBirdDiscount ?? 0) > 0 && (
              <div className="mb-4 flex justify-center">
                <div className="bg-secondary rounded-lg px-2 py-1 tracking-widest">
                  <span className="text-sm font-bold text-gray-900">
                    EARLY BIRD -{currency}
                    {pricing3Query.data?.earlyBirdDiscount}
                  </span>
                </div>
              </div>
            )}

            {/* Features */}
            <ul className="mb-6 flex-1 space-y-2 text-center text-sm text-gray-900">
              {features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            <BuyTicketButton
              quantity={3}
              loadingQuantity={loadingQuantity}
              onClick={handleRegister}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
