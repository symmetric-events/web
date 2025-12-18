'use client'

import React, { useState } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'
import { trackHubSpotFormSubmission, identifyHubSpotUser } from '~/lib/hubspot'
import { Button } from '../components/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

interface RequestConsultingFormProps {
  title?: string
  buttonText?: string
  onSubmit?: (data: FormData) => void
}

export function RequestConsultingForm({ 
  title = "Request a Consulting Session", 
  buttonText = "Request a Consulting Session",
  onSubmit 
}: RequestConsultingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
    
    // Send POST request to external endpoint
    try {
      await fetch('https://events.hookdeck.com/e/src_spgmM6KHIsUY', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'your-name': name,
          'your-company': company,
          'your-email': email,
          'your-phone': phone,
          'your-message': message,
        }),
      })
    } catch (error) {
      console.error('Failed to submit consulting form:', error)
    }
    
    // Send generate_lead event to GTM
    sendGTMEvent({
      event: 'generate_lead',
      form_name: 'consulting_session_form',
      form_location: typeof window !== 'undefined' ? window.location.pathname : '',
      lead_type: 'consulting_request',
      company: company,
      email: email,
      phone: phone,
      has_message: !!message,
    })
    
    // Track form submission to HubSpot
    const formLocation = typeof window !== 'undefined' ? window.location.pathname : ''
    trackHubSpotFormSubmission(
      {
        name,
        company,
        email,
        phone,
        message: message || '',
        form_name: 'consulting_session_form',
        lead_type: 'consulting_request',
      },
      'consulting_session_form',
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
    
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default form submission logic
        console.log('Form submitted:', Object.fromEntries(formData))
      }
      setIsSubmitted(true)
      // Close modal after successful submission
      setTimeout(() => {
        setIsOpen(false)
        setIsSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" className="text-lg px-4 py-2">
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Fill out the form below and our team will get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your consulting request has been submitted successfully. Our team will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Your company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Your email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Your contact number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about your consulting needs..."
              />
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}