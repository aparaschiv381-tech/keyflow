'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PLANS = [
  { id: 'free', name: 'Free', price: 0, calls: '10K', keys: 1, rate: '30/min' },
  { id: 'starter', name: 'Starter', price: 19, calls: '500K', keys: 10, rate: '120/min' },
  { id: 'pro', name: 'Pro', price: 79, calls: '5M', keys: 100, rate: '600/min' },
]

function BillingContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const [loading, setLoading] = useState<string | null>(null)

  async function upgrade(planId: string) {
    if (planId === 'free') return
    setLoading(planId)
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  async function openPortal() {
    setLoading('portal')
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Billing &amp; Plans</h1>

      {success && (
        <div className="bg-green-900/30 border border-green-600 rounded-xl p-4 text-green-300">
          ✅ Upgrade successful! Your plan has been updated.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => (
          <div key={plan.id}
            className={`rounded-xl p-6 border flex flex-col ${
              plan.id === 'starter' ? 'border-blue-500 bg-blue-950/30' : 'border-gray-800 bg-gray-900'
            }`}>
            {plan.id === 'starter' && (
              <span className="text-xs font-bold text-blue-400 uppercase mb-2">Most Popular</span>
            )}
            <h3 className="text-white font-bold text-xl">{plan.name}</h3>
            <p className="text-3xl font-black text-white mt-2">
              {plan.price === 0 ? 'Free' : `$${plan.price}`}
              {plan.price > 0 && <span className="text-sm font-normal text-gray-400">/mo</span>}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-300 flex-1">
              <li>✓ {plan.calls} API calls/month</li>
              <li>✓ {plan.keys} API key{plan.keys > 1 ? 's' : ''}</li>
              <li>✓ Rate limit: {plan.rate}</li>
              <li>✓ Analytics dashboard</li>
              {plan.id !== 'free' && <li>✓ Priority support</li>}
            </ul>
            <button
              onClick={() => plan.id !== 'free' ? upgrade(plan.id) : null}
              disabled={plan.id === 'free' || loading === plan.id}
              className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition ${
                plan.id === 'free'
                  ? 'bg-gray-700 text-gray-400 cursor-default'
                  : plan.id === 'starter'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              } disabled:opacity-50`}>
              {loading === plan.id ? 'Redirecting...' : plan.id === 'free' ? 'Current Base' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="text-white font-semibold mb-2">Manage Subscription</h2>
        <p className="text-gray-400 text-sm mb-4">Update payment method, view invoices, or cancel your subscription.</p>
        <button onClick={openPortal} disabled={loading === 'portal'}
          className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg text-sm transition disabled:opacity-50">
          {loading === 'portal' ? 'Opening...' : 'Open Billing Portal'}
        </button>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return <Suspense><BillingContent /></Suspense>
}
