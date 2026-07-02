import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/keys'
import { PLANS } from '@/lib/stripe'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createSupabaseServiceClient()
  const { data: tenant } = await service.from('tenants').select('id').eq('user_id', user.id).single()
  if (!tenant) return NextResponse.json({ keys: [] })

  const { data: keys } = await service
    .from('api_keys')
    .select('id, key_prefix, name, rate_limit_per_minute, monthly_limit, is_active, total_calls, created_at, expires_at')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ keys: keys ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createSupabaseServiceClient()
  const { data: tenant } = await service
    .from('tenants')
    .select('id, plan')
    .eq('user_id', user.id)
    .single()
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const plan = PLANS[tenant.plan as keyof typeof PLANS] ?? PLANS.free

  const { count } = await service
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  if ((count ?? 0) >= plan.max_keys) {
    return NextResponse.json(
      { error: `Your ${plan.name} plan allows max ${plan.max_keys} key(s). Upgrade to create more.` },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { raw, prefix, hash } = generateApiKey()

  await service.from('api_keys').insert({
    tenant_id: tenant.id,
    key_hash: hash,
    key_prefix: prefix,
    name: body.name || 'My Key',
    rate_limit_per_minute: plan.rate_limit_per_minute,
    monthly_limit: plan.monthly_calls,
  })

  return NextResponse.json({ key: raw, prefix })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const keyId = searchParams.get('id')
  if (!keyId) return NextResponse.json({ error: 'Missing key id' }, { status: 400 })

  const service = createSupabaseServiceClient()
  const { data: tenant } = await service.from('tenants').select('id').eq('user_id', user.id).single()

  await service.from('api_keys').update({ is_active: false }).eq('id', keyId).eq('tenant_id', tenant!.id)

  return NextResponse.json({ success: true })
}
