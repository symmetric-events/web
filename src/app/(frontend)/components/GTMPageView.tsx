"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracks page views for Google Tag Manager on client-side navigation
 * This is necessary because Next.js App Router uses client-side navigation
 * which doesn't trigger full page reloads
 */
export function GTMPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
