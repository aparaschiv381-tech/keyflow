import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    monthly_calls: 10_000,
    max_keys: 1,
    rate_limit_per_minute: 30,
    stripe_price_id: null,
  },
  starter: {
    name: 'Starter',
    price: 19,
    monthly_calls: 500_000,
    max_keys: 10,
    rate_limit_per_minute: 120,
    stripe_price_id: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  pro: {
    name: 'Pro',
    price: 79,
    monthly_calls: 5_000_000,
    max_keys: 100,
    rate_limit_per_minute: 600,
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID!,
  },
}
