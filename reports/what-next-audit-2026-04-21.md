# Urbane Haauz — What-Next On-Site Audit (Post Phase B)

**Date**: 2026-04-21 (re-audit on same calendar day as Phase B shipped)
**Auditor**: seo-auditor agent
**Baseline**: docs/urbanehaauz-seo-agents/audit-2026-04-21.md (Phase A punch list, post commit 26c1d74)
**Scope**: Verify Phase-B claims, flag regressions from recent logo/favicon/hero/Rangotsav shipments, identify remaining ranking blockers
**Methodology**: Static code inspection of `main` (no live crawl, no Lighthouse run)

---

## TL;DR

Phase B cleared 7 of 8 P0s and 7 of 12 P1s from the prior audit — the site is structurally much healthier: clean nav with `/rooms` + `/experiences` + `/blog` restored, noindex on `/my-bookings`, HotelRoom + FAQ + Event schema all live, per-route Breadcrumb nodes, `uh-badge.png` retired in favour of `logo-uh.png` (59 KB), hero slimmed from 1 MB PNG to 153 KB JPG with preload + fetchpriority. One P0 regressed: schema/Footer email is still `urbanehaauz@gmail.com` while the Supabase `send-email` function sends FROM `info@urbanehaauz.com` — the two personas are now unified in sender behaviour but split on the entity-graph. Two **new** issues introduced this sprint: (1) all six blog-post frontmatters point at the 1 MB `/lib/hero-image.png` for their OG/schema image — that file still exists in `public/` so it 200s, but every social share now pulls a 1 MB asset; (2) the Hotel geo in index.html was tightened to `27.2988033, 88.2271633` but the Rangotsav `Event.location.geo` in `lib/seo/schemas.ts` is still `27.2995, 88.2575` and the Contact map iframe is still on placeholder `v1234567890` coords — Event schema now disagrees with Hotel schema on the same site.

**Top 3 remaining on-site blockers** for branded + "pelling hotels" ranking:
1. NAP drift — email (gmail vs info@), Event vs Hotel geo, map iframe still placeholder
2. Blog-post OG/schema images point at 1 MB PNG — every Perplexity/Google AIO citation pulls a bloated asset
3. Home H1 is decorative "Urbane Haauz" only; BookingFlow has no H1; Contact H1 is "Contact Us" — primary H1 slots on three of the five indexable money pages still carry zero keyword signal

---

## Phase-A verification matrix

