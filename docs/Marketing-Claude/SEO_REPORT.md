# Urbane Haauz — SEO Audit Report

**Date**: 2026-04-06
**Auditor**: Claude Code SEO Auditor Agent
**Repo**: `/Users/ayanputatunda/UrbaneHaauz`
**Stack**: React 19 + TypeScript + Vite + Tailwind (CDN) + HashRouter SPA on Vercel
**Peak window**: 1 Apr – 30 Jun 2026 (86 days remaining)
**Operating gap**: ₹28,05,541 (₹32,623/day required)

---

## 1. Executive Summary

**Overall SEO Score: 22 / 100 — CRITICAL.**

The site is effectively invisible to search engines. The single biggest, business-killing issue is that the entire site is a **HashRouter SPA with no SSR/prerender**, meaning every URL Google sees is `/#/...` — and **Google does not index hash fragments as separate pages**. Combined with a missing `robots.txt`, missing `sitemap.xml`, a single hard-coded `<title>` and meta description in `index.html` that applies to every route, and an Unsplash stock image as the favicon AND the OG image, the site has near-zero discoverability for high-intent peak-season queries like "Pelling hotel with Kanchenjunga view", "Upper Pelling boutique hotel", "Pelling hostel dorm", or "Pelling hotel direct booking".

The hotel's biggest organic-revenue lever — booking direct via Razorpay to bypass 15–18% OTA commissions — is currently impossible to execute because (a) the homepage "Check Availability" CTA points to `urbanehaauz.runhotel.site` (third-party domain) instead of `/book`, leaking link equity and conversions, and (b) the in-app `/book` route can't be indexed at all.

**Top 3 fires to put out THIS WEEK** (in order):

1. **Fix indexability**: Either prerender routes with `vite-plugin-prerender` / `vike` / migrate to BrowserRouter + Vercel rewrites, OR (faster, 1-day fix) inject per-route static HTML stubs at build time. Without this, nothing else matters.
2. **Per-route meta tags**: Install `react-helmet-async` and add unique `<title>`, description, canonical, OG, and JSON-LD per page (Home, Rooms, Experiences, Contact, Book).
3. **Create `public/robots.txt` + `public/sitemap.xml`** and submit to Google Search Console + Bing Webmaster Tools.

A skilled agent can ship items 1–3 plus the Quick Wins below in 6–10 hours and unlock organic traffic within 7–14 days — directly inside the 86-day peak window.

---

## 2. Critical Actions (Severity-Ranked)

