import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  const planFromPrice = (priceId: string): string => {
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro';
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter';
    return 'free';
  };

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const tenantId = session.metadata?.tenantId;
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = sub.items.data[0]?.price.id;
    const plan = planFromPrice(priceId);

    await supabaseAdmin.from('tenants')
      .update({ plan, stripe_subscription_id: sub.id })
      .eq('id', tenantId);
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await supabaseAdmin.from('tenants')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id);
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    const priceId = sub.items.data[0]?.price.id;
    const plan = planFromPrice(priceId);
    await supabaseAdmin.from('tenants')
      .update({ plan })
      .eq('stripe_subscription_id', sub.id);
  }

  return NextResponse.json({ received: true });
}
