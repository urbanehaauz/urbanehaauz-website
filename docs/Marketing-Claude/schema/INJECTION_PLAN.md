# Schema Injection Plan — Urbane Haauz

**Agent:** @schema-architect
**Date:** 2026-04-06 (updated 2026-04-21 — BrowserRouter migration)
**Handoff to:** @technical-seo (already wired react-helmet-async) and @content-writer

This doc describes which JSON-LD schemas should appear on which page, and how to inject them via `react-helmet-async` without duplicating the global schemas already embedded in `index.html`.

## What ships globally in `index.html` (already done)

These schemas are embedded in `<head>` of `index.html` and therefore appear on every route:

1. `Hotel` (@id `https://urbanehaauz.com/#hotel`) — source: `docs/schema/hotel.json`
2. `LodgingBusiness` / `LocalBusiness` / Organization (@id `https://urbanehaauz.com/#organization`) — source: `docs/schema/organization.json`
3. `BreadcrumbList` for Home — source: `docs/schema/breadcrumb.json` → `home`
4. `WebSite` + `SearchAction` (@id `https://urbanehaauz.com/#website`) — enables Sitelinks search box
5. `FAQPage` (@id `https://urbanehaauz.com/#faq`) — global 6-question seed from `gbp-description.md`

**Do NOT re-emit Hotel or Organization on a per-page Helmet** — duplicating a `@id` causes Google to pick one arbitrarily and can dilute entity consolidation. Per-page Helmet should only add *page-specific* schemas (BreadcrumbList for that page, Room schemas on `/rooms`, dedicated FAQPage on `/rooms` or `/contact` with different `@id`, Event on `/rangotsav`, etc.).

## Per-page schema matrix

| Route | Page component | Schemas to inject via Helmet |
|---|---|---|
| `/` | `pages/Home.tsx` | (none — globals sufficient) |
| `/rooms` | `pages/Rooms.tsx` | `BreadcrumbList` (rooms) + 4 `HotelRoom`/`Accommodation` via `@graph` + rooms-specific `FAQPage` (@id `.../rooms#faq`) |
| `/experiences` | `pages/LocalExperiences.tsx` | `BreadcrumbList` (experiences) + (future) `TouristAttraction` items |
| `/book` | `pages/BookingFlow.tsx` | `BreadcrumbList` (book) |
| `/contact` | `pages/Contact.tsx` | `BreadcrumbList` (contact) + contact-specific `FAQPage` (@id `.../contact#faq`) |
| `/rangotsav` | `pages/Rangbhoomi.tsx` | `BreadcrumbList` (rangotsav) + `Event` (@id `.../rangotsav#event`) |
| `/faq` (when built) | `pages/FAQPage.tsx` | `BreadcrumbList` (faq) + `FAQPage` from `faq.json` |
| `/blog/:slug` (future) | blog post template | `BreadcrumbList` (blog_post_template) + `BlogPosting` |

Admin/auth routes must remain noindex and should NOT emit any schema.

## React Helmet snippet pattern

The technical-seo agent has already added `react-helmet-async` with a `HelmetProvider` at the app root. Inside each page component, use the following pattern. Place it at the top of the returned JSX tree.

```tsx
import { Helmet } from 'react-helmet-async';

// ... inside the page component return:
<Helmet>
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
      {"@type": "ListItem", "position": 2, "name": "Rooms & Dorms", "item": "https://urbanehaauz.com/rooms"}
    ]
  })}</script>
</Helmet>
```

**Important**: `react-helmet-async` requires the JSON-LD script's children to be a single string. Always wrap the object with `JSON.stringify(...)` inside `{...}`. Do not use `dangerouslySetInnerHTML`.

### `pages/Home.tsx`
No per-page schema needed. Globals in `index.html` cover it.

### `pages/Rooms.tsx`

Inlined as a module-level `ROOMS_JSONLD` constant (uses `@graph` wrapper so one `<script>` emits all four room types). Also emits `ROOMS_BREADCRUMB_JSONLD` and `ROOMS_FAQ_JSONLD`.

```tsx
<Helmet>
  <script type="application/ld+json">{JSON.stringify(ROOMS_JSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(ROOMS_BREADCRUMB_JSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(ROOMS_FAQ_JSONLD)}</script>
</Helmet>
```

