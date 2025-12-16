import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts various video URL formats to embed URLs for iframes
 * Supports:
 * - YouTube: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
 * - Vimeo: vimeo.com/..., player.vimeo.com/video/...
 * - Returns original URL if not a recognized format or already embed-ready
 */
export function getVideoEmbedUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  try {
    const urlObj = new URL(url)

    // YouTube handling
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId: string | null = null

      // youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes("youtube.com") && urlObj.pathname === "/watch") {
        videoId = urlObj.searchParams.get("v")
      }
      // youtube.com/embed/VIDEO_ID (already embed format)
      else if (urlObj.pathname.startsWith("/embed/")) {
        return url // Already in embed format
      }
      // youtu.be/VIDEO_ID
      else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1) // Remove leading slash
      }
      // youtube.com/v/VIDEO_ID
      else if (urlObj.pathname.startsWith("/v/")) {
        videoId = urlObj.pathname.slice(3)
      }

      if (videoId) {
        // Remove any additional parameters from video ID
        const cleanVideoId = videoId.split("&")[0]?.split("?")[0] ?? videoId
        return `https://www.youtube.com/embed/${cleanVideoId}`
      }
    }

    // Vimeo handling
    if (urlObj.hostname.includes("vimeo.com")) {
      let videoId: string | null = null

      // vimeo.com/VIDEO_ID
      if (urlObj.hostname === "vimeo.com" || urlObj.hostname === "www.vimeo.com") {
        videoId = urlObj.pathname.slice(1) // Remove leading slash
      }
      // player.vimeo.com/video/VIDEO_ID (already embed format)
      else if (urlObj.hostname.includes("player.vimeo.com")) {
        return url // Already in embed format
      }

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`
      }
    }

    // Return original URL if not recognized (might be direct video link or other format)
    return url
  } catch {
    // If URL parsing fails, return original
    return url
  }
}
