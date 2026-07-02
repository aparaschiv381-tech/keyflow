import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenant } = await supabaseAdmin
    .from('tenants').select('id, plan, calls_this_month').eq('user_id', user.id).single();
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Last 30 days of events aggregated by day
  const { data: events } = await supabaseAdmin
    .from('usage_events')
    .select('created_at')
    .eq('tenant_id', tenant.id)
    .gte('created_at', new Date(Date.now() - 30 * 86400 * 1000).toISOString())
    .order('created_at', { ascending: true });

  // Aggregate by date
  const byDay: Record<string, number> = {};
  (events ?? []).forEach(e => {
    const d = e.created_at.slice(0, 10);
    byDay[d] = (byDay[d] ?? 0) + 1;
  });

  const chart = Object.entries(byDay).map(([date, calls]) => ({ date, calls }));

  return NextResponse.json({ tenant, chart });
}
