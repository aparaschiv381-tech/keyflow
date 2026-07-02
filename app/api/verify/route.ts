import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { hashApiKey } from '@/lib/keys'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  const start = Date.now()

  try {
    const body = await req.json()
    const rawKey: string = body.key || req.headers.get('x-api-key') || ''

    if (!rawKey) {
      return NextResponse.json({ valid: false, error: 'No API key provided' }, { status: 401 })
    }

    const keyHash = hashApiKey(rawKey)
    const supabase = createSupabaseServiceClient()

    const { data: keyRow, error } = await supabase
      .from('api_keys')
      .select('id, tenant_id, is_active, rate_limit_per_minute, monthly_limit, total_calls, expires_at, name')
      .eq('key_hash', keyHash)
      .single()

    if (error || !keyRow) {
      return NextResponse.json({ valid: false, error: 'Invalid API key' }, { status: 401 })
    }

    if (!keyRow.is_active) {
      return NextResponse.json({ valid: false, error: 'API key is revoked' }, { status: 403 })
    }

    if (keyRow.expires_at && new Date(keyRow.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'API key expired' }, { status: 403 })
    }

    const { data: tenant } = await supabase
      .from('tenants')
      .select('plan, calls_this_month')
      .eq('id', keyRow.tenant_id)
      .single()

    if (tenant && tenant.calls_this_month >= keyRow.monthly_limit) {
      return NextResponse.json({ valid: false, error: 'Monthly limit exceeded. Upgrade your plan.' }, { status: 429 })
    }

    const now = Date.now()
    const windowMs = 60_000
    const rlKey = keyRow.id
    const rl = rateLimitStore.get(rlKey)

    if (!rl || now > rl.resetAt) {
      rateLimitStore.set(rlKey, { count: 1, resetAt: now + windowMs })
    } else if (rl.count >= keyRow.rate_limit_per_minute) {
      return NextResponse.json(
        { valid: false, error: 'Rate limit exceeded', retryAfter: Math.ceil((rl.resetAt - now) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - now) / 1000)) } }
      )
    } else {
      rl.count++
    }

    const latency = Date.now() - start
    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      supabase.from('usage_events').insert({
        api_key_id: keyRow.id,
        tenant_id: keyRow.tenant_id,
        endpoint: body.endpoint || 'unknown',
        status_code: 200,
        latency_ms: latency,
      }),
      supabase.rpc('increment_daily_usage', {
        p_tenant_id: keyRow.tenant_id,
        p_date: today,
        p_count: 1,
      }),
      supabase
        .from('tenants')
        .update({ calls_this_month: (tenant?.calls_this_month ?? 0) + 1 })
        .eq('id', keyRow.tenant_id),
      supabase
        .from('api_keys')
        .update({ total_calls: keyRow.total_calls + 1 })
        .eq('id', keyRow.id),
    ]).catch(() => {})

    return NextResponse.json({
      valid: true,
      keyName: keyRow.name,
      tenantId: keyRow.tenant_id,
      rateLimit: keyRow.rate_limit_per_minute,
      remaining: keyRow.rate_limit_per_minute - (rateLimitStore.get(rlKey)?.count ?? 1),
    })

  } catch {
    return NextResponse.json({ valid: false, error: 'Internal error' }, { status: 500 })
  }
}
