# Urbane Haauz · External Google/Web Audit

**Date:** 2026-04-07
**Method:** DNS queries, HTTP probes, search-engine checks — no credentials used
**Auditor:** Claude Code SEO Agent (Option B — external audit)

---

## Executive Summary

**urbanehaauz.com does not have Google Workspace** — email is on GoDaddy ("SecureServer"). The site is **completely unindexed by Google** (0 pages). There is **no Google Business Profile**, so the hotel is invisible on Google Maps. Booking confirmation emails ship from Resend's shared dev sender (`onboarding@resend.dev`), likely landing in spam.

---

## 🔴 Critical Findings

### 1. No Google Workspace — Email is on GoDaddy

```
MX records:
  0  smtp.secureserver.net          ← GoDaddy "Workspace Email"
  10 mailstore1.secureserver.net    ← GoDaddy
```

- This is **GoDaddy's "Workspace Email"**, NOT Google Workspace
- `urbanehaauz@gmail.com` is a personal consumer Gmail
- No `@urbanehaauz.com` Google mailboxes exist
- Cannot use Google admin SDK, GAM, gcloud, or any Google Workspace tooling

**Action:**
- [ ] Decide: stay on GoDaddy email or migrate to Google Workspace (~₹500/month for 3 founder mailboxes: `ayan@`, `shovit@`, `souvik@`, `bookings@`)
- [ ] If migrating, the MX swap is 5 minutes; the bigger work is recreating mailboxes

### 2. Site is NOT Indexed by Google — Zero Pages

```
site:urbanehaauz.com → 0 results
```

Google has **zero pages** of urbanehaauz.com in its index. Combined with the HashRouter SPA issue, Google has never been able to discover or index any content.

**Action:**
- [ ] **IMMEDIATE:** Submit `https://urbanehaauz.com/sitemap.xml` to Google Search Console (5 min, highest-leverage unblocker)
- [ ] **This week:** Ship the prerender plan (`docs/Marketing-Claude/PRERENDER_PLAN.md`) so Google can index pages beyond `/`

### 3. Booking Emails Ship from `onboarding@resend.dev`

```
FROM_EMAIL = 'Urbane Haauz <onboarding@resend.dev>'
```
*(lib/email/emailService.ts:14)*

Problems:
1. **Spam folder risk** — Gmail/Outlook actively distrust Resend's shared dev domain
2. **Looks unprofessional** — guests see "from resend.dev" in their inbox
3. **No DMARC alignment** — DMARC record expects mail "from" `urbanehaauz.com`

**Action:**
- [ ] In Resend dashboard → add `urbanehaauz.com` as a verified domain
- [ ] Add the 3 DNS records Resend provides to GoDaddy DNS
- [ ] Change `FROM_EMAIL` in code to `'Urbane Haauz <bookings@urbanehaauz.com>'`
- [ ] Test: book yourself, confirm email lands in inbox not spam

### 4. DMARC Reports Go to GoDaddy, Not to Founders

```
v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net
```

`p=quarantine` is good (actively rejects spoofed mail). But `rua=` sends reports to GoDaddy's address — founders have **zero visibility** into email authentication failures.

**Action:**
- [ ] Update DMARC TXT record in GoDaddy DNS to:
  ```
  v=DMARC1; p=quarantine; adkim=s; aspf=s; pct=100; rua=mailto:dmarc@urbanehaauz.com; ruf=mailto:dmarc@urbanehaauz.com; sp=quarantine; fo=1
  ```
- [ ] Changes: strict alignment (`s`), explicit 100%, reports to your own mailbox, subdomain policy, forensic reports enabled
- [ ] Create a `dmarc@urbanehaauz.com` address (or catch-all you actually read)

### 5. No Google Business Profile

Searched Google Maps for "Urbane Haauz Pelling Sikkim" — **no result.** Other Pelling hotels (Sikkim Tourist Centre, Hotel Ladakh House, Hotel Sikkim Aurora) all appear; Urbane Haauz does not.

**Action:**
- [ ] Follow `docs/Marketing-Claude/geo-postings/04-google-business-profile.md` (full step-by-step with every form field pre-filled)
- [ ] Video verification takes 2–5 days
- [ ] Without GBP, cannot appear in: Google Maps, local pack, Google AI Overviews, Gemini answers, Bing Places

---

## 🟡 Medium Findings

### 6. No CAA Record

```
dig CAA urbanehaauz.com → (empty)
```

Any certificate authority on earth can issue a TLS certificate for the domain.

