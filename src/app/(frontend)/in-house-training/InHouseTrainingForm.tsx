'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../components/Button'

export function InHouseTrainingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const successMessageRef = useRef<HTMLDivElement>(null)

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
    } catch (error) {
      console.error('Error:', error)
      setError('There was an error submitting your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Scroll to success message when it appears
  useEffect(() => {
    if (isSubmitted && successMessageRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        successMessageRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 100)
    }
  }, [isSubmitted])

  if (isSubmitted) {
    return (
      <div 
        ref={successMessageRef}
        className="rounded-lg bg-green-50 p-8 text-center border border-green-100"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-800">Thank You!</h3>
        <p className="text-gray-600 mb-4">
          Your request has been submitted successfully. Our team will be in touch soon.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            setIsSubmitted(false)
            if (typeof window !== 'undefined') {
              window.location.href = '/'
            }
          }}
        >
          Go to Homepage
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
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

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
          className="px-8 py-3 text-base"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  )
}

