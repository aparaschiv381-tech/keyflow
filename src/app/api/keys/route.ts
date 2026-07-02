import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateApiKey } from '@/lib/key-utils';
import { PLANS } from '@/lib/stripe';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenant } = await supabaseAdmin
    .from('tenants').select('id').eq('user_id', user.id).single();
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const { data: keys } = await supabaseAdmin
    .from('api_keys')
    .select('id, key_prefix, name, rate_limit_per_minute, monthly_limit, is_active, total_calls, expires_at, created_at')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ keys: keys ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenant } = await supabaseAdmin
    .from('tenants').select('id, plan').eq('user_id', user.id).single();
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  // Enforce plan key limits
  const { count } = await supabaseAdmin
    .from('api_keys').select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id).eq('is_active', true);
  const plan = tenant.plan as keyof typeof PLANS;
  if ((count ?? 0) >= PLANS[plan].keysLimit) {
    return NextResponse.json({ error: `Upgrade to create more keys (limit: ${PLANS[plan].keysLimit})` }, { status: 403 });
  }

  const body = await req.json();
  const { raw, prefix, hash } = generateApiKey();

  await supabaseAdmin.from('api_keys').insert({
    tenant_id: tenant.id,
    key_hash: hash,
    key_prefix: prefix,
    name: body.name ?? 'My Key',
    rate_limit_per_minute: body.rateLimitPerMinute ?? 60,
    expires_at: body.expiresAt ?? null,
  });

  // Return raw key ONCE — never stored
  return NextResponse.json({ key: raw, prefix });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { keyId } = await req.json();
  const { data: tenant } = await supabaseAdmin
    .from('tenants').select('id').eq('user_id', user.id).single();

  await supabaseAdmin.from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('tenant_id', tenant!.id);

  return NextResponse.json({ success: true });
}
