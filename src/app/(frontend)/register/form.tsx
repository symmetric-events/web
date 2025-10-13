"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building,
  CreditCard,
  FileText,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type DraftOrder = {
  id: string;
  eventTitle?: string;
  eventSlug?: string;
  currency?: "EUR" | "USD";
  priceEUR?: number;
  priceUSD?: number;
  quantity?: number;
  totalAmount?: number;
  startDate?: string;
  endDate?: string;
};

type FormErrors = Partial<
  Record<
    | "email"
    | "firstName"
    | "lastName"
    | "phone"
    | "company"
    | "country"
    | "address1"
    | "city"
    | "postcode",
    string
  >
>;

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    vatNumber: "",
    country: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "invoice" | "">(
    "card",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableDateRanges, setAvailableDateRanges] = useState<
    { id: string; startDate: string; endDate: string }[]
  >([]);
  const [quantity, setQuantity] = useState<number>(1);

  function formatDateRange(startDate: Date, endDate: Date) {
    const startMonth = startDate.toLocaleDateString("en-GB", { month: "long" });
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
  }

  const queryClient = useQueryClient();

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

  const orderQuery = useQuery({
    queryKey: ["order", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const res = await fetch(
        `/api/orders?sessionId=${encodeURIComponent(sessionId!)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Failed to load order");
      return res.json() as Promise<DraftOrder | null>;
    },
  });

  // Keep local quantity in sync with order when it changes
  useEffect(() => {
    const q = orderQuery.data?.quantity
    if (typeof q === 'number' && Number.isFinite(q) && q > 0) {
      setQuantity(q)
    }
  }, [orderQuery.data?.quantity])

  // Fetch event date ranges for this draft order (if slug exists)
  useEffect(() => {
    const loadDates = async () => {
      const order = orderQuery.data
      if (!order?.eventSlug) return
      try {
        const res = await fetch("/api/events/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slugs: [order.eventSlug] }),
        })
        if (!res.ok) return
        const data = (await res.json()) as Record<string, any>
        const event = data[order.eventSlug]
        const ranges = (event?.eventDates || []).map((r: any, idx: number) => ({
          id: String(r.id ?? idx),
          startDate: r["Start Date"],
          endDate: r["End Date"],
        }))
        setAvailableDateRanges(ranges)
      } catch {}
    }
    void loadDates()
  }, [orderQuery.data?.eventSlug])

  const saveDraft = useMutation({
    mutationKey: ["mutateOrder"],
    mutationFn: async (params: {
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
        throw new Error(text || "Failed to save draft field");
      }
      return (await res.json()) as { orderId?: string };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["order", sessionId] });
    },
  });

  useEffect(() => {
    if (
      orderQuery.data?.currency === "USD" ||
      orderQuery.data?.currency === "EUR"
    ) {
      setCurrency(orderQuery.data.currency);
    }
  }, [orderQuery.data?.currency]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!formData.email) next.email = "Email is required";
    if (!formData.firstName) next.firstName = "First name is required";
    if (!formData.lastName) next.lastName = "Last name is required";
    if (!formData.phone) next.phone = "Phone is required";
    if (!formData.company) next.company = "Company is required";
    if (!formData.country) next.country = "Country is required";
    if (!formData.address1) next.address1 = "Address is required";
    if (!formData.city) next.city = "City is required";
    if (!formData.postcode) next.postcode = "Postcode is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleInputChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleInputBlur(field: keyof typeof formData) {
    if (!sessionId) return;
    saveDraft.mutate({ sessionId, field, value: formData[field] });
  }

  function handleCurrencyChange(next: "EUR" | "USD") {
    setCurrency(next);
    if (sessionId) {
      saveDraft.mutate({ sessionId, field: "currency", value: next });
    }
  }

  function handleQuantityChange(nextQty: number) {
    if (!sessionId) return
    const safe = Math.max(1, Math.min(1000, Math.floor(nextQty || 1)))
    setQuantity(safe) // optimistic local update for instant UI feedback
    saveDraft.mutate({ sessionId, field: "quantity", value: safe })
  }

  function handleSelectDateRange(range?: { startDate: string; endDate: string }) {
    if (!sessionId || !range) return
    saveDraft.mutate({ sessionId, field: "startDate", value: range.startDate })
    saveDraft.mutate({ sessionId, field: "endDate", value: range.endDate })
  }

  const formattedTotal = useMemo(() => {
    const order = orderQuery.data;
    if (!order) return "—";
    const unit =
      currency === "EUR" ? (order.priceEUR ?? 0) : (order.priceUSD ?? 0);
    const qty = quantity ?? 1;
    const total = unit * qty;
    const symbol = currency === "EUR" ? "€" : "$";
    return `${symbol} ${total.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  }, [orderQuery.data, currency, quantity]);

  async function handleSubmit() {
    if (!validate()) return;
    if (!orderQuery.data) return;
    setIsProcessing(true);
    try {
      const order = orderQuery.data;
      const priceWhole =
        currency === "EUR" ? (order.priceEUR ?? 0) : (order.priceUSD ?? 0);
      const priceInCents = Math.round(priceWhole * 100);
      const items = [
        {
          eventId: order.id,
          eventTitle: order.eventTitle || "Event",
          eventSlug: "",
          price: priceInCents,
          currency,
          quantity: quantity ?? order.quantity ?? 1,
          startDate: order.startDate,
          endDate: order.endDate,
        },
      ];

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod: paymentMethod || "card",
          ...formData,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerCompany: formData.company,
          customerPhone: formData.phone,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Checkout failed");
      }
      const data = await res.json();
      if (paymentMethod === "invoice") {
        const orderId = data.orderId as string;
        window.location.href = `/register/success?order_id=${encodeURIComponent(orderId)}&payment_method=invoice`;
        return;
      }
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      <div className="col-span-3 rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center">
          <User className="text-secondary mr-2 h-5 w-5" />
          <h2 className="text-xl font-semibold text-gray-900">
            Contact Information
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
              Personal Information
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleInputBlur("email")}
                  placeholder="Enter your email address"
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    onBlur={() => handleInputBlur("firstName")}
                    placeholder="Enter your first name"
                    className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                    autoComplete="given-name"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  onBlur={() => handleInputBlur("lastName")}
                  placeholder="Enter your last name"
                  className={errors.lastName ? "border-red-500" : ""}
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  onBlur={() => handleInputBlur("phone")}
                  placeholder="Enter your phone number"
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
              Company Information
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  onBlur={() => handleInputBlur("company")}
                  placeholder="Enter your company name"
                  className={`pl-10 ${errors.company ? "border-red-500" : ""}`}
                  autoComplete="organization"
                />
              </div>
              {errors.company && (
                <p className="text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="vatNumber"
                className="block text-sm font-medium text-gray-700"
              >
                VAT Number <span className="text-gray-500">(optional)</span>
              </label>
              <Input
                id="vatNumber"
                type="text"
                value={formData.vatNumber}
                onChange={(e) => handleInputChange("vatNumber", e.target.value)}
                onBlur={() => handleInputBlur("vatNumber")}
                placeholder="Enter your VAT number"
              />
              <p className="text-sm text-gray-500">
                If you are a corporate customer from an EU member state, please
                provide your corporate VAT number to avoid a 23% VAT charge
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
              Address Information
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                Country / Region <span className="text-red-500">*</span>
              </label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                onBlur={() => handleInputBlur("country")}
                className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${errors.country ? "border-red-500" : ""}`}
                autoComplete="country"
              >
                <option value="">Select a country / region…</option>
                <option value="DE">Germany</option>
                <option value="US">United States (US)</option>
              </select>
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="address1"
                className="block text-sm font-medium text-gray-700"
              >
                Street Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="address1"
                type="text"
                value={formData.address1}
                onChange={(e) => handleInputChange("address1", e.target.value)}
                onBlur={() => handleInputBlur("address1")}
                placeholder="House number and street name"
                className={errors.address1 ? "border-red-500" : ""}
                autoComplete="address-line1"
              />
              {errors.address1 && (
                <p className="text-sm text-red-600">{errors.address1}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="address2"
                className="block text-sm font-medium text-gray-700"
              >
                Apartment, suite, unit, etc.{" "}
                <span className="text-gray-500">(optional)</span>
              </label>
              <Input
                id="address2"
                type="text"
                value={formData.address2}
                onChange={(e) => handleInputChange("address2", e.target.value)}
                onBlur={() => handleInputBlur("address2")}
                placeholder="Apartment, suite, unit, etc. (optional)"
                autoComplete="address-line2"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  Town / City <span className="text-red-500">*</span>
                </label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  onBlur={() => handleInputBlur("city")}
                  placeholder="Enter your city"
                  className={errors.city ? "border-red-500" : ""}
                  autoComplete="address-level2"
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="postcode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Postcode / ZIP <span className="text-red-500">*</span>
                </label>
                <Input
                  id="postcode"
                  type="text"
                  value={formData.postcode}
                  onChange={(e) =>
                    handleInputChange("postcode", e.target.value)
                  }
                  onBlur={() => handleInputBlur("postcode")}
                  placeholder="Enter your postcode"
                  className={errors.postcode ? "border-red-500" : ""}
                  autoComplete="postal-code"
                />
                {errors.postcode && (
                  <p className="text-sm text-red-600">{errors.postcode}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="state"
                className="block text-sm font-medium text-gray-700"
              >
                State / County <span className="text-gray-500">(optional)</span>
              </label>
              <Input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                onBlur={() => handleInputBlur("state")}
                placeholder="Enter your state or county"
                autoComplete="address-level1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
              Additional Information
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes <span className="text-gray-500">(optional)</span>
              </label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                onBlur={() => handleInputBlur("notes")}
                placeholder="Let us know if you have any special requirements."
                rows={3}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="col-span-2">
        <div className="sticky top-24 rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center">
            <Building className="text-secondary mr-2 h-5 w-5" />
            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>
          </div>

          <div className="mb-6 space-y-4">
            {orderQuery.data ? (
              <div className="border-b border-gray-200 py-4">
                <div className="mb-1 text-sm text-gray-600">Event</div>
                <div className="text-lg font-medium text-gray-900">
                  {orderQuery.data.eventTitle || "Event"}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No event selected yet.
              </div>
            )}
          </div>

          {availableDateRanges.length > 0 && (
            <div className="my-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select event date:
              </label>
              <div className="space-y-2">
                {availableDateRanges.map((dateRange) => {
                  const selected =
                    orderQuery.data?.startDate === dateRange.startDate &&
                    orderQuery.data?.endDate === dateRange.endDate
                  return (
                    <label key={dateRange.id} className="flex cursor-pointer items-center space-x-2">
                      <input
                        type="radio"
                        name={`dateRange`}
                        value={dateRange.id}
                        checked={selected}
                        onChange={() => handleSelectDateRange(dateRange)}
                        className="text-secondary focus:ring-secondary h-4 w-4"
                      />
                      <span className="text-sm text-gray-700">
                        {formatDateRange(new Date(dateRange.startDate), new Date(dateRange.endDate))}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Seats Input */}
          <div className="mt-5">
            <label className="text-sm font-medium text-gray-700">Number of seats:</label>
            <div className="mt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(Math.max(1, (orderQuery.data?.quantity ?? 1) - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition-all duration-300 ease-in-out hover:bg-gray-50"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={1000}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 [appearance:textfield] rounded border border-gray-300 px-2 py-1 text-center text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange((quantity ?? 1) + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-900">
                Currency
              </h4>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="currency"
                    value="EUR"
                    checked={currency === "EUR"}
                    onChange={() => handleCurrencyChange("EUR")}
                  />
                  EUR
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="currency"
                    value="USD"
                    checked={currency === "USD"}
                    onChange={() => handleCurrencyChange("USD")}
                  />
                  USD
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
              <span>Total:</span>
              <span className="flex items-center gap-2">{formattedTotal}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Secure payment powered by Stripe
            </p>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Payment Method
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Choose how you’d like to pay.
            </p>

            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as any)}
            >
              <SelectTrigger className="w-full justify-between">
                <SelectValue placeholder="Select a payment method" />
              </SelectTrigger>
              <SelectContent
                align="start"
                className="w-[var(--radix-select-trigger-width)]"
              >
                <SelectItem value="card">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    Credit/Debit Card
                  </span>
                </SelectItem>
                <SelectItem value="invoice">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    Invoice (Net 30)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing || !paymentMethod}
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Processing...
                </>
              ) : paymentMethod === "invoice" ? (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Request Invoice
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