| # | Prior finding | File (then) | Status | Notes |
|---|---|---|---|---|
| P0-1 | `/rooms` link commented out in Navbar | `components/Navbar.tsx:68-73, 168-176` | **Done** | Desktop line 71-74, mobile line 177-183. Label uses `t.rooms` i18n string. |
| P0-2 | `/experiences` not in Navbar | `components/Navbar.tsx` | **Done** | Desktop line 75-78, mobile line 184-190. `/blog` also now linked as "Guides". |
| P0-3 | `/pelling-2.0` noindex but in sitemap | `pages/PellingAfterDark.tsx:1830`, `public/sitemap.xml:39-44` | **Done** | `pages/PellingAfterDark.tsx:1832` now `index, follow`; sitemap keeps the URL. Conflict resolved by making the page indexable rather than removing it. |
| P0-4 | Placeholder WhatsApp `919800000000` | `pages/BookingFlow.tsx:359` | **Done** | `pages/BookingFlow.tsx:369` now `https://wa.me/919136032524`. Grep for `919800000000` returns only historical docs. |
| P0-5 | 9 oversized public images | `public/lib/hero-image.png` 1.0 MB + 8 others | **Partial** | Hero replaced by `hero-image.jpg` (153 KB) + `hero-image-800.jpg` (41 KB). Orchid 1.5 MB → 93 KB PNG. `samir-debnath` PNG → JPG 85 KB. `artwork-angel` 1.0 MB → 368 KB. But **no file has been converted to WebP** despite the punch-list recommending it; 4 files still >250 KB (`artwork-angel.jpg` 368 KB, `artwork-stupa.jpg` 337 KB, `kandy-perahera.jpg` 403 KB, `sadda-pind.jpg` 340 KB). The 1 MB `hero-image.png` is still sitting in `public/lib/` orphaned — see New-#2 below. |
| P0-6 | Home hero `<img>` missing width/height | `pages/Home.tsx:25-29` | **Done** | `pages/Home.tsx:86-94` now has `width={1600} height={765} fetchPriority="high" decoding="async"`. |
| P0-7 | JSON-LD email still gmail (conflict with Resend FROM) | `index.html:55,130` | **Regressed/Not done** | `index.html:55, 137` still `urbanehaauz@gmail.com`. `components/Footer.tsx:9` still `urbanehaauz@gmail.com`. `marketing/config.ts:51` still `urbanehaauz@gmail.com`. Supabase Edge Function at `supabase/functions/send-email/index.ts:3` sends FROM `info@urbanehaauz.com`. The entity graph now says the hotel's email is gmail; outbound mail says it's info@. Pick one. |
| P0-8 | Trailing-slash canonical inconsistency | `index.html:16` vs per-page | **Partial** | `index.html:16` still `https://urbanehaauz.com/` (trailing slash). Sub-pages (`/rooms`, `/book`, `/contact`, `/experiences`, `/rangotsav`, `/pelling-2.0`, `/blog`, `/blog/:slug`) all use no-trailing-slash. Google will canonicalise, but you should document this in `vercel.json` or drop the root slash. |

| P1-9 | No HotelRoom schema | `index.html:102-106` | **Done** | `pages/Rooms.tsx:84-137` emits a `@graph` array with `HotelRoom` (Premium, Super Deluxe) + `Accommodation` (Dorm), each with `occupancy`, `bed`, `amenityFeature`, `url`. |
| P1-10 | No FAQPage schema | site-wide | **Done** | Home: 6 Q&A in `pages/Home.tsx:12-66`. Rooms: 5 Q&A in `pages/Rooms.tsx:148-193`. Contact: 6 Q&A in `pages/Contact.tsx:26-80`. No duplicate FAQPage in index.html (comment at line 228 confirms the scope decision). |
| P1-11 | No Review/AggregateRating | `pages/Home.tsx:165-184` | **Not done** | Still no `Review` or `aggregateRating` nodes anywhere. `TESTIMONIALS` in `lib/mockData.ts` still used on Home. Deferred until genuine reviews collected (correct call — do not seed fake aggregateRating). |
| P1-12 | BreadcrumbList only on Home | `index.html:180-187` | **Done** | Per-page breadcrumbs on `/rooms`, `/experiences`, `/contact`, `/book`, `/rangotsav`, `/blog`, `/blog/:slug`. `BookingFlow.tsx:353-360` emits `BOOK_BREADCRUMB_JSONLD`. |
| P1-13 | LodgingBusiness should be dual-typed | `index.html:121` | **Done** | `index.html:128` now `"@type": ["LodgingBusiness", "LocalBusiness"]`. |
| P1-14 | Room `alt` text keyword-thin | `pages/Rooms.tsx:74`, `pages/Home.tsx:134` | **Not applicable** | Rooms page was redesigned text-only (no `<img>` tags, comment at `pages/Rooms.tsx:14` "intentionally text-only"). Home rooms section now renders brand gradient, no photos. Issue evaporated by design change — revisit when real photography lands. |
| P1-15 | `/my-bookings` has no Helmet/noindex | `pages/MyBookings.tsx` | **Done** | `pages/MyBookings.tsx:206` now emits `<meta name="robots" content="noindex, nofollow" />`. |
| P1-16 | `uh-badge.png` 425 KB for 40×40 | `public/uh-badge.png` | **Done** | Replaced by `logo-uh.png` (59 KB) across Navbar, Rangotsav, PellingAfterDark, Blog schema, BlogPost schema, all 5 email templates, PaymentButton, favicon meta, apple-touch-icon, preload. `uh-badge.png` still exists (16 KB now) but grep shows zero active callers. |
| P1-17 | `/rooms` title 68 chars | `pages/Rooms.tsx:21-22` | **Not done** | Still `Rooms & Dorms \| Urbane Haauz Pelling — Kanchenjunga View Hotel` (68 chars). Over the 60-char soft cap — Google will truncate to "…Pelling —". |
| P1-18 | Contact H1 generic "Contact Us" | `pages/Contact.tsx:102` | **Not done** | `pages/Contact.tsx:169` still `<h1>Contact Us</h1>`. |
| P1-19 | Rooms H1 "Our Accommodation" | `pages/Rooms.tsx:31` | **Partial** | `pages/Rooms.tsx:219` now `Three ways to stay` — prettier, but zero keyword density (no "Pelling", no "Kanchenjunga", no "rooms/dorms"). The tagline-as-H1 aesthetic is a trade-off the founder should make explicitly. |
| P1-20 | External runhotel CTAs leak link equity | Home, Navbar | **Not resolved / design decision** | All Book Now CTAs still go to `https://urbanehaauz.runhotel.site/en/`. `/book` route still exists with Razorpay flow. Two booking funnels live in parallel. Decision needed from founder on canonical funnel; until then, `/book` is effectively deprecated in the visitor flow but still indexable (in sitemap with priority 1.0). |

