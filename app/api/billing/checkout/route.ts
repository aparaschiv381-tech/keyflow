import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig || !planConfig.stripe_price_id) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const service = createSupabaseServiceClient()
  const { data: tenant } = await service
    .from('tenants')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: tenant?.stripe_customer_id ?? undefined,
    customer_email: tenant?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price: planConfig.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: { user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}
