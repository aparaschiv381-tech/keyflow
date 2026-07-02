import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsageChart from '@/components/UsageChart'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createSupabaseServiceClient()

  const { data: tenant } = await service
    .from('tenants')
    .select('id, plan, calls_this_month')
    .eq('user_id', user.id)
    .single()

  const { data: usageData } = await service
    .from('usage_daily')
    .select('date, total_calls')
    .eq('tenant_id', tenant!.id)
    .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
    .order('date', { ascending: true })

  const { count: keyCount } = await service
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenant!.id)
    .eq('is_active', true)

  const planLimits: Record<string, number> = { free: 10000, starter: 500000, pro: 5000000 }
  const limit = planLimits[tenant!.plan] ?? 10000
  const pct = Math.min(100, Math.round(((tenant?.calls_this_month ?? 0) / limit) * 100))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900 text-blue-200 uppercase">
          {tenant?.plan} plan
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Calls This Month</p>
          <p className="text-3xl font-bold text-white mt-1">{(tenant?.calls_this_month ?? 0).toLocaleString()}</p>
          <div className="mt-3 h-2 bg-gray-700 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-gray-500 text-xs mt-1">{pct}% of {limit.toLocaleString()} limit</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Active API Keys</p>
          <p className="text-3xl font-bold text-white mt-1">{keyCount ?? 0}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Plan</p>
          <p className="text-3xl font-bold text-white mt-1 capitalize">{tenant?.plan}</p>
          {tenant?.plan === 'free' && (
            <Link href="/dashboard/billing" className="mt-2 inline-block text-blue-400 text-xs hover:underline">Upgrade →</Link>
          )}
        </div>
      </div>

      {pct >= 80 && (
        <div className="bg-orange-900/40 border border-orange-700 rounded-xl p-4 text-orange-300 text-sm">
          ⚠️ You&apos;ve used {pct}% of your monthly call limit.{' '}
          <Link href="/dashboard/billing" className="underline font-semibold">Upgrade now</Link> to avoid interruption.
        </div>
      )}

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="text-white font-semibold mb-4">API Calls — Last 30 Days</h2>
        <UsageChart data={usageData ?? []} />
      </div>
    </div>
  )
}
