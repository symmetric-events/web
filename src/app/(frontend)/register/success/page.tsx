'use client'

import { Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import posthog from 'posthog-js'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const paymentMethod = searchParams.get('payment_method')
  const orderId = searchParams.get('order_id')
  const hasTrackedRef = useRef(false)

  // Track checkout completion once on mount via ref to avoid duplicate tracking
  if (!hasTrackedRef.current) {
    hasTrackedRef.current = true
    posthog.capture('checkout_completed', {
      session_id: sessionId || null,
      order_id: orderId || null,
      payment_method: paymentMethod || 'card',
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-22">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {paymentMethod === 'invoice' ? 'Invoice Requested!' : 'Payment Successful!'}
            </h1>
            <p className="text-gray-600">
              {paymentMethod === 'invoice' 
                ? 'Thank you for your registration. Your invoice has been generated and will be sent to you shortly.'
                : 'Thank you for your purchase. Your training registration has been confirmed.'
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What happens next?
            </h2>
            <div className="space-y-3 text-left">
              {paymentMethod === 'invoice' ? (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#FF9800]/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">1</span>
                    </div>
                    <p className="text-gray-700">
                      You will receive an invoice via email within the next few minutes with payment terms.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#FF9800]/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">2</span>
                    </div>
                    <p className="text-gray-700">
                      Once payment is received, you will get a confirmation email with your registration details.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#FF9800]/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">3</span>
                    </div>
                    <p className="text-gray-700">
                      Training materials and access instructions will be sent closer to the event date.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#FF9800]/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">1</span>
                    </div>
                    <p className="text-gray-700">
                      You will receive a confirmation email with your registration details within the next few minutes.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#FF9800]/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">2</span>
                    </div>
                    <p className="text-gray-700">
                      Training materials and access instructions will be sent to you closer to the event date.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#FF9800]/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">3</span>
                    </div>
                    <p className="text-gray-700">
                      If you have any questions, please contact our support team.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/event"
              className="inline-flex items-center justify-center w-full bg-secondary hover:text-secondary hover:bg-transparent border-2 border-secondary text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Browse More Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <Link
              href="/contact"
              className="inline-flex items-center justify-center w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
