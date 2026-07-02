import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyKey } from '@/lib/key-utils';
import { checkRateLimit } from '@/lib/rate-limiter';
import { PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, error: 'Missing key' }, { status: 400 });
    }

    // Fetch all active keys and find match (bcrypt compare)
    // In production: index on key prefix first to narrow search
    const prefix = key.slice(0, 16);
    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, key_hash, rate_limit_per_minute, tenant_id, monthly_limit, total_calls, is_active, expires_at, tenants(plan)')
      .eq('is_active', true)
      .like('key_prefix', prefix + '%');

    if (error || !keys || keys.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid key' }, { status: 401 });
    }

    let matched = null;
    for (const k of keys) {
      if (verifyKey(key, k.key_hash)) { matched = k; break; }
    }
    if (!matched) {
      return NextResponse.json({ valid: false, error: 'Invalid key' }, { status: 401 });
    }

    // Check expiry
    if (matched.expires_at && new Date(matched.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Key expired' }, { status: 401 });
    }

    // Check monthly quota
    const plan = (matched.tenants as any)?.plan ?? 'free';
    const planLimits = PLANS[plan as keyof typeof PLANS];
    if (matched.total_calls >= planLimits.callsPerMonth) {
      return NextResponse.json({ valid: false, error: 'Monthly quota exceeded' }, { status: 429 });
    }

    // Rate limit check
    const { allowed, remaining } = checkRateLimit(matched.id, matched.rate_limit_per_minute);
    if (!allowed) {
      return NextResponse.json({ valid: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Async: increment total_calls counter
    supabaseAdmin
      .from('api_keys')
      .update({ total_calls: matched.total_calls + 1 })
      .eq('id', matched.id)
      .then(() => {});

    // Async: log usage event
    supabaseAdmin
      .from('usage_events')
      .insert({ api_key_id: matched.id, tenant_id: matched.tenant_id, endpoint: req.headers.get('x-endpoint') ?? '/' })
      .then(() => {});

    return NextResponse.json({
      valid: true,
      keyId: matched.id,
      tenantId: matched.tenant_id,
      rateLimit: matched.rate_limit_per_minute,
      remaining,
      plan,
    });
  } catch (e) {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
