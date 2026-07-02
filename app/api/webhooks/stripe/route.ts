import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = createSupabaseServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    if (userId && session.customer) {
      await service
        .from('tenants')
        .update({ stripe_customer_id: session.customer as string })
        .eq('user_id', userId)
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const sub = event.data.object as Stripe.Subscription
    const priceId = sub.items.data[0]?.price.id
    const customerId = sub.customer as string

    let plan = 'free'
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = 'starter'
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro'

    await service
      .from('tenants')
      .update({ plan, stripe_subscription_id: sub.id })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await service
      .from('tenants')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('stripe_customer_id', sub.customer as string)
  }

  return NextResponse.json({ received: true })
}
