import posthog from "posthog-js";

// Only initialize PostHog on frontend pages, not admin
const isAdminPage = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

if (!isAdminPage && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  try {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2025-05-24",
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
    });
  } catch (e) {
    // PostHog initialization failed (likely blocked by ad blocker)
    console.warn("PostHog initialization failed:", e);
  }
}
