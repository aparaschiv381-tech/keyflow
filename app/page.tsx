import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-900">
        <span className="font-black text-xl">🔑 KeyFlow</span>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-400 hover:text-white text-sm transition">Sign In</Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition">
            Start Free
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 text-xs font-semibold rounded-full mb-6 border border-blue-800">
          API Infrastructure for Developers
        </span>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Add API Key Auth &amp;<br />
          <span className="text-blue-400">Rate Limiting</span> in 5 Minutes
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Stop rebuilding the same API key management system. KeyFlow gives you instant key issuance,
          usage metering, and rate limiting — so you can ship faster.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-blue-900/30">
            Start for Free →
          </Link>
          <a href="#how-it-works"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-lg rounded-xl transition">
            See How It Works
          </a>
        </div>

        <div className="mt-16 text-left bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-gray-400 text-xs mb-3 font-mono">Your backend — protect any route in 2 lines:</p>
          <pre className="text-sm text-green-300 font-mono overflow-x-auto"><code>{`// In your API route / Express handler
const { valid, error } = await fetch('https://your-keyflow-url.vercel.app/api/verify', {
  method: 'POST',
  body: JSON.stringify({ key: req.headers['x-api-key'] })
}).then(r => r.json())

if (!valid) return res.status(401).json({ error })
// ✅ Proceed — key is valid, usage logged automatically`}</code></pre>
        </div>

        <div id="how-it-works" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { icon: '⚡', title: 'Instant Integration', desc: 'One POST request to verify any key. Works with any stack — Node, Python, Go, Java.' },
            { icon: '📊', title: 'Usage Analytics', desc: 'See call volume, track per-key usage, and get alerts before limits are hit.' },
            { icon: '🚦', title: 'Rate Limiting Built-In', desc: 'Per-minute limits enforced automatically. Protect your backend from abuse.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-blue-900/20 border border-blue-800 rounded-2xl p-10">
          <h2 className="text-3xl font-black mb-3">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 mb-2">Free forever. Upgrade only when you scale.</p>
          <Link href="/signup" className="mt-4 inline-block px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
            Get Started Free →
          </Link>
        </div>
      </main>
    </div>
  )
}