| # | Severity | Issue | File(s) | Effort |
|---|----------|-------|---------|--------|
| 1 | P0 BLOCKER | HashRouter — no route is independently indexable | `App.tsx:51`, `index.html` | 4-8h |
| 2 | P0 BLOCKER | No `robots.txt` in `public/` | `public/` (missing) | 5min |
| 3 | P0 BLOCKER | No `sitemap.xml` in `public/` | `public/` (missing) | 15min |
| 4 | P0 | Single global `<title>`/meta description applies to ALL pages | `index.html:7,10` | 2h (with helmet) |
| 5 | P0 | Hero/OG/favicon all use Unsplash stock URL — not the hotel | `index.html:5,21,30,66` | 30min |
| 6 | P0 | Hard-coded "Starting ₹500/night" in meta is wrong (DORM ₹400, rooms ₹1,200+) | `index.html:10` | 2min |
| 7 | P0 | Hotel JSON-LD has placeholder phone `+91-98765-43210`; real # is `+91 9136032524` | `index.html:41` | 2min |
| 8 | P0 | Homepage primary CTA leaks to `runhotel.site` instead of `/book` | `pages/Home.tsx:36`, `components/Footer.tsx:37-38` | 5min |
| 9 | P1 | Tailwind loaded from CDN script (`cdn.tailwindcss.com`) — render-blocking, dev-only tool, not for production | `index.html:69` | 1h |
| 10 | P1 | No `LodgingBusiness` / `BreadcrumbList` / `FAQPage` / `Review` schema; only one barebones `Hotel` schema | `index.html:33` | 2h (schema-architect) |
| 11 | P1 | No hreflang despite Bengali/Hindi/English audience and existing `LanguageProvider` | `index.html`, `App.tsx` | 1h |
| 12 | P1 | Address in JSON-LD says `addressLocality: "West Sikkim"` (region, not city) — should be `Pelling` | `index.html:45` | 1min |
| 13 | P1 | `geo` coordinates are generic Pelling (27.30, 88.23), not the actual property | `index.html:51-52` | 5min |
| 14 | P1 | `priceRange: "₹500 - ₹8000"` does not match actual rates | `index.html:55` | 2min |
| 15 | P1 | Rooms tab hidden in nav — no internal link to `/rooms` from anywhere indexable | `components/Navbar.tsx:58` | 5min |
| 16 | P1 | `<h1>` on homepage is the brand name "Urbane Haauz" — wastes the page's most powerful ranking signal | `pages/Home.tsx:28` | 2min |
| 17 | P2 | No `width`/`height` on any `<img>` (CLS risk) | `pages/Home.tsx:15`, `pages/Rooms.tsx:62`, `pages/BookingFlow.tsx:385,507` | 30min |
| 18 | P2 | No WebP / `loading="lazy"` / `decoding="async"` on images | all `<img>` | 30min |
| 19 | P2 | `vite.config.ts` has zero SEO/perf tuning (no `build.rollupOptions.output.manualChunks`, no compression plugin) | `vite.config.ts` | 1h |
| 20 | P2 | `index.css` linked AFTER tailwind CDN; Google Fonts loaded synchronously without `preconnect` | `index.html:70,128` | 10min |
| 21 | P2 | No favicon set, apple-touch-icon, manifest.json, or theme-color | `public/`, `index.html` | 30min |
| 22 | P2 | Thin content on `/experiences`, `/contact`, `/rooms` (intro copy is 1–2 sentences each) | `pages/LocalExperiences.tsx`, `pages/Contact.tsx`, `pages/Rooms.tsx` | content-writer |
| 23 | P2 | No blog / no city-pages / no comparison content (zero long-tail capture) | n/a | content-writer |
| 24 | P3 | `Footer.tsx:15` GSTIN is placeholder `11AAAAA0000A1Z5` | `components/Footer.tsx:15` | 1min |
| 25 | P3 | `vercel.json` has no Cache-Control for HTML, no Permissions-Policy, no Strict-Transport-Security, no `Link: rel=preload` | `vercel.json` | 30min |

---

## 3. Page Inventory

> All routes resolve to **the same `index.html`** with the same `<title>`, meta description, OG tags, and JSON-LD. There is **no per-route SEO at all**. Below "Title/Desc" reflects what Google currently sees for every URL.

| URL | Component | Title (current) | Meta description | H1 | Schema | Indexable? |
|-----|-----------|-----------------|------------------|----|--------|-----------|
| `/` (or `/#/`) | `pages/Home.tsx` | "Urbane Haauz \| Luxury Hotel in Pelling, Sikkim with Kanchenjunga Views" | global (Unsplash stock, ₹500 wrong) | "Urbane Haauz" (line 28 — brand only, not a keyword) | global Hotel (placeholder phone, generic geo) | NO — hash route, no prerender |
| `/rooms` | `pages/Rooms.tsx` | (same global) | (same) | "Our Accommodation" (line 21) | none | NO + nav link hidden |
| `/experiences` | `pages/LocalExperiences.tsx` | (same global) | (same) | "Local Experiences" (line 95) | none | NO |
| `/book` | `pages/BookingFlow.tsx` | (same global) | (same) | none — only `<h2>` "Dates & Room" (line 468) | none | NO |
| `/contact` | `pages/Contact.tsx` | (same global) | (same) | "Contact Us" (line 92) | none — missing LocalBusiness | NO |
| `/my-bookings` | `pages/MyBookings.tsx` | (same global) | (same) | "My Bookings" (line 206) | none | should be `noindex` |
| `/admin` | `pages/AdminDashboard.tsx` | (same global) | (same) | (admin) | none | should be `noindex,nofollow` |
| `/admin/login` | `pages/AdminLogin.tsx` | (same global) | (same) | "Admin Access" (line 72) | none | should be `noindex,nofollow` |
| `/auth/callback` | `pages/AuthCallback.tsx` | (same global) | (same) | none | none | should be `noindex` |

