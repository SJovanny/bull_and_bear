# Bull & Bear — Infrastructure Costs Summary

> Last updated: April 2026

---

## At Launch (~1€/month)

| Service | Plan | Cost | What You Get | Limits |
|---|---|---|---|---|
| **Domain** | — | ~10-15€/year | Custom domain (.com, .fr, .app) | — |
| **Vercel** | Hobby | **Free** | Hosting, serverless, HTTPS, custom domain | 100GB bandwidth, 10s function timeout |
| **Supabase** | Free | **Free** | PostgreSQL DB, Auth, Storage | 500MB DB, 1GB storage, 50K MAU, 4 emails/hr |
| **Stripe** | Standard | **Free** | Payment processing | 1.4% + 0.25€ per EU card transaction |
| **Resend** | Free | **Free** | Transactional emails via custom domain | 3,000 emails/month, 100/day |
| **Upstash Redis** | Free | **Free** | API rate limiting (optional) | 10K commands/day |
| **Twelve Data** | Free | **Free** | TradingView chart market data | 8 req/min, 800 req/day |

### Total: ~10-15€/year (domain only)

---

## At Scale (~500+ active users, estimated)

| Service | Plan | Cost | Upgrade Trigger |
|---|---|---|---|
| **Domain** | — | ~1€/month | — |
| **Vercel** | Pro | $20/month | Commercial use, team, or bandwidth limits |
| **Supabase** | Pro | $25/month | DB > 500MB, need daily backups, or email rate limits |
| **Stripe** | Standard | ~6% per tx | Only when you earn money |
| **Resend** | Pro | $20/month | 100+ signups/day or need > 3K emails/month |
| **Upstash Redis** | Pay-as-you-go | $10/month | > 10K rate-limit checks/day |
| **Twelve Data** | Basic | $29/month | 20+ daily active users viewing charts |

### Total: ~105€/month + Stripe fees

---

## Stripe Revenue Math

With a 5€/month subscription:

| Metric | Value |
|---|---|
| Price per user | 5€/month or 50€/year |
| Stripe fee (EU card) | 1.4% + 0.25€ = ~0.32€ per monthly charge |
| You keep (monthly) | ~4.68€/user/month |
| You keep (yearly) | ~49.05€/user/year |
| Break-even (monthly costs ~105€) | ~23 paying monthly users |

---

## Free Tier Limits — When You'll Hit Them

| Service | Free Limit | Approx. Users Before Hitting It |
|---|---|---|
| Supabase DB (500MB) | ~500MB of trades/journals | ~200-500 active traders |
| Supabase Auth emails (4/hr) | 4 signups per hour | Any launch day with traction |
| Resend (100/day) | 100 emails per day | 100 signups in a single day |
| Twelve Data (800/day) | 800 chart loads per day | ~50-100 active users/day |
| Upstash (10K/day) | 10K API requests per day | ~100-200 active users/day |
| Vercel (100GB/month) | 100GB bandwidth | ~1000+ active users/month |

---

## Recommended Upgrade Order

1. **Resend as Supabase SMTP** → Do now (free, fixes 4 email/hr limit)
2. **Supabase Pro** → First paid upgrade, when DB approaches 500MB
3. **Twelve Data Basic** → When chart loads start failing (8/min limit)
4. **Vercel Pro** → When going commercial or need team access
5. **Resend Pro** → Only if sending marketing/digest emails at volume
6. **Upstash paid** → Last priority, in-memory fallback works fine

---

## Quick Reference — All Services

| Service | Dashboard URL |
|---|---|
| Vercel | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Supabase | [supabase.com/dashboard](https://supabase.com/dashboard) |
| Stripe | [dashboard.stripe.com](https://dashboard.stripe.com) |
| Resend | [resend.com/overview](https://resend.com/overview) |
| Upstash | [console.upstash.com](https://console.upstash.com) |
| Twelve Data | [twelvedata.com/account](https://twelvedata.com/account) |
