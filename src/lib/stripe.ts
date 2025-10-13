import Stripe from 'stripe'
import { env } from '~/env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
})

export const formatAmountForStripe = (amount: number, currency: string): number => {
  // Convert dollars to cents
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number, currency: string): number => {
  // Convert cents to dollars
  return amount / 100
}