**Cleared**: P0 1, 2, 3, 4, 6; P1 9, 10, 12, 13, 14, 15, 16
**Partial**: P0 5, 8; P1 19
**Not done**: P0 7; P1 11, 17, 18, 20
**Regressed**: none from Phase A list, but see New Issues below

---

## New issues introduced since the previous audit

Three material issues appeared in Phase B that were not in the prior audit.

### P0 — new

| # | Issue | File · line | Fix |
|---|---|---|---|
| N1 | **All six blog-post OG/schema images reference `/lib/hero-image.png` (1.09 MB)**. The PNG still physically exists in `public/` (not deleted when `hero-image.jpg` replaced it as the site default), so URLs resolve 200 — but every Facebook/LinkedIn/Twitter card preview, every Perplexity citation, every Google Article rich-result now fetches a 1 MB image when a 150 KB version exists on the same server. | `content/blog/*.md` (frontmatter `image:` line, all 6 files) | Change all 6 frontmatter `image:` values from `/lib/hero-image.png` to `/lib/hero-image.jpg`. Then delete `public/lib/hero-image.png` (no live caller after fix). Grep confirms zero runtime references to the PNG — only stale blog frontmatter + docs. |
| N2 | **Hotel geo vs Event geo diverged**. `index.html:66-67, 148-149` Hotel + LodgingBusiness geo was tightened to `27.2988033, 88.2271633` (GBP-matched). But `lib/seo/schemas.ts:61-62` Rangotsav `Event.location.geo` is still `27.2995, 88.2575`. And `pages/Contact.tsx:398` map iframe still uses `88.2575!3d27.2995` + placeholder `v1234567890`. Three different coordinates for the same building. | `lib/seo/schemas.ts:61-62`, `pages/Contact.tsx:398` | Sync both to `27.2988033, 88.2271633` (or whatever the final GBP pin resolves to — `local-seo` agent has this tracked). Regenerate the map embed URL from the real GBP place link. |

### P1 — new

