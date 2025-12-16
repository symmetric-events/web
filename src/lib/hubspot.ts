/**
 * HubSpot tracking utilities
 * 
 * This module provides functions to track form submissions and events to HubSpot.
 * HubSpot automatically tracks form submissions when forms are submitted on pages
 * with the HubSpot tracking code installed.
 * 
 * For custom event tracking, we use the HubSpot Events API.
 */

/**
 * Track a form submission event to HubSpot
 * This sends a custom event that can be used in HubSpot workflows and analytics
 * 
 * @param eventName - The name of the event (e.g., 'form_submission')
 * @param properties - Additional properties to send with the event
 */
export function trackHubSpotEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;

  // Check if HubSpot tracking is loaded
  const hubspotLoaded = typeof window.hsConversationsAPI !== 'undefined' || 
                        typeof window.hsConversationsOnReady !== 'undefined';

  if (!hubspotLoaded) {
    // Fallback: use the _hsq queue if available
    if (typeof window._hsq !== 'undefined') {
      window._hsq.push(['trackCustomBehavioralEvent', {
        name: eventName,
        properties: properties || {}
      }]);
    }
    return;
  }

  // Use HubSpot Conversations API if available
  if (typeof window.hsConversationsAPI !== 'undefined') {
    window.hsConversationsAPI.track(eventName, properties || {});
  }
}

/**
 * Track a form submission with form details
 * This is specifically for form submission tracking
 * 
 * @param formData - Form data object with form fields
 * @param formName - Name/identifier of the form
 * @param formLocation - URL path where the form was submitted
 */
export function trackHubSpotFormSubmission(
  formData: Record<string, string | number | boolean>,
  formName: string,
  formLocation?: string
): void {
  if (typeof window === 'undefined') return;

  const properties: Record<string, string | number | boolean> = {
    form_name: formName,
    form_location: formLocation || (typeof window !== 'undefined' ? window.location.pathname : ''),
    ...formData
  };

  trackHubSpotEvent('form_submission', properties);
}

/**
 * Identify a user in HubSpot
 * This associates form submissions with a user's email
 * 
 * @param email - User's email address
 * @param properties - Additional user properties
 */
export function identifyHubSpotUser(
  email: string,
  properties?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;

  // HubSpot automatically identifies users by email when forms are submitted
  // But we can also explicitly identify using the tracking code
  if (typeof window._hsq !== 'undefined') {
    window._hsq.push(['identify', {
      email: email,
      ...properties
    }]);
  }
}

// TypeScript declarations for HubSpot global objects
declare global {
  interface Window {
    _hsq?: Array<[string, Record<string, unknown>]>;
    hsConversationsAPI?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void;
    };
    hsConversationsOnReady?: Array<() => void>;
  }
}