**Heading-hierarchy notes**:
- `pages/Home.tsx:28` — `<h1>` is just "Urbane Haauz". Should be e.g. *"Boutique Hotel in Upper Pelling with Direct Kanchenjunga Views"*.
- `pages/BookingFlow.tsx` — has **no `<h1>`**, only step `<h2>`s (lines 468, 543, 731).
- `pages/Rooms.tsx:21` — `<h1>` "Our Accommodation" — replace with *"Rooms & Dorms in Upper Pelling — Kanchenjunga-View Hotel"*.
- `pages/AdminDashboard.tsx` and `pages/MyBookings.tsx` use `<h2>` before `<h1>` in source order (h2 at lines 184, h1 at 206 in MyBookings).

---

## 4. Issues by Category

### 4.1 Indexability & Routing (P0 BLOCKER)
- `App.tsx:51` uses `<HashRouter>`. Per project `CLAUDE.md`, this is intentional for Supabase OAuth — **do NOT swap to BrowserRouter blindly**. Two acceptable fixes:
  - **Fastest**: keep HashRouter and add a build step that generates static HTML stubs (`/rooms/index.html`, `/experiences/index.html`, etc.) each containing the correct `<title>`, meta, canonical, JSON-LD, and a `<noscript>` block with the page's textual content. Vercel rewrites in `vercel.json` already send everything to `index.html` — change them to per-path stubs first, with a fallthrough.
  - **Cleaner**: introduce `react-router-dom`'s `BrowserRouter` for *content* routes only, and keep a separate `HashRouter` mounted at `/auth` for the OAuth callback. Update Supabase redirect URL to `/auth/callback` (no hash). Then prerender with `vite-plugin-ssr` / `vike` / `react-snap`.
- `vercel.json:8` — current rewrite `/(.*) → /index.html` means the prerender output (if added to `dist/`) would be shadowed. Whichever solution is chosen, the rewrite must be made conditional on a missing static file.

### 4.2 Meta Tags (P0)
- `index.html:7` — single global `<title>`. Need `react-helmet-async` (or per-page static stubs as above) so each route emits its own.
- `index.html:10` — description claims "Starting ₹500/night" — false. DORM starts at ₹400, rooms at ₹1,200. Will trigger trust issues with Google's quality raters and Bengali family travellers comparing OTA prices.
- `index.html:11` — keywords meta is unused by Google but harmless; remove for cleanliness.
- `index.html:14` — canonical hard-coded to `/`; every page currently canonicalises to homepage (= duplicate-content self-cannibalization).
- `index.html:21,30,66` — OG/Twitter/JSON-LD images all use the same Unsplash stock URL `images.unsplash.com/photo-1506905925346-...`. Replace with `/lib/hero-image.png` (already in `public/lib/`) hosted from `urbanehaauz.com`. Generates social-share trust + brand recognition.
- `index.html:5` — favicon is also the Unsplash stock photo via remote URL (slow + leaks referrer + not branded).

