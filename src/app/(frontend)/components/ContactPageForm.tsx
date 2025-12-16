'use client'

import React, { useState } from 'react'
// import { sendGTMEvent } from '@next/third-parties/google'
import { trackHubSpotFormSubmission, identifyHubSpotUser } from '~/lib/hubspot'
import { Button } from './Button'
import posthog from 'posthog-js'

interface ContactPageFormProps {
  onSubmit?: (data: FormData) => void
}

export function ContactPageForm({ onSubmit }: ContactPageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    // Extract form values for GTM tracking
    const name = (formData.get('name') as string) || ''
    const company = (formData.get('company') as string) || ''
    const email = (formData.get('email') as string) || ''
    const phone = (formData.get('phone') as string) || ''
    const message = (formData.get('message') as string) || ''
    
    // Send generate_lead event to GTM
    // sendGTMEvent({
    //   event: 'generate_lead',
    //   form_name: 'contact_page_form',
    //   form_location: typeof window !== 'undefined' ? window.location.pathname : '',
    //   lead_type: 'contact_inquiry',
    //   company: company,
    //   email: email,
    //   phone: phone,
    //   has_message: !!message,
    // })
    
    // Track form submission to HubSpot
    const formLocation = typeof window !== 'undefined' ? window.location.pathname : ''
    trackHubSpotFormSubmission(
      {
        name,
        company,
        email,
        phone,
        message: message || '',
        form_name: 'contact_page_form',
        lead_type: 'contact_inquiry',
      },
      'contact_page_form',
      formLocation
    )
    
    // Identify user in HubSpot
    if (email) {
      identifyHubSpotUser(email, {
        name,
        company,
        phone,
      })
    }

    // PostHog: Identify user and track contact form submission
    if (email) {
      posthog.identify(email, {
        email: email,
        name: name,
        company: company,
        phone: phone,
      })
    }

    posthog.capture('contact_form_submitted', {
      company: company,
      has_message: !!message,
      form_location: typeof window !== 'undefined' ? window.location.pathname : '',
    })

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default form submission logic
        console.log('Form submitted:', Object.fromEntries(formData))
      }
      setIsSubmitted(true)
      // Reset form after successful submission
      setTimeout(() => {
        setIsSubmitted(false)
        e.currentTarget.reset()
      }, 3000)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg bg-green-50 p-8 text-center border border-green-100">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-800">Thank You!</h3>
        <p className="text-gray-600">Your message has been submitted successfully. Our team will get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Full name"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
            Your company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Company name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Your email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="email@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Your contact number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>
      
      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="How can we help you?"
        />
      </div>
      
      {/* Submit Button */}
      <div>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-2.5 text-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Message'}
        </Button>
      </div>
    </form>
  )
}
