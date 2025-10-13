'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-gray-600">
              Your payment was cancelled. No charges have been made to your account.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Need help with your order?
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <p className="text-gray-700">
                  Your items are still in your cart and ready for checkout.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <p className="text-gray-700">
                  You can try again with a different payment method.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <p className="text-gray-700">
                  Contact our support team if you need assistance.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/events"
              className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Return to Cart
            </Link>
            
            <Link
              href="/events"
              className="inline-flex items-center justify-center w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Events
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you continue to experience issues, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
