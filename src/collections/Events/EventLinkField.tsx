"use client";

import React from "react";
import { useFormFields } from "@payloadcms/ui";

export const EventLinkField: React.FC = () => {
  const slugField = useFormFields(([fields]) => fields.slug);
  const slug = slugField?.value as string | undefined;

  // Get the base URL from environment or use default
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const eventUrl = slug ? `${baseUrl}/event/${slug}` : null;

  if (!eventUrl) {
    return (
      <div className="field-type" style={{ marginBottom: "20px" }}>
        <label
          className="field-label"
          style={{
            marginBottom: "5px",
            display: "block",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          Event Link
        </label>
        <div
          className="field-description"
          style={{
            color: "#888",
            fontSize: "13px",
            lineHeight: "1.4",
          }}
        >
          Enter a slug to generate the event link
        </div>
      </div>
    );
  }

  return (
    <div className="field-type" style={{ marginBottom: "20px" }}>
      <label
        className="field-label"
        style={{
          marginBottom: "5px",
          display: "block",
          fontSize: "13px",
          fontWeight: "bold",
        }}
      >
        Event Link
      </label>
      <div className="field-description" style={{ fontSize: "14px" }}>
        <a
          href={eventUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#0070f3",
            textDecoration: "none",
            borderBottom: "1px solid #0070f3",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {eventUrl} ↗
        </a>
      </div>
    </div>
  );
};
