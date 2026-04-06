# Urbane Haauz — SEO/GEO Sprint Summary

**Sprint Date**: 2026-04-06
**Window**: 86 days remaining in peak season (1 Apr – 30 Jun 2026)
**Operating Gap to Close**: ₹28,05,541 (₹32,623/day required)
**Mode**: Mode 1 — Full Sprint (8-agent orchestration)

---

## Core GEO Entity Statement

> Urbane Haauz is a boutique hotel in Upper Pelling, Sikkim with direct Kanchenjunga views, the only property in the area offering both hotel rooms and DORM beds, with CP/MAP meal plans and direct booking at urbanehaauz.com.

---

## Agents Run

| # | Agent | Output | Status |
|---|---|---|---|
| 1 | seo-auditor | `Marketing-Claude/SEO_REPORT.md` | ✅ |
| 2 | keyword-researcher | `Marketing-Claude/KEYWORD_BRIEF.md` | ✅ |
| 3 | geo-optimizer | `Marketing-Claude/GEO_BRIEF.md` | ✅ |
| 4 | local-seo | `Marketing-Claude/LOCAL_SEO_BRIEF.md` | ✅ |
| 5 | technical-seo | Source code (see Implemented Fixes) | ✅ |
| 6 | content-writer | `Marketing-Claude/content/` | ✅ |
| 7 | schema-architect | `Marketing-Claude/schema/` + `index.html` | ✅ |
| 8 | link-builder | `Marketing-Claude/LINK_BUILDING_BRIEF.md` | ✅ |

---

## Implemented Fixes (Already in Source Code — No Founder Action Needed to Ship)

These were applied directly to the codebase by `@technical-seo` and `@schema-architect`. Build is clean (`npm run build` passes).

1. **Revenue leak plugged** — `pages/Home.tsx`, `components/Footer.tsx`, `components/Navbar.tsx`: every "Book Now" CTA now routes to internal `/#/book` (Razorpay direct booking) instead of `urbanehaauz.runhotel.site`. Saves the 15–18% OTA commission on every booking captured during the peak window.
2. **`public/robots.txt`** — explicitly allows GPTBot, PerplexityBot, ClaudeBot, Google-Extended, anthropic-ai, ChatGPT-User, CCBot, Bytespider, Bingbot, Applebot-Extended. Disallows `/admin*`, `/auth/callback`. Sitemap referenced.
3. **`public/sitemap.xml`** — 5 canonical URLs with lastmod 2026-04-06.
4. **Tailwind production build** — Play CDN removed; `tailwindcss@3 + postcss + autoprefixer` installed; `tailwind.config.js`, `postcss.config.js` created; `index.css` rewritten with `@tailwind` directives. CSS bundle: 51 KB.
5. **Per-page meta tags** — `react-helmet-async` installed; `<HelmetProvider>` wraps App; `<Helmet>` blocks added to Home, Rooms, LocalExperiences, BookingFlow, Contact with unique title/description/canonical/OG. AdminDashboard + AdminLogin set to `noindex,nofollow`.
6. **`vercel.json` hardening** — HSTS, Referrer-Policy, Permissions-Policy added; immutable 1yr Cache-Control for static assets; `no-cache, must-revalidate` for HTML.
7. **Vite performance** — `manualChunks` in `vite.config.ts` splits admin (127 KB), supabase (166 KB), charts (307 KB), vendor (359 KB). `App.tsx` now lazy-loads AdminDashboard, AdminLogin, AuthCallback via `React.lazy + Suspense` — public visitors no longer download admin code.
8. **JSON-LD overhaul** — `index.html` now ships 3 valid schema blocks: `Hotel`, `LodgingBusiness`, `BreadcrumbList`. Placeholder phone/locality/priceRange replaced. Invented `starRating: 4` removed (unverified).
9. **HashRouter preserved** — Supabase OAuth callback contract intact. SPA prerendering deferred to a follow-up (see `PRERENDER_PLAN.md`).
10. **Self-hosted favicon** — placeholder `public/favicon.svg` shipped; Unsplash stock URL fully removed from `index.html`.

---

## Critical Actions Requiring Founder Input (Blocks Maximum Impact)

These are the things only Ayan/Shovit/Souvik can answer or supply. Each one unblocks compounding wins.

| # | Item | Owner | Why Blocking |
|---|---|---|---|
| 1 | OG image (1200×630 JPG) → `/public/og-image.jpg` | Ayan | All social shares currently break |
| 2 | Verify canonical phone `+91 91360 32524` (or correct it) | Shovit | Used in JSON-LD, GBP, every directory |
| 3 | Verified GPS coordinates for Upper Pelling property | Ayan | Local pack ranking, JSON-LD `geo` |
| 4 | Star rating (if any registered) | Souvik | Cannot publish in schema without verification |
| 5 | Real GSTIN (replace `11AAAAA0000A1Z5` placeholder in `Footer.tsx:15`) | Shovit | Compliance + trust |
| 6 | Claim Google Business Profile (video verification) | Ayan | Single biggest map-pack lever |
| 7 | Approve Bengali-language meta variants (need native review) | Souvik | Unlocks Kolkata audience |
| 8 | Confirm peak rate floor (₹1,800) against live PMS | Shovit | Blog posts cite this |
| 9 | Reconfirm train numbers/timings (Darjeeling Mail 12343, Kanchankanya 13149) | Ayan | "How to reach Pelling from Kolkata" blog post accuracy |
| 10 | Real property images for OG/schema/blog | Ayan | All three currently use placeholders |
| 11 | Submit `sitemap.xml` to Google Search Console + Bing Webmaster Tools after deploy | Ayan | Day-1 indexing |
| 12 | Create Wikidata Q-item + edit OpenStreetMap node | Ayan | Highest GEO trust signal per minute |
| 13 | Schedule prerender implementation per `PRERENDER_PLAN.md` (Option C: Playwright vs `vite preview`) | Ayan | Unlocks SPA indexability without breaking HashRouter |