### `pages/BookingFlow.tsx`

```tsx
<Helmet>
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
      {"@type": "ListItem", "position": 2, "name": "Book", "item": "https://urbanehaauz.com/book"}
    ]
  })}</script>
</Helmet>
```

### `pages/Contact.tsx`

```tsx
<Helmet>
  <script type="application/ld+json">{JSON.stringify(CONTACT_BREADCRUMB_JSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(CONTACT_FAQ_JSONLD)}</script>
</Helmet>
```

### `pages/LocalExperiences.tsx`

```tsx
<Helmet>
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
      {"@type": "ListItem", "position": 2, "name": "Experiences", "item": "https://urbanehaauz.com/experiences"}
    ]
  })}</script>
</Helmet>
```

### `pages/Rangbhoomi.tsx`

```tsx
import { RANGOTSAV_BREADCRUMB_JSONLD, RANGOTSAV_EVENT_JSONLD } from '../lib/seo/schemas';

<Helmet>
  <script type="application/ld+json">{JSON.stringify(RANGOTSAV_EVENT_JSONLD)}</script>
  <script type="application/ld+json">{JSON.stringify(RANGOTSAV_BREADCRUMB_JSONLD)}</script>
</Helmet>
```

### `pages/FAQPage.tsx` (to be built by content-writer — only if a dedicated /faq route is added)

Globals in `index.html` already ship a site-wide `FAQPage`. A dedicated `/faq` page is optional — only justified if we want a long-tail content hub for the 24-question canonical list in `faq.json`.

```tsx
import { Helmet } from 'react-helmet-async';
import faqSchema from '../lib/schema/faq'; // content-writer: copy docs/schema/faq.json here

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
    {"@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://urbanehaauz.com/faq"}
  ]
};

<Helmet>
  <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
</Helmet>
```

## Router note (2026-04-21)

The site migrated from `HashRouter` to `BrowserRouter` in commits `26c1d74` and `ce4d76e`. All `item` URLs in BreadcrumbList and `url` fields in Offer/Event schemas now use clean `/path` form (no `/#/` fragment). `vercel.json` already rewrites all routes to `index.html` for SPA routing.

Per-page Helmet schema now works for:

1. Search engines that execute JS (Googlebot, Bingbot)
2. AI crawlers that execute JavaScript (ChatGPT, Claude, Perplexity)
3. Social previews (OG crawlers follow direct URLs)
4. Users who share deep links

A future prerender step (vite-plugin-ssg / vite-plugin-pages) would bake the schema into static HTML — tracked as debt in `audit-2026-04-21.md` P2 #25.

## Validation checklist

Before publishing:

- [ ] Paste each schema file into https://validator.schema.org/ — expect zero errors
- [ ] Paste hotel.json into https://search.google.com/test/rich-results — expect Hotel + Offer rich result eligibility
- [ ] Paste faq.json into rich results test — expect FAQ eligibility
- [ ] Verify telephone, address, geo, priceRange match LOCAL_SEO_BRIEF §1 byte-for-byte
- [ ] Remove every `_todo` sibling key before pasting into validators (validator will flag unknown props as warnings)

## Founder verification items (blocking before publish)

Consolidated from all 6 schema files:

- [ ] Canonical phone: is `+91 91360 32524` correct? Any secondary line?
- [ ] Street address landmark line (not just "Upper Pelling")
- [ ] Exact GPS coordinates from GBP pin
- [ ] Star rating classification from Sikkim Tourism Dept (omitted for now)
- [ ] Legal entity name for `legalName` field
- [ ] Canonical email: `urbanehaauz@gmail.com` vs `info@urbanehaauz.com`
- [ ] Reception hours — confirm 24/7
- [ ] Pets-allowed policy wording
- [ ] Per-category room prices (Standard / Super Deluxe / Premium min-max) — currently assumed Standard ₹1,200–2,400, Super Deluxe ₹1,900–3,200, Premium ₹3,100–3,900
- [ ] Rangotsav event end-time (assumed 22:00 IST) and eventStatus
- [ ] Social profile URLs for `sameAs` arrays
- [ ] Real property photos hosted on urbanehaauz.com (for `image` arrays)
- [ ] Founders' full legal names if public schema should use more than first names