### 4.3 Structured Data (P1)
- `index.html:33-68` — single `Hotel` JSON-LD with errors:
  - `telephone: "+91-98765-43210"` — placeholder. Real number per `components/Footer.tsx:7` is `+91 9136032524`.
  - `addressLocality: "West Sikkim"` — should be `"Pelling"`; `addressRegion` should be `"Sikkim"`.
  - `geo` 27.3000 / 88.2333 is town centroid, not the property in Upper Pelling.
  - `priceRange: "₹500 - ₹8000"` — replace with `"₹400 - ₹3900"`.
  - Missing: `@type` should be `LodgingBusiness` (or both `Hotel` + `LodgingBusiness`); missing `numberOfRooms: 8`, `petsAllowed`, `checkinTime`, `checkoutTime`, `currenciesAccepted: "INR"`, `paymentAccepted`, `containsPlace` for room types incl. dorm beds, `aggregateRating` (pull from `ReviewsSection.tsx`), `makesOffer` for CP/MAP plans.
- Missing globally: `BreadcrumbList`, `FAQPage` (huge GEO win for "What's the best time to visit Pelling?"), `TouristAttraction` for the Experiences page entries, `Organization` with `sameAs` social profiles.

### 4.4 robots.txt / sitemap.xml (P0)
- `public/` contains only `lib/hero-image.png`. **No `robots.txt`, no `sitemap.xml`, no `humans.txt`, no manifest.**
- Required `public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  Disallow: /admin
  Disallow: /admin/login
  Disallow: /my-bookings
  Disallow: /auth/
  Sitemap: https://www.urbanehaauz.com/sitemap.xml
  ```
- Required `public/sitemap.xml` with `/`, `/rooms`, `/experiences`, `/contact`, `/book` (priority 1.0 for `/` and `/book`).

### 4.5 Internal Linking (P1)
- `components/Navbar.tsx:58` — entire Rooms tab is commented out. The site has zero internal link to `/rooms` from any global nav, so even if it were indexable, PageRank wouldn't flow.
- `components/Footer.tsx:37-38` — "Accommodation" and "Book Now" both point to **`https://urbanehaauz.runhotel.site/en/`** (external). Every internal link should land on `/book` so the canonical domain captures the conversion. Razorpay direct booking exists in `pages/BookingFlow.tsx`/`components/PaymentButton.tsx` already; the `runhotel.site` link is leaking the hotel's #1 commercial KPI.
- `pages/Home.tsx:36` — same problem. Hero CTA leaks.
- No cross-links between room cards on `Home.tsx` and individual room detail pages (no room-detail pages exist at all — every room is rendered inside `Rooms.tsx` from a single grid).
- No breadcrumbs anywhere.

### 4.6 Image SEO (P2)
Inventory of `<img>` tags:
- `pages/Home.tsx:15-19` — alt OK ("Golden Sunrise over Kanchenjunga"); no width/height; not lazy; `src` is from Supabase `homeHeroImage`.
- `pages/Rooms.tsx:62-66` — alt = `{room.name}` (data-driven, OK); no dims; not lazy.
- `pages/BookingFlow.tsx:385` — alt="Room" (lazy/generic — bad).
- `pages/BookingFlow.tsx:507` — alt={room.name} OK.
- `pages/AdminDashboard.tsx:1189,1209,1356` — admin only, not indexed.
- `components/PaymentButton.tsx` — 4 `<img>` (likely Razorpay/badge logos) — verify alts.
- `components/VideoPlayer.tsx` — 1 `<img>` (poster) — verify.
- No image uses WebP, AVIF, or `srcset`. The Supabase-stored hero is likely a multi-MB PNG (`public/lib/hero-image.png` is 1 file, dimensions unknown).

