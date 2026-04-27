# Bull & Bear — Production Plan

## 1. Resend Setup (SMTP in Supabase)

### Steps
1. Sign up at [resend.com](https://resend.com)
2. **Add your domain** → Resend gives you 3 DNS records (SPF, DKIM, DMARC) → add them at your domain registrar
3. Wait for DNS verification (usually < 5 minutes)
4. Go to **Supabase Dashboard → Project Settings → Auth → SMTP Settings**
5. Enable "Custom SMTP" and enter:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** your Resend API key (`re_...`)
   - **Sender name:** `Bull & Bear`
   - **Sender email:** `noreply@yourdomain.com`

All auth emails (confirmation, password reset) now go through your domain automatically.

### Future (optional, requires code changes)
- Install `resend` SDK + `@react-email/components`
- Add custom transactional emails: welcome, payment failed, trial ending
- Triggered from `sync-user.ts` and `webhook/route.ts`

---

## 2. Deployment Checklist (Vercel)

### Pre-deploy
- [ ] Buy a domain
- [ ] Set up Cloudflare (free) — point domain nameservers to Cloudflare
- [ ] Set up Resend + custom SMTP in Supabase
- [ ] Complete Stripe account activation (business verification)

### Deploy steps
1. Connect GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Add **all env vars** to Vercel project settings (see below)
4. Deploy
5. Add custom domain in Vercel
6. Create Stripe webhook: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
7. Add `STRIPE_WEBHOOK_SECRET` to Vercel env vars
8. Redeploy

### Production env vars

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Twelve Data (chart data)
TWELVE_DATA_API_KEY=...

# Resend (only if using SDK directly later)
RESEND_API_KEY=re_...

# Upstash (optional — in-memory fallback works without these)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Post-deploy testing
- [ ] Test signup flow (confirmation email via Resend)
- [ ] Test login + dashboard loads
- [ ] Test Stripe checkout with real card
- [ ] Test webhook fires correctly (check Stripe dashboard for delivery status)
- [ ] Test account deletion (GDPR)
- [ ] Test data export (GDPR)
- [ ] Test TradingView chart loads on trade detail page

---

## 3. Env Vars Still Needed

| Var | Where to get it | Status |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → after creating endpoint | After deploy |
| `NEXT_PUBLIC_APP_URL` | Your domain | After buying domain |
| `RESEND_API_KEY` | Resend dashboard | After signup |

---

## 4. Legal Pages — Placeholders to Fill In

### Privacy Policy (`/legal/privacy-policy`)
- `[VOTRE NOM / SOCIÉTÉ]` → your legal name or company
- `[ADRESSE]` → registered address
- `[SIREN / RCS]` → company registration number (or remove if individual)
- `privacy@yourdomain.com` × 3 → your actual email

### Terms of Service (`/legal/terms`)
- `[VOTRE DOMAINE]` → e.g. `bullandbear.app`
- `[VOTRE NOM / SOCIÉTÉ]` → same as above
- `[VILLE]` → jurisdiction city (e.g. Paris)
- `legal@yourdomain.com` → your legal contact email

---

## 5. Cloudflare Setup (Free — Recommended)

### What You Already Have
- Rate limiting in `withAuth` (Upstash or in-memory fallback)
- CSRF checks on mutating API routes
- Supabase Auth brute-force protection
- Stripe webhook signature verification

### What Cloudflare Adds (Free Tier)
- **DDoS protection** — blocks volumetric attacks before they hit Vercel
- **Basic bot management** — filters known bad bots and scrapers
- **Fast DNS** — hides origin server IP
- **Edge caching** — static assets served from CDN, reduces Vercel bandwidth usage
- **Basic WAF rules** — blocks common SQLi, XSS attack patterns

### Setup Steps
1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Cloudflare scans your existing DNS records automatically
4. **Change your domain's nameservers** to Cloudflare's (at your registrar)
5. In Cloudflare dashboard:
   - **SSL/TLS** → set to **Full (Strict)**
   - Add a **CNAME** record pointing to `cname.vercel-dns.com` (Vercel tells you the exact record when you add a custom domain)
   - Add your **Resend DNS records** (SPF, DKIM, DMARC) here — not at the registrar, since Cloudflare now controls your DNS
6. In Vercel, add your custom domain as usual — works fine behind Cloudflare

### Cloudflare Turnstile (CAPTCHA) — Not Needed at Launch
Your rate limiter + Supabase Auth rate limits are enough. If you later see bot signups or abuse, add **Cloudflare Turnstile** (free, invisible CAPTCHA) to signup/login forms. This requires a small code change (widget + server-side token verification).

### Services You Don't Need
| Service | Verdict |
|---|---|
| Cloudflare Pro/Business | Overkill — free tier is plenty |
| AWS WAF / Shield | You're not on AWS |
| Vercel Firewall | Enterprise plan only |
| reCAPTCHA | Turnstile is better (privacy-friendly, no Google tracking) |
| Arcjet | Adds complexity — not needed at your scale |
