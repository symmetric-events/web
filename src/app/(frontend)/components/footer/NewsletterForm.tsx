"use client";

import React, { useState } from "react";
import Link from "next/link";
// import { sendGTMEvent } from "@next/third-parties/google";
import { trackHubSpotFormSubmission, identifyHubSpotUser } from "~/lib/hubspot";
import posthog from "posthog-js";

export const NewsletterForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Extract form values for GTM tracking
    const company = (formData.get('company') as string) || ''
    const firstName = (formData.get('firstName') as string) || ''
    const lastName = (formData.get('lastName') as string) || ''
    const email = (formData.get('email') as string) || ''
    const consent = formData.get('consent') === 'on'
    
    // Send POST request to external endpoint
    try {
      await fetch('https://hkdk.events/AUb8zjvFIDTD', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'your-company': company,
          'your-first-name': firstName,
          'your-last-name': lastName,
          'your-email': email,
          'your-consent': consent,
        }),
      });
    } catch (error) {
      console.error('Failed to submit newsletter form:', error);
    }
    
    // Send generate_lead event to GTM
    //  sendGTMEvent({
    //   event: 'generate_lead',
    //   form_name: 'newsletter_signup',
    //   form_location: typeof window !== 'undefined' ? window.location.pathname : '',
    //   lead_type: 'newsletter_subscription',
    //   company: company,
    //   email: email,
    //   has_consent: consent,
    // })
    
    // Track form submission to HubSpot
    const formLocation = typeof window !== 'undefined' ? window.location.pathname : ''
    trackHubSpotFormSubmission(
      {
        first_name: firstName,
        last_name: lastName,
        company: company || '',
        email,
        consent: consent ? 'yes' : 'no',
        form_name: 'newsletter_signup',
        lead_type: 'newsletter_subscription',
      },
      'newsletter_signup',
      formLocation
    )
    
    // Identify user in HubSpot
    if (email) {
      identifyHubSpotUser(email, {
        first_name: firstName,
        last_name: lastName,
        company: company || '',
      })
    }

    // PostHog: Identify user and track newsletter signup
    if (email) {
      posthog.identify(email, {
        email: email,
        first_name: firstName,
        last_name: lastName,
        company: company || '',
      })
    }

    posthog.capture('newsletter_signup', {
      company: company || null,
      has_consent: consent,
      form_location: typeof window !== 'undefined' ? window.location.pathname : '',
    })

    // Reset form after a brief delay
    setTimeout(() => {
      e.currentTarget.reset();
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        name="company"
        placeholder="Company"
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="text"
        name="firstName"
        placeholder="First name"
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last name"
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="email"
        name="email"
        placeholder="Email address"
        required
        className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex items-center">
        <input type="checkbox" id="consent" name="consent" required className="mr-3 h-4 w-4" />
        <label htmlFor="consent" className="text-gray-800">
          I agree with the{" "}
          <Link
            href="/privacy-policy"
            className="underline text-sky-700"
          >
            terms and conditions
          </Link>
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded bg-gray-700 px-8 py-3 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50"
      >
        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
};