### 4.7 Performance / Render-Blocking (P1)
- `index.html:69` — `<script src="https://cdn.tailwindcss.com">` is the **Tailwind Play CDN**, explicitly marked "not for production". It compiles CSS in the browser at runtime → render-blocking, ~80KB JS, FOUC, hurts LCP & CLS. Project also has Tailwind config inlined at lines 71-104; this needs migrating to a real PostCSS build (`tailwindcss` + `@tailwindcss/postcss` + `index.css` `@tailwind base/components/utilities`).
- `index.html:70` — Google Fonts loaded synchronously, no `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
- `vite.config.ts` — no `build.target`, no manualChunks, no `vite-plugin-compression`, no `splitVendorChunkPlugin`. Bundle is one big chunk; AdminDashboard.tsx is 2,036 lines and ships to every visitor (no lazy import).
- `App.tsx:7-13` — all pages are eagerly imported. Should be `React.lazy(() => import('./pages/AdminDashboard'))` etc., wrapped in `Suspense`.
- `vercel.json` — no `Cache-Control: public, max-age=0, must-revalidate` for `index.html`, no `Strict-Transport-Security`, no `Permissions-Policy`, no `Link: <font>; rel=preload`.

### 4.8 i18n / hreflang (P1)
- `LanguageProvider` exists with en/hi (per `CLAUDE.md`). Bengali audience is the primary target, but no Bengali (`bn`) translations exist. No `<link rel="alternate" hreflang="...">` tags. No `lang` attribute switching on `<html>` (always `lang="en"` per `index.html:2`).

### 4.9 Thin / Duplicate Content (P2)
- Every route serves the same HTML → 100% duplicate content from a crawler's perspective.
- `pages/Contact.tsx` — has only one paragraph of body copy.
- `pages/LocalExperiences.tsx` — experience cards are short blurbs; no monastery names, no distances, no transport details that would rank.
- No blog. No "Things to do in Pelling in April", "Pelling vs Gangtok", "How to reach Pelling from Bagdogra", "Best time to see Kanchenjunga" — these are exactly the queries Bengali families from Kolkata are typing right now.

### 4.10 Misc
- `components/Footer.tsx:15` — placeholder GSTIN `11AAAAA0000A1Z5`. Replace before publishing schema.
- `components/Footer.tsx:13-14` — Instagram/Facebook URLs are guessed; should appear in JSON-LD `sameAs` once verified.
- `nginx.conf` and `Dockerfile` exist — confirm whether anything still runs on Nginx; if not, delete to avoid confusing Vercel deploys.

---

## 5. Quick Wins (each < 1 hour, ranked by booking impact during 86-day peak)

1. **(5 min)** `pages/Home.tsx:36` & `components/Footer.tsx:37-38` — change the "Check Availability" / "Accommodation" / "Book Now" hrefs from `https://urbanehaauz.runhotel.site/en/` to internal `<Link to="/book">`. This single change starts capturing direct bookings (saving 15–18% OTA commission) immediately, before SEO traffic even arrives.
2. **(5 min)** `components/Navbar.tsx:58` — un-comment the `/rooms` nav link so visitors and crawlers can reach it.
3. **(5 min)** Create `public/robots.txt` with the snippet in §4.4.
4. **(15 min)** Create `public/sitemap.xml` listing the 5 public routes; submit in Google Search Console + Bing Webmaster Tools.
5. **(10 min)** `index.html:7` — fix `<title>` to *"Urbane Haauz — Boutique Hotel in Upper Pelling with Kanchenjunga Views"* (60 chars). Fix description (line 10) to remove "₹500" and add "Direct booking. CP/MAP meal plans. Dormitory beds available." (149 chars).
6. **(10 min)** `index.html:5,21,30,66` — replace all 4 Unsplash URLs with `/lib/hero-image.png` served from own domain. Fix favicon to a real `/favicon.ico` (generate from logo).
7. **(10 min)** `index.html:33-68` — fix JSON-LD: real phone, `addressLocality: "Pelling"`, real geo (get from Google Maps), `priceRange: "₹400 - ₹3900"`, add `numberOfRooms: 8`, `currenciesAccepted: "INR"`.
8. **(15 min)** `pages/Home.tsx:28` — change `<h1>` text to *"Boutique Hotel in Upper Pelling — Direct Kanchenjunga Views"* (keep brand in `<title>` and elsewhere).
9. **(20 min)** `pages/BookingFlow.tsx` — add a real `<h1>"Book Your Stay at Urbane Haauz, Pelling"</h1>` above the step indicator (currently lines 468/543/731 use only `<h2>`).
10. **(30 min)** `vercel.json` — add `Strict-Transport-Security`, `Permissions-Policy`, `Cache-Control: public, max-age=0, must-revalidate` for `/index.html`, and a `Cache-Control: public, max-age=86400` for `/lib/(.*)`.
11. **(30 min)** Add `loading="lazy" decoding="async" width="..." height="..."` to every `<img>` listed in §4.6.
12. **(45 min)** `index.html` — replace Tailwind CDN with proper PostCSS build (later: full migration; immediate: at minimum add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` and move the `<script src="cdn.tailwindcss.com">` to `defer`).
13. **(45 min)** `App.tsx:7-13` — convert AdminDashboard, AdminLogin, AuthCallback, MyBookings, BookingFlow to `React.lazy` imports. Cuts main bundle by ~60% (admin alone is 2k lines).
14. **(30 min)** Add `<meta name="robots" content="noindex,nofollow">` for `/admin*`, `/my-bookings`, `/auth/*` routes — set via helmet once installed; until then add a server-side rule in `vercel.json` `headers` matching those source paths to send `X-Robots-Tag: noindex, nofollow`.

---

## 6. Recommended Agent Sequence (post-audit)

1. **technical-seo** — implement Quick Wins #3, #4, #10, #11, #12, #13, #14 + the prerender / per-route HTML stub solution from §4.1.
2. **schema-architect** — rebuild JSON-LD: `LodgingBusiness`, `BreadcrumbList` per page, `FAQPage` (Bengali-family FAQs), `TouristAttraction` for experiences, `AggregateRating` from `ReviewsSection`. Validate at validator.schema.org.
3. **content-writer** (parallel with #2) — write 3 cornerstone pages targeting Quick-Win #5/#8 keywords:
   - "Pelling Hotel with Kanchenjunga View" (homepage rewrite)
   - "Pelling Hostel & Dormitory Beds" (DORM landing — only Pelling boutique with dorms = unique angle)
   - "How to Reach Pelling from Kolkata / Bagdogra / NJP" (intent: Bengali families)
4. **local-seo** — Google Business Profile optimisation, NAP citations on MakeMyTrip / Booking listings page, Sikkim Tourism Board listing, Tripoto / Holidify guest posts.
5. **keyword-researcher** + **geo-optimizer** in parallel — long-tail capture & AI-overview prep.
6. **link-builder** — outreach to Sikkim/Bengal travel bloggers for the 86-day window.

---

## 7. Memory (for downstream agents)

- **All public routes**: `/`, `/rooms`, `/experiences`, `/book`, `/contact`. Admin/auth routes must stay `noindex`.
- **Files needing immediate edits**: `index.html`, `App.tsx`, `vercel.json`, `vite.config.ts`, `pages/Home.tsx`, `pages/Rooms.tsx`, `pages/BookingFlow.tsx`, `components/Navbar.tsx`, `components/Footer.tsx`, plus new `public/robots.txt` and `public/sitemap.xml`.
- **Hard constraint**: `App.tsx` HashRouter exists for Supabase OAuth (`pages/AuthCallback.tsx` + `CLAUDE.md`). Any indexability fix must preserve `/#/auth/callback` behaviour or coordinate a Supabase redirect URL change.
- **Hotel facts to use everywhere**: 8 rooms, Upper Pelling, PIN 737113, +91 9136032524, urbanehaauz@gmail.com, ₹400-3900, CP/MAP, only Pelling boutique with DORM beds, direct Razorpay booking, Bengali/Bihari family target market.
- **Missing assets**: no logo file, no favicon, no OG image hosted on own domain (only `public/lib/hero-image.png` exists).
- **Critical conversion bug** (not strictly SEO but discovered during audit): primary CTAs leak to `runhotel.site`, defeating Razorpay direct-booking strategy and the operating-gap recovery plan.
