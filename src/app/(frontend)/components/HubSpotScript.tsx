"use client";

import { useEffect } from "react";
import Script from "next/script";

interface HubSpotScriptProps {
  portalId: string;
}

/**
 * HubSpot Tracking Script Component
 * 
 * Loads the HubSpot tracking code which enables:
 * - Automatic form submission tracking
 * - Page view tracking
 * - User identification
 * - Custom event tracking
 */
export function HubSpotScript({ portalId }: HubSpotScriptProps) {
  useEffect(() => {
    // Initialize HubSpot tracking queue if it doesn't exist
    if (typeof window !== 'undefined' && !window._hsq) {
      window._hsq = [];
    }
  }, []);

  return (
    <Script
      id="hubspot-tracking"
      strategy="afterInteractive"
      src={`https://js.hs-scripts.com/${portalId}.js`}
    />
  );
}

