# 🔑 KeyFlow

> API Key Management, Rate Limiting & Usage Metering as a Service

Add API key auth, per-minute rate limiting, and usage analytics to **any backend in 5 minutes**.

## Tech Stack
- **Frontend/Backend:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL + RLS)
- **Payments:** Stripe Billing
- **Deployment:** Vercel

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your keys, then:
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_STARTER_PRICE_ID` | Stripe Price ID for $19/mo plan |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for $79/mo plan |
| `NEXT_PUBLIC_APP_URL` | Your deployed Vercel URL |

## API: Verify a Key

```bash
curl -X POST https://your-app.vercel.app/api/verify \
  -H 'Content-Type: application/json' \
  -d '{"key": "kf_live_...", "endpoint": "/your-route"}'
```

Response:
```json
{ "valid": true, "keyName": "Production", "rateLimit": 60, "remaining": 59 }
```

## Plans

| Plan | Price | Calls/month | Keys | Rate Limit |
|---|---|---|---|---|
| Free | $0 | 10,000 | 1 | 30/min |
| Starter | $19 | 500,000 | 10 | 120/min |
| Pro | $79 | 5,000,000 | 100 | 600/min |

## Deploy

```bash
npx vercel --prod
```
