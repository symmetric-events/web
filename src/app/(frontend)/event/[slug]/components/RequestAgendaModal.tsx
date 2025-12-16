'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/app/(frontend)/components/Button'

interface RequestAgendaModalProps {
  eventSlug: string
  eventTitle: string
  eventId: number | string
  trigger?: React.ReactNode
}

export function RequestAgendaModal({
  eventSlug,
  eventTitle,
  eventId,
  trigger,
}: RequestAgendaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const name = (formData.get('name') as string) || ''
    const company = (formData.get('company') as string) || ''
    const email = (formData.get('email') as string) || ''
    const phone = (formData.get('phone') as string) || ''

    // Split name into first and last name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Capture current URL
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

    try {
      const response = await fetch('/api/request-agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          first_name: firstName,
          last_name: lastName,
          company,
          email,
          phone,
          event_slug: eventSlug,
          event_title: eventTitle,
          event_id: eventId,
          current_url: currentUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send agenda')
      }

      setSuccessMessage(data.message || 'Agenda sent successfully. Please check your inbox or spam folder.')
      setIsSubmitted(true)
      e.currentTarget.reset()
      // Close modal after successful submission
      setTimeout(() => {
        setIsOpen(false)
        setIsSubmitted(false)
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'There was an error submitting your request. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="primary" className="text-lg px-4 py-2">
            Request Event Agenda
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Request Event Agenda
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Fill out the form below to receive the training agenda via email.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Agenda Sent Successfully!
            </h3>
            <div
              className="text-gray-600 space-y-2"
              dangerouslySetInnerHTML={{
                __html: successMessage || 'Please check your inbox or spam folder.',
              }}
            />
            <p className="text-sm text-gray-500 mt-4">
              <strong>NOTE:</strong> If you haven't received the agenda, please
              contact us directly at{' '}
              <a
                href="mailto:laura.kristensen@symmetricevents.com"
                className="text-secondary hover:underline"
              >
                laura.kristensen@symmetricevents.com
              </a>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Event Info */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Event:
              </label>
              <p className="text-gray-900 font-medium">{eventTitle}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Your Name <span className="text-red-500">*</span>
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

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Your Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                  placeholder="Company name"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Your Email <span className="text-red-500">*</span>
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

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Your Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? 'Sending...' : 'Send Agenda'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

