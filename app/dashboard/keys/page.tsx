'use client'
import { useEffect, useState } from 'react'

interface ApiKey {
  id: string
  key_prefix: string
  name: string
  is_active: boolean
  total_calls: number
  rate_limit_per_minute: number
  created_at: string
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadKeys() {
    const res = await fetch('/api/keys')
    const data = await res.json()
    setKeys(data.keys ?? [])
  }

  useEffect(() => { loadKeys() }, [])

  async function createKey() {
    if (!newKeyName.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setRevealedKey(data.key)
    setNewKeyName('')
    await loadKeys()
    setLoading(false)
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this key? This cannot be undone.')) return
    await fetch(`/api/keys?id=${id}`, { method: 'DELETE' })
    await loadKeys()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">API Keys</h1>

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-3">
        <h2 className="text-white font-semibold">Create New Key</h2>
        <div className="flex gap-3">
          <input
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button onClick={createKey} disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:opacity-50">
            {loading ? '...' : 'Create'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {revealedKey && (
        <div className="bg-green-900/30 border border-green-600 rounded-xl p-5">
          <p className="text-green-400 font-semibold mb-2">✅ Key created — copy it now, it won&apos;t be shown again:</p>
          <code className="block bg-gray-900 p-3 rounded-lg text-green-300 text-sm break-all">{revealedKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(revealedKey); alert('Copied!') }}
            className="mt-3 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg">
            Copy to Clipboard
          </button>
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Prefix</th>
              <th className="text-left p-4">Total Calls</th>
              <th className="text-left p-4">Rate Limit</th>
              <th className="text-left p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id} className="border-b border-gray-800 last:border-0">
                <td className="p-4 text-white font-medium">{k.name}</td>
                <td className="p-4 font-mono text-gray-400">{k.key_prefix}</td>
                <td className="p-4 text-gray-300">{k.total_calls.toLocaleString()}</td>
                <td className="p-4 text-gray-300">{k.rate_limit_per_minute}/min</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    k.is_active ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {k.is_active ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td className="p-4">
                  {k.is_active && (
                    <button onClick={() => revokeKey(k.id)}
                      className="text-red-400 hover:text-red-300 text-xs underline">Revoke</button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No keys yet. Create your first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
