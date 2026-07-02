'use client';
import Link from 'next/link';
import { ArrowRight, Key, Zap, BarChart3, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">KeyFlow</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
          <Link href="/signup" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-6">
          <Zap className="h-3.5 w-3.5" /> Live in 5 minutes
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          API Key Management,<br /><span className="text-primary">done right.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Stop rebuilding auth, rate limiting, and usage metering from scratch.
          KeyFlow gives you a drop-in API to issue keys, enforce limits, and track usage—so you can ship faster.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg text-sm hover:bg-accent transition-colors">
            View pricing
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Key, title: 'Instant Key Issuance', desc: 'Generate secure bcrypt-hashed API keys for your users in one POST request.' },
            { icon: Zap, title: 'Per-minute Rate Limiting', desc: 'Sliding-window rate limits, configurable per key. Block abusers automatically.' },
            { icon: BarChart3, title: 'Usage Analytics', desc: 'See call volume by day, per key, per endpoint. Know exactly who is using what.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-border bg-card">
              <Icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code snippet */}
      <section className="px-6 py-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Two lines to integrate</h2>
        <div className="rounded-xl border border-border bg-zinc-950 p-6 font-mono text-sm">
          <p className="text-zinc-400 mb-1">// In your existing backend route:</p>
          <p className="text-green-400">const res = await fetch('https://keyflow.app/api/verify', &#123;</p>
          <p className="text-zinc-300 ml-4">method: 'POST',</p>
          <p className="text-zinc-300 ml-4">body: JSON.stringify(&#123; key: req.headers['x-api-key'] &#125;)</p>
          <p className="text-green-400">&#125;);</p>
          <p className="text-zinc-300 mt-2">if (!res.valid) return <span className="text-red-400">401</span>;</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, predictable pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { plan: 'Free', price: '$0', calls: '10,000 calls/mo', keys: '1 key', cta: 'Get started', href: '/signup', highlight: false },
            { plan: 'Starter', price: '$19/mo', calls: '500,000 calls/mo', keys: '10 keys + analytics', cta: 'Upgrade to Starter', href: '/signup', highlight: true },
            { plan: 'Pro', price: '$79/mo', calls: '5M calls/mo', keys: 'Unlimited keys + webhooks', cta: 'Upgrade to Pro', href: '/signup', highlight: false },
          ].map(({ plan, price, calls, keys, cta, href, highlight }) => (
            <div key={plan} className={`p-6 rounded-xl border ${ highlight ? 'border-primary bg-primary/5' : 'border-border bg-card' }`}>
              {highlight && <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">Most Popular</div>}
              <div className="text-2xl font-bold mb-1">{price}</div>
              <div className="text-lg font-medium mb-4">{plan}</div>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li>✓ {calls}</li>
                <li>✓ {keys}</li>
                <li>✓ Dashboard access</li>
              </ul>
              <Link href={href} className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${ highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-accent' }`}>{cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} KeyFlow. Built with Next.js + Supabase.
      </footer>
    </div>
  );
}