| # | Issue | File · line | Fix |
|---|---|---|---|
| N3 | **PellingAfterDark Helmet missing `og:image` + `og:url` + `twitter:card`**. Now that the page is `index, follow` (P0-3 resolution), it's eligible for social sharing, but `pages/PellingAfterDark.tsx:1824-1834` only sets title/description/og:title/og:description/robots/canonical. Any Twitter share falls back to the raw favicon; any LinkedIn share will grab a random in-page image. | `pages/PellingAfterDark.tsx:1824-1834` | Add `<meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />`, `<meta property="og:url" content="https://urbanehaauz.com/pelling-2.0" />`, `<meta name="twitter:card" content="summary_large_image" />`. |
| N4 | **Rangotsav Helmet missing `og:image` + `og:url`**. Same problem — `pages/Rangbhoomi.tsx:1385-1400` has title/description/og:title/og:description/og:type=event/canonical, but no `og:image`. The Event schema (`RANGOTSAV_EVENT_JSONLD.image`) sets `rangotsav-ganesh.jpeg` + `og-image.jpg` for rich results, but meta OG tags for WhatsApp/Telegram/Slack/iMessage previews don't read JSON-LD — they read `<meta property="og:image">`. | `pages/Rangbhoomi.tsx:1385-1400` | Add `<meta property="og:image" content="https://urbanehaauz.com/rangotsav-ganesh.jpeg" />` (174 KB, correct dimensions) and `<meta property="og:url" content="https://urbanehaauz.com/rangotsav" />`. |
| N5 | **`uh-badge.png` 16 KB is still in `public/`** — no callers, dead weight. Same for `public/lib/hero-image.png` 1.09 MB (see N1 — after the frontmatter fix this becomes deletable). Small footprint items but clutter the static host and confuse future agents. | `public/uh-badge.png`, `public/lib/hero-image.png` | Delete after confirming no runtime reference. |
| N6 | **`public/logo.jpeg` 183 KB exists with no callers**. Grep shows zero references in `src` or schema. Legacy pre-`logo-uh.png` asset. | `public/logo.jpeg` | Delete. |

### P2 — new / observational

| # | Issue | File · line | Fix |
|---|---|---|---|
| N7 | `index.html:6-7` sets `rel="icon"` to both `/favicon.ico` (13 KB, good) and `/logo-uh.png` (59 KB). The `apple-touch-icon` also uses `/logo-uh.png`. Apple recommends a dedicated 180×180 PNG for touch icons; re-using the 512×512 generic logo means iOS Home-Screen shortcuts render a padded/cropped version. | `index.html:6-7` | Generate `apple-touch-icon-180.png` and swap the `apple-touch-icon` href. Low priority. |
| N8 | `pages/Home.tsx:88` hero `alt="Golden Sunrise over Kanchenjunga"` is fine, but the actual image is set dynamically from `homeHeroImage` (Supabase-driven, with a localStorage override). If an admin uploads a non-sunrise image via the dashboard, the `alt` becomes inaccurate — accessibility false-advertising. | `pages/Home.tsx:86-94` | Either (a) make `alt` track the Supabase `home_hero_image` metadata if present, or (b) generalise to `alt="Upper Pelling view from Urbane Haauz"`. |
| N9 | `content/blog/*.md` — 6 new pillar posts are in sitemap.xml but their frontmatter uses the hero-image.png for OG — see N1. Also the blog-post OG/Twitter meta is not fully inspected here; needs its own per-post audit once the image-path fix lands. | `pages/BlogPost.tsx`, `content/blog/*.md` | Phase C: audit each post for unique OG image + unique Twitter card + internal linking to `/rooms` and `/book`. |

---

## Remaining blockers to first-page ranking (not covered by Phase B)

The Phase-A audit captured most of these; they persist into Phase B. Called out explicitly because the founder asked what's still blocking "Urbane Haauz" (branded) and "pelling hotels" (unbranded) queries.

### For branded "Urbane Haauz" — low risk, two polish items

Branded ranking is essentially solved: JSON-LD Hotel + LodgingBusiness + LocalBusiness + Organization all validate, FAQ live, sitelinks SearchAction in place, sitemap clean, robots.txt correct, BrowserRouter serves clean URLs, canonical consistent on sub-pages, OG image present, favicon + logo unified. Google will bring the brand up for `site:urbanehaauz.com` and exact-match `urbane haauz` within a crawl cycle or two.

