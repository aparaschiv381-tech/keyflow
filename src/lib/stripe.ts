import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export const PLANS = {
  free:    { name: 'Free',    callsPerMonth: 10_000,   keysLimit: 1,   price: 0 },
  starter: { name: 'Starter', callsPerMonth: 500_000,  keysLimit: 10,  price: 19 },
  pro:     { name: 'Pro',     callsPerMonth: 5_000_000, keysLimit: 999, price: 79 },
};
