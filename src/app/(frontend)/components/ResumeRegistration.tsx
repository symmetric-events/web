"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ResumeRegistration() {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSessionId(window.localStorage.getItem("sessionId"));
    }
  }, []);

  const { data: order } = useQuery({
    queryKey: ["order", "resume", sessionId],
    enabled: !!sessionId && pathname !== "/register",
    queryFn: async () => {
      const res = await fetch(
        `/api/order?sessionId=${encodeURIComponent(sessionId!)}`,
      );
      if (!res.ok) return null;
      return res.json();
    },
    // Only poll occasionally or on mount
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const unfinishedStatuses = ["draft", "pending", "pending_invoice"];

  if (
    !order ||
    !unfinishedStatuses.includes(order.status) ||
    pathname === "/register"
  ) {
    return null;
  }

  return (
    <Link
      href={`/register?sessionId=${encodeURIComponent(sessionId!)}`}
      className="bg-secondary fixed top-5 lg:top-20 lg:right-4 right-20 z-2 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-gray-900 shadow-xl transition-transform hover:scale-105 active:scale-95"
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Resume registration</span>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
      </span>
    </Link>
  );
}
