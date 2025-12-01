/**
 * Generate ICS calendar file content with reminders
 * Supports reminders 1 week and 1 day before the event
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  url?: string;
}

/**
 * Format date for ICS format (YYYYMMDDTHHmmssZ)
 * Assumes date is already in UTC if time is provided
 */
function formatICSDate(date: Date, time?: string): string {
  if (time) {
    // Use UTC methods to ensure correct formatting
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const [hours, minutes] = time.split(":").map(Number);
    return `${year}${month}${day}T${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}00Z`;
  }

  // All-day event - use local date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}T000000Z`;
}

/**
 * Escape text for ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generate ICS file content with reminders
 */
export function generateICS(event: CalendarEvent): string {
  const lines: string[] = [];

  // ICS Header
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//Symmetric Events//Training Calendar//EN");
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");

  // Event
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${Date.now()}-${Math.random().toString(36).substring(7)}@symmetric.events`);
  lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
  lines.push(`DTSTART:${formatICSDate(event.startDate, event.startTime)}`);
  lines.push(`DTEND:${formatICSDate(event.endDate, event.endTime || event.startTime)}`);
  lines.push(`SUMMARY:${escapeICS(event.title)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  // Reminder 1 week before (7 days = 10080 minutes)
  lines.push("BEGIN:VALARM");
  lines.push("ACTION:DISPLAY");
  lines.push("TRIGGER:-P7D"); // 7 days before
  lines.push(`DESCRIPTION:Reminder: ${escapeICS(event.title)} in 1 week`);
  lines.push("END:VALARM");

  // Reminder 1 day before (1 day = 1440 minutes)
  lines.push("BEGIN:VALARM");
  lines.push("ACTION:DISPLAY");
  lines.push("TRIGGER:-P1D"); // 1 day before
  lines.push(`DESCRIPTION:Reminder: ${escapeICS(event.title)} tomorrow`);
  lines.push("END:VALARM");

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Download ICS file
 */
export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarURL(event: CalendarEvent): string {
  const params = new URLSearchParams();

  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  const start = formatICSDate(event.startDate, event.startTime);
  const end = formatICSDate(event.endDate, event.endTime || event.startTime);

  params.set("action", "TEMPLATE");
  params.set("text", event.title);
  params.set("dates", `${start}/${end}`);

  if (event.description) {
    params.set("details", event.description);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  // Google Calendar doesn't support custom reminders via URL, but users can set them manually
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Format date for Outlook Calendar (ISO 8601 format: YYYY-MM-DDTHH:mm:ss)
 */
function formatOutlookDate(date: Date, time?: string): string {
  if (time) {
    // Use UTC methods since date is in UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const [hours, minutes] = time.split(":").map(Number);
    return `${year}-${month}-${day}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  }
  // All-day event
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00`;
}

/**
 * Generate Outlook Calendar URL
 */
export function generateOutlookCalendarURL(event: CalendarEvent): string {
  const params = new URLSearchParams();

  // Outlook expects ISO 8601 format dates
  const start = formatOutlookDate(event.startDate, event.startTime);
  const end = formatOutlookDate(event.endDate, event.endTime || event.startTime);

  params.set("subject", event.title);
  params.set("startdt", start);
  params.set("enddt", end);

  if (event.description) {
    params.set("body", event.description);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar URL
 */
export function generateYahooCalendarURL(event: CalendarEvent): string {
  const params = new URLSearchParams();

  // Yahoo uses a different date format (local time, not UTC)
  const formatYahooDate = (date: Date, time?: string) => {
    if (time) {
      // Use UTC methods since date is in UTC
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const [hours, minutes] = time.split(":").map(Number);
      return `${year}${month}${day}T${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}00`;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  params.set("v", "60");
  params.set("view", "d");
  params.set("type", "20");
  params.set("title", event.title);
  params.set("st", formatYahooDate(event.startDate, event.startTime));
  params.set("dur", "0100"); // Duration in hours:minutes

  if (event.description) {
    params.set("desc", event.description);
  }

  if (event.location) {
    params.set("in_loc", event.location);
  }

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

