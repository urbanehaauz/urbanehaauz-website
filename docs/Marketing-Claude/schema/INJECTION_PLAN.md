# Schema Injection Plan — Urbane Haauz

**Agent:** @schema-architect
**Date:** 2026-04-06
**Handoff to:** @technical-seo (already wired react-helmet-async) and @content-writer

This doc describes which JSON-LD schemas should appear on which page, and how to inject them via `react-helmet-async` without duplicating the global schemas already embedded in `index.html`.

## What ships globally in `index.html` (already done)

These three schemas are embedded in `<head>` of `index.html` and therefore appear on every route:

1. `Hotel` (@id `https://urbanehaauz.com/#hotel`) — source: `docs/schema/hotel.json`
2. `LodgingBusiness` / Organization (@id `https://urbanehaauz.com/#organization`) — source: `docs/schema/organization.json`
3. `BreadcrumbList` for Home — source: `docs/schema/breadcrumb.json` → `home`

**Do NOT re-emit Hotel or Organization on a per-page Helmet** — duplicating a `@id` causes Google to pick one arbitrarily and can dilute entity consolidation. Per-page Helmet should only add *page-specific* schemas (BreadcrumbList for that page, Room schemas on `/rooms`, FAQPage on `/faq`, etc.).

## Per-page schema matrix

| Route | Page component | Schemas to inject via Helmet |
|---|---|---|
| `/` | `pages/Home.tsx` | (none — globals sufficient) |
| `/#/rooms` | `pages/Rooms.tsx` | `BreadcrumbList` (rooms) + all 4 entries from `rooms.json` as individual `HotelRoom`/`Accommodation` scripts |
| `/#/experiences` | `pages/LocalExperiences.tsx` | `BreadcrumbList` (experiences) + (future) `TouristAttraction` items |
| `/#/book` | `pages/BookingFlow.tsx` | `BreadcrumbList` (book) |
| `/#/contact` | `pages/Contact.tsx` | `BreadcrumbList` (contact) |
| `/#/faq` (when built) | `pages/FAQPage.tsx` | `BreadcrumbList` (faq) + `FAQPage` from `faq.json` |
| `/#/blog/:slug` (future) | blog post template | `BreadcrumbList` (blog_post_template) + `BlogPosting` |

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
      {"@type": "ListItem", "position": 2, "name": "Rooms & Dorms", "item": "https://urbanehaauz.com/#/rooms"}
    ]
  })}</script>
</Helmet>
```

**Important**: `react-helmet-async` requires the JSON-LD script's children to be a single string. Always wrap the object with `JSON.stringify(...)` inside `{...}`. Do not use `dangerouslySetInnerHTML`.

### `pages/Home.tsx`
No per-page schema needed. Globals in `index.html` cover it.

### `pages/Rooms.tsx`

```tsx
import { Helmet } from 'react-helmet-async';
import roomsSchema from '../docs/schema/rooms.json'; // or inline the array

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
    {"@type": "ListItem", "position": 2, "name": "Rooms & Dorms", "item": "https://urbanehaauz.com/#/rooms"}
  ]
};

// ... in JSX:
<Helmet>
  <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
  {roomsSchema.map((room, i) => (
    <script key={i} type="application/ld+json">{JSON.stringify(room)}</script>
  ))}
</Helmet>
```

Note: importing `docs/schema/rooms.json` directly from `pages/` requires either (a) copying the JSON into `src/schema/` inside the build tree, or (b) inlining the array as a TS constant. Recommend option (b) to avoid build-path fragility — content-writer can copy the array into a new `lib/schema/rooms.ts` file.

### `pages/BookingFlow.tsx`

```tsx
<Helmet>
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
      {"@type": "ListItem", "position": 2, "name": "Book", "item": "https://urbanehaauz.com/#/book"}
    ]
  })}</script>
</Helmet>
```

### `pages/Contact.tsx`

```tsx
<Helmet>
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
      {"@type": "ListItem", "position": 2, "name": "Contact", "item": "https://urbanehaauz.com/#/contact"}
    ]
  })}</script>
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
      {"@type": "ListItem", "position": 2, "name": "Experiences", "item": "https://urbanehaauz.com/#/experiences"}
    ]
  })}</script>
</Helmet>
```

### `pages/FAQPage.tsx` (to be built by content-writer)

```tsx
import { Helmet } from 'react-helmet-async';
import faqSchema from '../lib/schema/faq'; // content-writer: copy docs/schema/faq.json here

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://urbanehaauz.com/"},
    {"@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://urbanehaauz.com/#/faq"}
  ]
};

<Helmet>
  <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
</Helmet>
```

## HashRouter caveat

Because the site runs `HashRouter`, Google's crawler sees only `https://urbanehaauz.com/` (not `/#/rooms`) as a distinct URL. Until the technical-seo agent finishes the prerender / route-stub solution described in `SEO_REPORT.md §4.1`, the per-page Helmet injections described above will only benefit:

1. Social previews (OG crawlers follow hash routes)
2. Users who share direct deep links
3. AI crawlers that execute JavaScript (ChatGPT, Claude, Perplexity)

Once prerendering ships, each `/#/route` will emit its own static HTML with the per-page JSON-LD baked in. No code changes to page components will be needed.

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
- [ ] Per-category room prices (Standard / Deluxe / Premium min-max)
- [ ] Social profile URLs for `sameAs` arrays
- [ ] Real property photos hosted on urbanehaauz.com (for `image` arrays)
- [ ] Founders' full legal names if public schema should use more than first names