What still slightly dampens brand-SERP richness:
- **No Review / aggregateRating schema** (P1-11) — the knowledge-panel "rating stars" slot stays empty. Needs real reviews, not mock data.
- **No Organization `sameAs` to GBP CID** — `index.html:102-107, 182-187` has Instagram/Facebook/Google-Maps place URLs but not the GBP CID URL or a `Review` source. Adding the GBP review URL once GBP description is published will tighten entity disambiguation.

### For unbranded "pelling hotels" / "hotels in pelling sikkim" — structural + content

These are the ranking blockers that Phase A + Phase B did not tackle. All require new content or new links (local-seo + content-writer + keyword-researcher work), not SEO-auditor scope.

1. **Thin internal linking to `/rooms` and `/book`** — Home now has a "Curated Spaces" section with a working "View All Rooms" link and a `Link to="/rooms"` (Home.tsx:251-253) plus a `/rangotsav` hero CTA. But all "Book Now" CTAs still point off-site to runhotel.site (see P1-20). From an external SEO perspective, `/rooms` gets one contextual link per page plus navbar; `/book` gets zero contextual links — it's indexable but orphan-ish. Google's "Hotels in Pelling" SERP features sites where the room page is 1 click from every relevant sub-page with varied anchor text.
2. **No location-qualified content page** — no `/pelling` or `/upper-pelling` hub page that consolidates the "what is Upper Pelling / why stay here / how it compares to Lower Pelling" query space. Competitors like Hotel Garuda and Norbu Ghang have thin/generic content but rank for the query. Blog posts help (`/blog/where-to-stay-in-upper-pelling`) but need internal links from Home/Rooms/Experiences to build authority.
3. **No `itemListElement` on sitemap.xml for image sitemaps** — image sitemaps help the Maps/Hotels pack choose a representative thumbnail. Minor.
4. **No `hreflang="en-IN"` or `x-default`** — target audience is Indian; current default `en` without locale variant is leaving a tiny signal on the table (P2-28 from prior audit).
5. **Booking funnel confusion** (P1-20 unresolved) — if `/book` is the canonical funnel, fix all Navbar/Home/Rooms CTAs to use it; if runhotel.site is canonical, drop `/book` from sitemap and 301 internally. Two live funnels = diluted conversion data + diluted link equity.
6. **No backlinks / no link-building yet** — out of scope for this agent, but noted: a new domain with zero referring domains will not out-rank established OTAs (MakeMyTrip, Booking.com) on a generic `pelling hotels` query regardless of on-page perfection. Realistic on-page ceiling: page 2-3 organic, or page 1 with long-tail qualifiers like `upper pelling boutique hotel`, `pelling hotel with dorm`, `kanchenjunga view hotel pelling`.

---

## Page-by-page inventory (post Phase B)

