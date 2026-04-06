---
name: react-vite-seo-patterns
description: >
  Load this skill when implementing SEO changes in the Urbane Haauz React + Vite + 
  TypeScript codebase. Contains code patterns for meta tags, react-helmet-async,
  JSON-LD injection, image optimization, and performance patterns specific to 
  Vite + Vercel deployments.
---

# React + Vite SEO Implementation Patterns

## Meta Tags in Vite React

**Option A: react-helmet-async (recommended)**
```bash
npm install react-helmet-async
```

Root layout (`App.tsx` or root component):
```tsx
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      {/* rest of app */}
    </HelmetProvider>
  );
}
```

Per-page usage:
```tsx
import { Helmet } from 'react-helmet-async';

export function RoomsPage() {
  return (
    <>
      <Helmet>
        <title>Rooms & Suites | Urbane Haauz, Upper Pelling</title>
        <meta name="description" content="8 rooms with Kanchenjunga views in Upper Pelling. Standard, Deluxe, Premium rooms and DORM beds. Book direct at best rates." />
        <meta property="og:title" content="Rooms at Urbane Haauz — Kanchenjunga View, Pelling" />
        <meta property="og:image" content="https://urbanehaauz.com/images/premium-room-view.jpg" />
        <link rel="canonical" href="https://urbanehaauz.com/rooms" />
      </Helmet>
      {/* page content */}
    </>
  );
}
```

**Option B: Vite SSG with vite-plugin-ssg** (for better crawlability)
```bash
npm install vite-plugin-ssg
```
Consider this if Supabase auth allows static pre-rendering of public pages.

## JSON-LD Injection Pattern

```tsx
// components/SchemaOrg.tsx
interface SchemaOrgProps {
  schema: Record<string, unknown>;
}

export function SchemaOrg({ schema }: SchemaOrgProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Usage in a page:
import { hotelSchema } from '../lib/schema';

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Urbane Haauz | Boutique Hotel Upper Pelling, Kanchenjunga View</title>
      </Helmet>
      <SchemaOrg schema={hotelSchema} />
      {/* page content */}
    </>
  );
}
```

## Centralized Schema Library

```typescript
// lib/schema.ts

export const hotelSchema = {
  "@context": "https://schema.org",
  "@type": ["LodgingBusiness", "Hotel"],
  "name": "Urbane Haauz",
  "url": "https://urbanehaauz.com",
  // ... full schema
};

export function faqSchema(faqs: Array<{q: string, a: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
  };
}

export function breadcrumbSchema(crumbs: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}
```

## Image Optimization Patterns

```tsx
// Optimized hero image (LCP element)
<img
  src="/images/kanchenjunga-hero.webp"
  alt="Kanchenjunga mountain view from Urbane Haauz, Upper Pelling"
  width={1920}
  height={1080}
  fetchPriority="high"  // This is the LCP image
  decoding="sync"
/>

// Below-fold images
<img
  src="/images/deluxe-room.webp"
  alt="Deluxe room at Urbane Haauz boutique hotel, Pelling"
  width={800}
  height={600}
  loading="lazy"
  decoding="async"
/>
```

## SEO-Friendly URL Patterns (React Router)

```tsx
// Preferred URL structure
/ → HomePage
/rooms → RoomsPage
/rooms/standard → StandardRoomPage
/rooms/deluxe → DeluxeRoomPage
/rooms/premium → PremiumRoomPage
/rooms/dorm → DormPage
/booking → BookingPage
/about → AboutPage
/contact → ContactPage
/blog → BlogPage
/blog/:slug → BlogPostPage
```

## Preload Critical Assets in index.html

```html
<head>
  <!-- Preload hero image for LCP -->
  <link rel="preload" as="image" href="/images/kanchenjunga-hero.webp" />
  
  <!-- Preload primary font if custom -->
  <link rel="preload" as="font" type="font/woff2" href="/fonts/primary.woff2" crossorigin />
  
  <!-- DNS prefetch for external resources -->
  <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://cdn.razorpay.com" />
</head>
```

## Vercel Analytics (for tracking SEO improvements)

```bash
npm install @vercel/analytics @vercel/speed-insights
```

```tsx
// App.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      {/* app content */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```
