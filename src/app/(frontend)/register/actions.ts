"use server";

import { headers } from "next/headers";

type ItemsForCheckout = Array<{
  id: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  price: number;
  currency: string;
  quantity: number;
  startDate?: string;
  endDate?: string;
}>;

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  vatNumber: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  notes: string;
};

export async function fetchEventsBatchAction(slugs: string[]) {
  const origin = (await headers()).get("origin");
  if (!origin) throw new Error("Missing origin header");

  const res = await fetch(`${origin}/api/events/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slugs }),
    // Ensure this runs server-side
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch event data");
  }
  return res.json();
}

export async function submitCheckoutAction(params: {
  items: ItemsForCheckout;
  paymentMethod: "card" | "invoice";
  formData: ContactFormData;
}) {
  const origin = (await headers()).get("origin");
  if (!origin) throw new Error("Missing origin header");

  const res = await fetch(`${origin}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: params.items,
      paymentMethod: params.paymentMethod,
      ...params.formData,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Checkout failed");
  }
  return res.json();
}

export async function mutateOrder(params: {
  orderId: string;
  data: Record<string, unknown>;
}) {
  const origin = (await headers()).get("origin");
  if (!origin) throw new Error("Missing origin header");

  const res = await fetch(`${origin}/api/order/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: params.orderId, ...params.data }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update order");
  }
  return res.json();
}