| Route | File | Title len | Meta desc len | Canonical | OG image | H1 | Schema | Status |
|---|---|---|---|---|---|---|---|---|
| `/` | `pages/Home.tsx` | 73 ⚠ | 155 ✓ | ✓ | ✓ | 1 ✓ (decorative) | FAQPage + Hotel (global) | OK |
| `/rooms` | `pages/Rooms.tsx` | 68 ⚠ | 149 ✓ | ✓ | ✓ | 1 ✓ (no keyword) | HotelRoom + FAQ + Breadcrumb | OK |
| `/experiences` | `pages/LocalExperiences.tsx` | 44 ✓ | 141 ✓ | ✓ | ✓ | 1 ✓ | Breadcrumb | OK |
| `/book` | `pages/BookingFlow.tsx` | 59 ✓ | 130 ✓ | ✓ | ✓ | **0 ❌** | Breadcrumb | Needs H1 |
| `/contact` | `pages/Contact.tsx` | 60 ✓ | 142 ✓ | ✓ | ✓ | 1 ✓ (weak) | Breadcrumb + FAQ | OK |
| `/blog` | `pages/Blog.tsx` | 45 ✓ | 138 ✓ | ✓ | ✓ | 1 ✓ | Blog ItemList | **New — OK** |
| `/blog/:slug` | `pages/BlogPost.tsx` | dynamic | dynamic | ✓ | ⚠ (1 MB PNG, see N1) | 1 ✓ | BlogPosting + Breadcrumb | Image fix needed |
| `/my-bookings` | `pages/MyBookings.tsx` | inherit | inherit | — | — | 1 ✓ | — | **noindex ✓** |
| `/rangotsav` | `pages/Rangbhoomi.tsx` | 49 ✓ | 145 ✓ | ✓ | **❌ missing** | 1 ✓ | Event + Breadcrumb | OG image needed (N4) |
| `/pelling-2.0` | `pages/PellingAfterDark.tsx` | 62 ⚠ | 198 ⚠ | ✓ | **❌ missing** | 1 ✓ | — | OG image + Twitter needed (N3); indexable ✓ |
| `/auth/callback`, `/admin*` | — | — | — | — | — | — | — | disallowed ✓ |

---

## Schema completeness matrix (post Phase B)

| Schema type | Present? | Location | Gap |
|---|---|---|---|
| Hotel | ✓ | `index.html:45` | No `aggregateRating`, no `review[]` (needs real reviews) |
| LodgingBusiness + LocalBusiness | ✓ (dual-typed) | `index.html:128` | — |
| Organization | ✓ (folded) | `index.html:129` | — |
| WebSite + SearchAction | ✓ | `index.html:208` | — (added in Phase B) |
| BreadcrumbList | ✓ | per-page | — (added in Phase B) |
| HotelRoom | ✓ | `pages/Rooms.tsx:84` | — (added in Phase B) |
| FAQPage | ✓ | Home, Rooms, Contact | — (added in Phase B) |
| Event | ✓ | `lib/seo/schemas.ts:36` | geo mismatches Hotel geo (N2) |
| BlogPosting + Blog | ✓ | `pages/Blog.tsx`, `pages/BlogPost.tsx` | image path wrong (N1) |
| Review + AggregateRating | ❌ | — | blocked on real reviews |

---

## Image audit delta

| Metric | Phase A | Phase B | Delta |
|---|---|---|---|
| `<img>` in public pages | ~18 | ~25 (blog images added) | + blog |
| Missing `alt` | 0 | 0 | — |
| Missing `width`/`height` on hero | yes | no | fixed |
| `fetchpriority="high"` on hero | no | yes | fixed |
| WebP used | 0 | 0 | **still zero** |
| Oversized >500 KB | 9 | 0 | fixed |
| Oversized >250 KB | ? | 4 (artwork-angel, artwork-stupa, kandy-perahera, sadda-pind) | — |
| Orphan files >100 KB | 0 | 2 (hero-image.png 1.09 MB, logo.jpeg 183 KB) | **new** |
| Logo file | `uh-badge.png` 425 KB | `logo-uh.png` 59 KB | fixed |
| Favicon | `.svg` only | `.ico` 13 KB + `.svg` + PNG | fixed |

---

## NAP audit delta (post Phase B)

| Surface | Email | Phone | Geo | Drift? |
|---|---|---|---|---|
| `index.html` Hotel schema | urbanehaauz@gmail.com | +919136032524 | 27.2988033, 88.2271633 | email ⚠ |
| `index.html` LodgingBusiness | urbanehaauz@gmail.com | +919136032524 | 27.2988033, 88.2271633 | email ⚠ |
| `components/Footer.tsx` HOTEL_CONTACT | urbanehaauz@gmail.com | +919136032524 | — | email ⚠ |
| `lib/email/emailService.ts` templates | (use HOTEL_CONTACT) | +91 9136032524 | — | — |
| `supabase/functions/send-email/index.ts` FROM | info@urbanehaauz.com | — | — | ✓ canonical |
| `marketing/config.ts` | urbanehaauz@gmail.com | — | — | email ⚠ |
| `lib/seo/schemas.ts` Event | (none) | — | **27.2995, 88.2575** | geo ⚠ **new** |
| `pages/Contact.tsx` map iframe | — | — | **27.2995, 88.2575** (placeholder URL) | geo ⚠ |
| `pages/BookingFlow.tsx:369` outage banner | — | +919136032524 | — | ✓ fixed |

