'use client'

import React, { useState } from 'react'
import { sendGTMEvent } from '@next/third-parties/google'
import { trackHubSpotFormSubmission, identifyHubSpotUser } from '@/lib/hubspot'
import { Button } from '../components/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface InHouseTrainingFormProps {
  title?: string
  buttonText?: string
  trigger?: React.ReactNode
}

export function InHouseTrainingForm({ 
  title = "Request a Tailored In-House Training",
  buttonText = "Request an In-House Training",
  trigger
}: InHouseTrainingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Get form values
    const name = (formData.get('name') as string) || ''
    const function_val = (formData.get('function') as string) || ''
    const company = (formData.get('company') as string) || ''
    const email = (formData.get('email') as string) || ''
    const audience = (formData.get('audience') as string) || ''
    const training_objective = (formData.get('training_objective') as string) || ''

    // Split name into first and last name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Capture current URL
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
    
    // Send POST request to external endpoint
    try {
      const messageParts = []
      if (audience) messageParts.push(`Audience: ${audience}`)
      if (training_objective) messageParts.push(`Training Objective: ${training_objective}`)
      const combinedMessage = messageParts.join('\n\n')
      
      await fetch('https://events.hookdeck.com/e/src_38OYrxGJzwby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'your-name': name,
          'your-company': company,
          'your-email': email,
          'your-phone': '',
          'your-message': combinedMessage,
        }),
      })
    } catch (error) {
      console.error('Failed to submit in-house training form:', error)
    }

    // Send generate_lead event to GTM
    sendGTMEvent({
      event: 'generate_lead',
      form_name: 'in_house_training_form',
      form_location: typeof window !== 'undefined' ? window.location.pathname : '',
      lead_type: 'in_house_training_request',
      company: company,
      email: email,
      has_audience: !!audience,
      has_training_objective: !!training_objective,
    })

    // Track form submission to HubSpot
    const formLocation = typeof window !== 'undefined' ? window.location.pathname : ''
    trackHubSpotFormSubmission(
      {
        name,
        first_name: firstName,
        last_name: lastName,
        function: function_val,
        company,
        email,
        audience: audience || '',
        training_objective: training_objective || '',
        form_name: 'in_house_training_form',
        lead_type: 'in_house_training_request',
      },
      'in_house_training_form',
      formLocation
    )
    
    // Identify user in HubSpot
    if (email) {
      identifyHubSpotUser(email, {
        name,
        first_name: firstName,
        last_name: lastName,
        company,
        function: function_val,
      })
    }

    // Prepare payload
    const payload = {
      name: name,
      first_name: firstName,
      last_name: lastName,
      function: function_val,
      company: company,
      email: email,
      audience_msg: audience,
      objective_msg: training_objective,
      selected_events: [],
      url: currentUrl,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    try {
      // Send to webhook
      const webhookResponse = await fetch('https://hkdk.events/a9jcwbphvthd4q', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!webhookResponse.ok) {
        throw new Error('Failed to submit to webhook')
      }

      // Send email notification (fire-and-forget)
      try {
        await fetch('/api/in-house-training', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch((err) => {
          console.warn('Email notify failed', err)
        })
      } catch (err) {
        console.warn('Email notify init failed', err)
      }

      setIsSubmitted(true)
      e.currentTarget.reset()
      // Close modal after successful submission
      setTimeout(() => {
        setIsOpen(false)
        setIsSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setError('There was an error submitting your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="primary" className="text-lg px-4 py-2">
            {buttonText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Fill out the form below and our team will be in touch to design a program that fits your needs.
          </DialogDescription>
        </DialogHeader>
        
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your request has been submitted successfully. Our team will be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="Full name"
          />
        </div>

        {/* Function */}
        <div>
          <label htmlFor="function" className="mb-2 block text-sm font-medium text-gray-700">
            Function
          </label>
          <input
            type="text"
            id="function"
            name="function"
            className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="Your function/role"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="mb-2 block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="Company name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Please enter a valid email address"
            className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* Audience */}
      <div>
        <label htmlFor="audience" className="mb-2 block text-sm font-medium text-gray-700">
          Who would be audience?
        </label>
        <textarea
          id="audience"
          name="audience"
          rows={3}
          className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
          placeholder="e.g. A mixed group of experienced and new CMC/regulatory managers working on a mAb"
        />
      </div>

      {/* Training Objective */}
      <div>
        <label htmlFor="training_objective" className="mb-2 block text-sm font-medium text-gray-700">
          Training Objective
        </label>
        <textarea
          id="training_objective"
          name="training_objective"
          rows={3}
          className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
          placeholder="Please describe the course you are looking for"
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

