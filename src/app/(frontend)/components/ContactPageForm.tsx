'use client'

import React, { useState } from 'react'
import { Button } from './Button'

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
      <div className="text-center py-8">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You!</h3>
        <p className="text-gray-600">Your message has been submitted successfully. Our team will get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center">
          <label htmlFor="name" className="w-48 text-sm font-medium text-gray-700">
            Your name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="flex items-center">
          <label htmlFor="company" className="w-48 text-sm font-medium text-gray-700">
            Your company *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your company name"
          />
        </div>
        
        <div className="flex items-center">
          <label htmlFor="email" className="w-48 text-sm font-medium text-gray-700">
            Your email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email address"
          />
        </div>
        
        <div className="flex items-center">
          <label htmlFor="phone" className="w-48 text-sm font-medium text-gray-700">
            Your contact number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div className="flex items-start">
          <label htmlFor="message" className="w-48 text-sm font-medium text-gray-700 pt-3">
            Message
          </label>
          <input
            type="text"
            id="message"
            name="message"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your message"
          />
        </div>
        
        <div className="flex items-center">
          <div className="w-48"></div>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
            className="px-8 py-3"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </form>
  )
}