Three drifts remain:
1. **Email**: gmail on 3 surfaces, info@ on sender — pick a canonical (P0-7 from Phase A, not done)
2. **Geo (new)**: Hotel and LodgingBusiness agree; Event schema + map iframe disagree (N2)
3. **Map embed**: placeholder URL with `v1234567890` hash still in place — pending GBP claim

---

## Technical indicators delta

| Check | Phase A | Phase B | Delta |
|---|---|---|---|
| robots.txt | ✓ | ✓ | — |
| sitemap.xml | ⚠ /pelling-2.0 conflict | ✓ 14 URLs, includes 6 blog posts, all 2026-04-21 | fixed + expanded |
| vercel.json cache headers | ✓ | ✓ | — |
| vite.config.ts code-split | ✓ | ✓ | — |
| Hero preload | no | yes (`/lib/hero-image.jpg`) | fixed |
| Logo preload | no | yes (`/logo-uh.png`) | added |
| hreflang | ❌ | ❌ | unchanged |
| Google Search Console verification file | — | `public/googlef0f36d8e1418cac4.html` | **new — GSC claimed ✓** |
| Favicon.ico | missing | 13 KB | fixed |

---

## Priority summary for next sprint

### P0 (this week)

| # | Item | File | Est. |
|---|---|---|---|
| 1 | Fix email NAP: change `urbanehaauz@gmail.com` → `info@urbanehaauz.com` in `index.html:55, 137`, `components/Footer.tsx:9`, `marketing/config.ts:51`. Keep gmail as `DEFAULT_REPLY_TO` in `supabase/functions/send-email/index.ts:4`. Update Home FAQ copy `pages/Home.tsx:22` + Contact FAQ `pages/Contact.tsx:36, 68` where gmail is quoted in answer text. | index.html, Footer, marketing/config, Home, Contact | 15 min |
| 2 | Fix blog-post OG images: swap all 6 `content/blog/*.md` frontmatter `image: /lib/hero-image.png` → `/lib/hero-image.jpg`. Then delete `public/lib/hero-image.png` (1.09 MB orphan). | content/blog/*.md, public/lib | 10 min |
| 3 | Fix Event schema geo: `lib/seo/schemas.ts:61-62` → `27.2988033, 88.2271633` to match Hotel schema. | lib/seo/schemas.ts | 2 min |
| 4 | Add `og:image` + `og:url` to Rangotsav + Pelling 2.0 Helmets. `pages/Rangbhoomi.tsx:1385-1400` and `pages/PellingAfterDark.tsx:1824-1834`. | 2 files | 10 min |

### P1 (this month)

| # | Item | File | Est. |
|---|---|---|---|
| 5 | Add `<h1>Book Your Stay at Urbane Haauz</h1>` above the stepper on `/book`. | pages/BookingFlow.tsx | 5 min |
| 6 | Rewrite Contact H1: "Contact Us" → "Contact Urbane Haauz · Upper Pelling, Sikkim" | pages/Contact.tsx:169 | 2 min |
| 7 | Rewrite Rooms H1: "Three ways to stay" → "Rooms & Dorms at Urbane Haauz, Pelling" or append keyword-loaded subtitle H2. | pages/Rooms.tsx:219 | 5 min |
| 8 | Shorten Rooms title to ≤60 chars: "Rooms & Dorms in Pelling · Urbane Haauz" | pages/Rooms.tsx:200 | 2 min |
| 9 | Decide booking funnel: either route all CTAs to `/book` or 301 `/book` to runhotel subdomain + drop from sitemap. Cannot keep both. | Home, Navbar, sitemap | 30 min (decision + 10 min code) |
| 10 | Convert top-4 still-oversized images to WebP with JPG fallback: `artwork-angel` (368 KB), `artwork-stupa` (337 KB), `kandy-perahera` (403 KB), `sadda-pind` (340 KB). | public/artists, public/case-studies, callers | 1 hr |
| 11 | Delete orphans: `public/uh-badge.png`, `public/logo.jpeg`. | public/ | 1 min |
| 12 | Fix Pelling 2.0 meta description length (198 → ≤155 chars). | pages/PellingAfterDark.tsx:1828 | 2 min |

### P2 (next quarter)

| # | Item | File | Est. |
|---|---|---|---|
| 13 | Sync map iframe coords in `pages/Contact.tsx:398` with schema, remove placeholder `v1234567890` — regenerate from GBP place link when claimed. | pages/Contact.tsx | blocked on local-seo |
| 14 | Seed real Review schema + aggregateRating once 10+ genuine reviews collected. | index.html + mockData replacement | blocked |
| 15 | Add `hreflang="en-IN"` + `x-default` across all Helmets. | all pages | 30 min |
| 16 | Export dedicated 180×180 `apple-touch-icon.png`. | public/ | 10 min |
| 17 | Make Home hero `alt` track the Supabase `home_hero_image` metadata so alt stays accurate when admin swaps the image. | pages/Home.tsx, context/AppContext.tsx | 20 min |
| 18 | Consider SSG prerender (vite-plugin-ssr) for `/`, `/rooms`, `/experiences`, `/contact`, `/blog/*` — improves crawl for Bingbot/Applebot and citation surfaces. | vite.config.ts | 1 day |

---

## Quick wins (< 30 min each)

1. Swap 3 email strings + delete 1 PNG file — unifies NAP and saves 1 MB host weight (P0 #1 + #2)
2. Sync Event schema geo to Hotel geo — one-line fix, eliminates cross-schema conflict (P0 #3)
3. Add `og:image` to Rangotsav + Pelling 2.0 — two two-line changes (P0 #4)
4. Add `<h1>` to BookingFlow (P1 #5)
5. Delete `uh-badge.png` + `logo.jpeg` orphans — no downside, tidies static host (P1 #11)

Each under 30 minutes; together they resolve every P0 from this re-audit.

---

## Recommended agent sequence

1. **technical-seo** — execute P0 #1-4 + P1 #5-12 in one PR. Title: `Phase C foundation cleanup`.
2. **schema-architect** — review synced Event geo, add Review scaffold (leave empty until reviews arrive), add Organization `sameAs` for GBP CID when local-seo delivers it.
3. **local-seo** — resolve the map iframe (P2 #13) once GBP description + claim go live. This is the only piece that sits outside the agent roster's direct code path.
4. **content-writer** — address H1 rewrites (P1 #6-7) with founder's brand voice; draft a `/pelling` or `/upper-pelling` hub page per the unbranded ranking blocker (ranking-blockers #2).
5. **link-builder** (not run yet) — the on-page ceiling for `pelling hotels` is page 2 without referring domains. Schedule outreach once above fixes ship.

Do NOT run schema-architect before the Event-geo fix — it will read stale coords and propagate them into any new JSON-LD blocks.

---

## What this re-audit did NOT check

- Live Core Web Vitals via Lighthouse / PSI (requires deployed URL)
- Real crawl via Screaming Frog
- Every blog post individually — sampling confirmed the frontmatter pattern, not the body
- Backlink profile / GSC indexing status / GA4 data
- Rangotsav + Vendor form DB/email round-trip (out of SEO scope)
- GBP listing status (covered by local-seo agent, user explicitly excluded from this audit)
- Accessibility beyond alt-text presence
