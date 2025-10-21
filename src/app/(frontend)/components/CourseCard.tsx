import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Globe, Clock, Euro, DollarSign } from "lucide-react";

interface CourseCardProps {
  title: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  slug: string;
  status?: string;
  statusColor?: "green" | "blue" | "yellow" | "red";
  trainingType?: "online" | "in-person";
  trainingLocation?: string;
  featuredImage?: string;
  description?: string;
  priceEUR?: number;
  priceUSD?: number;
  currency?: "EUR" | "USD";
  startTime?: string;
  endTime?: string;
  duration?: string;
  category?: string;
}

export function CourseCard({
  title,
  date,
  startDate,
  endDate,
  slug,
  status = "Upcoming",
  statusColor = "green",
  trainingType,
  trainingLocation,
  featuredImage,
  description,
  priceEUR,
  priceUSD,
  currency = "EUR",
  startTime,
  endTime,
  duration,
  category,
}: CourseCardProps) {
  const statusColorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    // Use startDate if available, otherwise fall back to date prop
    const primaryDate = startDate || date;
    if (!primaryDate) return "Date TBD";

    try {
      // If date prop is an ISO string followed by a time range (e.g.,
      // "2026-02-23T14:00:00.000Z 09:00 - 17:00"), extract the ISO part
      let baseDateStr = primaryDate;
      const isoMatch = primaryDate.match(/\d{4}-\d{2}-\d{2}T[^\s]+Z/);
      if (isoMatch) baseDateStr = isoMatch[0];

      const start = new Date(baseDateStr);

      // Check if date is valid
      if (isNaN(start.getTime())) {
        // If invalid, return the original string if it looks like a date
        if (primaryDate && primaryDate.length > 5) {
          return primaryDate;
        }
        return "Date TBD";
      }

      // If we have an end date, format as range
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          const startMonth = start.toLocaleDateString("en-GB", {
            month: "long",
          });
          const endMonth = end.toLocaleDateString("en-GB", { month: "long" });
          const startYear = start.getFullYear();
          const endYear = end.getFullYear();

          if (start.toDateString() === end.toDateString()) {
            // Same day
            return start.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          } else if (startMonth === endMonth && startYear === endYear) {
            // Same month and year
            return `${start.getDate()} – ${end.getDate()} ${startMonth} ${startYear}`;
          } else if (startYear === endYear) {
            // Same year, different months
            const startFormatted = start.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
            });
            const endFormatted = end.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return `${startFormatted} – ${endFormatted}`;
          } else {
            // Different years
            const startFormatted = start.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const endFormatted = end.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return `${startFormatted} – ${endFormatted}`;
          }
        }
      }

      // Single date
      return start.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return primaryDate || "Date TBD";
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    return time;
  };

  const getTimeDisplay = () => {
    if (startTime && endTime) {
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }
    if (startTime) return `From ${formatTime(startTime)}`;
    if (duration) return duration;

    // Derive time range from `date` prop if it contains one (e.g., "... 09:00 - 17:00")
    if (date) {
      const timeRangeMatch = date.match(
        /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/,
      );
      if (timeRangeMatch) {
        return `${timeRangeMatch[1]} - ${timeRangeMatch[2]}`;
      }
    }
    return "";
  };

  const formattedDate = formatDateRange(startDate, endDate);
  const timeDisplay = getTimeDisplay();

  // Temporary debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("CourseCard Debug:", {
      title,
      date,
      startDate,
      endDate,
      startTime,
      endTime,
      formattedDate,
      timeDisplay,
    });
  }

  return (
    <Link href={`/events/${slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-all duration-300 ">
        {/* Image Section */}
        <div className="relative h-36 w-full overflow-hidden">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-6xl opacity-20">📚</div>
            </div>
          )}

          {/* Status Badge */}
          {status && (
            <div
              className={`absolute top-4 right-4 ${statusColorClasses[statusColor]} rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg`}
            >
              {status}
            </div>
          )}

          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
              {category}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          <h3 className="group-hover:text-secondary mb-3 text-xl font-bold text-gray-900 transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="mb-4 text-sm text-gray-600">{description}</p>
          )}

          {/* Date and Time */}
          {(formattedDate || timeDisplay) && (
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              {formattedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="text-secondary h-4 w-4" />
                  <span className="text-sm font-semibold">{formattedDate}</span>
                </div>
              )}
              {timeDisplay && (
                <div className="mt-1 flex items-center gap-2 text-gray-600">
                  <Clock className="ml-[1px] h-3.5 w-3.5" />
                  <span className="text-sm">{timeDisplay}</span>
                </div>
              )}
            </div>
          )}

          {/* Training Type and Location */}
          <div className="mb-4 flex items-center gap-2">
            {trainingType === "online" ? (
              <div className="text-secondary flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <MapPin className="text-secondary h-4 w-4" />
                <span className="text-sm font-medium">
                  {trainingLocation || "In-Person"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