**Action:**
- [ ] Add to GoDaddy DNS:
  ```
  urbanehaauz.com.  CAA  0 issue "letsencrypt.org"
  urbanehaauz.com.  CAA  0 issue "pki.goog"
  urbanehaauz.com.  CAA  0 iodef "mailto:security@urbanehaauz.com"
  ```

### 7. No IPv6 (AAAA Record)

```
dig AAAA urbanehaauz.com → (empty)
```

~35% of Indian mobile users are on IPv6-only networks (Reliance Jio). Those users **cannot reach urbanehaauz.com directly** — they go through carrier NAT64, adding latency.

**Action:**
- [ ] In Vercel project settings → Domains → re-link urbanehaauz.com via Vercel's recommended DNS setup (CNAME/ALIAS or A+AAAA records), not manual A records to fixed IPs
- [ ] Vercel's setup wizard will provide the exact records for GoDaddy

### 8. No Content-Security-Policy Header

Strong security headers present (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) but no CSP. Any XSS in a third-party script runs unrestricted.

**Action:**
- [ ] Add CSP to `vercel.json` (starting point — needs testing with booking flow):
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.razorpay.com https://api.resend.com; frame-src https://*.razorpay.com; object-src 'none'; base-uri 'self'; form-action 'self' https://*.razorpay.com
  ```

---

## 🟢 What's Good (Already Working)

| Check | Status | Details |
|---|---|---|
| HSTS | ✅ | `max-age=63072000; includeSubDomains; preload` — preload-eligible |
| HTTPS forced | ✅ | HTTP→HTTPS redirect, valid TLS cert |
| Apex→www redirect | ✅ | `urbanehaauz.com → www.urbanehaauz.com` (307) |
| Security headers | ✅ | X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin, Permissions-Policy locked |
| robots.txt | ✅ | Allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, Applebot-Extended |
| sitemap.xml | ✅ | 6 canonical URLs with lastmod |
| SPF record | ✅ | `v=spf1 include:secureserver.net -all` (hard fail — strict) |
| DMARC record | ✅ | `p=quarantine` actively in force |
| CDN | ✅ | Vercel anycast IPs |
| JSON-LD | ✅ | Hotel + LodgingBusiness + BreadcrumbList — corrected data |
| AI crawler access | ✅ | All major AI bots explicitly allowed in robots.txt |

---

## DNS Records Snapshot (2026-04-07)

```
NS:     ns47.domaincontrol.com, ns48.domaincontrol.com (GoDaddy)
A:      216.198.79.1, 216.198.79.65, 64.29.17.65 (Vercel anycast)
AAAA:   (none — missing)
MX:     0 smtp.secureserver.net, 10 mailstore1.secureserver.net (GoDaddy)
TXT:    v=spf1 include:secureserver.net -all
DMARC:  v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net
DKIM:   (none — no selector found for google, default, selector1, selector2, mail, dkim)
CAA:    (none)
```

---

## Priority Fix List (Impact Order)

| # | Fix | Owner | Time | Blocks |
|---|---|---|---|---|
| 1 | Submit sitemap to Google Search Console | Tech | 5 min | Google ever indexing you |
| 2 | Claim Google Business Profile | Tech | 30 min + 2-5 day verify | Maps, local pack, AI Overviews |
| 3 | Verify urbanehaauz.com in Resend + fix FROM_EMAIL | Tech | 15 min DNS + 1 line code | Booking email deliverability |
| 4 | Decide: Google Workspace or stay GoDaddy | All founders | Strategic | Professional email presence |
| 5 | Update DMARC record | Tech | 5 min DNS | Visibility into email failures |
| 6 | Add CAA records | Tech | 5 min DNS | TLS cert security |
| 7 | Fix IPv6 / re-link domain in Vercel | Tech | 15 min | 35% of Jio mobile users |
| 8 | Add Content-Security-Policy | Tech | 15 min code + test | XSS defense |
| 9 | Ship prerender | Tech | 2-hour session | Google indexing all pages |

Items 1, 2, 3 are the **highest-leverage fixes for the 86-day peak window.** All can be done by a founder with a browser in under 90 minutes total.

---

## Raw Data Sources

- DNS: live `dig` queries from session (ns47.domaincontrol.com authoritative)
- HTTP/headers: live `curl` against `https://www.urbanehaauz.com/`
- Email service code: `lib/email/emailService.ts` lines 1–55
- Google indexing: direct `site:urbanehaauz.com` query (0 results)
- Google Maps presence: Google search for "Urbane Haauz Pelling Sikkim" — not found; comparable Pelling hotels (Sikkim Tourist Centre, Hotel Ladakh House, Hotel Sikkim Aurora) all indexed
- Sikkim Tourism references: sikkimexpress.com, travelandtourworld.com, traveltradejournal.com