---

## First-Week Execution Plan (Days 1–7)

This is the sequence with the highest projected impact on the 86-day operating gap.

### Day 1 (immediately after deploy)
- [ ] Founders verify items 1–5 above
- [ ] Submit sitemap to GSC + Bing Webmaster Tools
- [ ] Create Wikidata Q-item, edit OpenStreetMap node, add Wikivoyage Pelling listing (see `LINK_BUILDING_BRIEF.md`)
- [ ] Claim Google Business Profile, request video verification
- [ ] Push the corrected JSON-LD changes through Google's Rich Results Test

### Day 2–3
- [ ] Begin 30-directory citation sprint (MUST tier from `LOCAL_SEO_BRIEF.md`)
- [ ] Publish 4 priority blog posts after founder review (`Marketing-Claude/content/blog/`)
- [ ] Wire FAQ schema + 25 Q&As into a new `/faq` page (use `Marketing-Claude/schema/faq.json`)

### Day 4–5
- [ ] Begin OTA listing relaunch (MakeMyTrip, Booking.com, Agoda, Goibibo) with corrected NAP and Kanchenjunga hero image
- [ ] First 3 blogger host-stay outreach emails (templates in `LINK_BUILDING_BRIEF.md`)
- [ ] First Reddit founder-disclosed trip report (r/IndiaTravel)

### Day 6–7
- [ ] First weekly GBP post + 5 photo uploads
- [ ] Quora 5-answer blitz on Pelling/Sikkim queries
- [ ] Begin Kolkata travel-agent outreach (15% net commission, site-inspection offer)
- [ ] Pitch The Telegraph (Kolkata) "Bengali Summer Escape" angle

---

## Top Money Keywords (from KEYWORD_BRIEF.md)

| Keyword | KD | Vol/mo | Page |
|---|---|---|---|
| hotel in upper pelling with kanchenjunga view | LOW | ~100 | / |
| upper pelling hotels | LOW | ~300 | / |
| kanchenjunga view hotel pelling | LOW-MED | ~400 | /rooms |
| boutique hotel pelling sikkim | LOW-MED | ~200 | / |
| pelling hotel direct booking | V.LOW | — | /book |
| dorm bed pelling / hostel in pelling | V.LOW | — | /rooms#dorm |
| pelling hotel from kolkata | LOW | — | /book |

---

## Key Documents Index

All sprint outputs live in `docs/Marketing-Claude/`.

- `SEO_REPORT.md` — Full audit, 25 ranked actions, page inventory
- `KEYWORD_BRIEF.md` — Money keywords, 12-post content queue, page-level assignments
- `GEO_BRIEF.md` — AI engine seeding plan, 25 FAQs, llms.txt content, entity statement plan
- `LOCAL_SEO_BRIEF.md` — NAP, GBP checklist, 30 directories, OTA brief, geo landing pages
- `LINK_BUILDING_BRIEF.md` — 12-week link calendar, 25 bloggers, 5 linkable assets, outreach templates
- `PRERENDER_PLAN.md` — Three options for SPA indexability without breaking HashRouter
- `content/blog/` — 4 publish-ready blog posts (founder review pending)
- `content/meta-tags.md` — Final per-page meta tags
- `schema/` — Hotel, rooms, FAQ, breadcrumb, organization JSON-LD + injection plan

---

## What's NOT Done (Honest Limits)

- **SPA prerendering** — deferred. The site is still HashRouter-only at runtime, so Google still sees a single page until prerender lands. This is the biggest remaining ceiling on organic visibility. Plan documented in `PRERENDER_PLAN.md`.
- **Founder-blocked items** — 13 items above cannot be shipped without human input/verification.
- **Bengali-language meta variants** — drafted but flagged for native-speaker review before publishing.
- **No live external account changes** — no GBP, Wikidata, OSM, OTA edits made by an agent. All require human action.

---

## Bottom Line

Code-side, the highest-leverage SEO/GEO/conversion fixes are **shipped and building cleanly**. The CTA leak that was actively bleeding 15–18% on every booking is closed. The site is now AI-crawler-friendly. Schema is corrected. Per-page meta is wired. Admin code is split out of the public bundle.

The sprint surfaced **exactly 13 founder-blocked items** that, once cleared, will unlock the rest of the compounding plays in the 86-day window. The blog content + outreach calendar is ready to execute the moment founders sign off.
