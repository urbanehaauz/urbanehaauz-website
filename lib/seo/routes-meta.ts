/**
 * Centralized per-route SEO metadata.
 *
 * This file is the single source of truth for the prerender script
 * (`scripts/prerender.mjs`) which generates static HTML for non-JS-executing
 * crawlers (SEOptimer, Screaming Frog free, GPTBot, ClaudeBot, PerplexityBot).
 *
 * The runtime React/Helmet metadata in each page's component takes precedence
 * for users — these definitions only ship to crawlers that read raw HTML.
 *
 * If you change a page's Helmet `<title>` or `<meta description>`, update the
 * matching entry below so the prerendered shell agrees with the live page.
 */

export interface RouteMeta {
  /** URL path, e.g. "/rooms" or "/" */
  path: string;
  /** <title> contents */
  title: string;
  /** <meta name="description"> */
  description: string;
  /** OG image URL (absolute) */
  ogImage: string;
  /** og:type (default "website") */
  ogType?: string;
  /** Canonical URL (absolute) */
  canonical: string;
  /** H1 text shown in the noscript SEO block */
  h1: string;
  /** Above-the-fold lede paragraph(s) for the noscript block */
  lede: string[];
  /**
   * Optional bullet-list of key facts. Useful for crawler comprehension and
   * also for AI engines extracting "quick answer" snippets.
   */
  keyFacts?: string[];
}

const SITE = 'https://urbanehaauz.com';

export const ROUTES_META: RouteMeta[] = [
  {
    path: '/',
    title: 'Urbane Haauz | Boutique Hotel in Upper Pelling with Kanchenjunga Views',
    description:
      'Boutique hotel in Upper Pelling, Sikkim with direct Kanchenjunga views. CP/MAP meal plans, dormitory beds, direct Razorpay booking — best rate guaranteed.',
    ogImage: `${SITE}/og-image.jpg`,
    canonical: SITE,
    h1: 'Urbane Haauz — Boutique Hotel in Upper Pelling, Sikkim with Kanchenjunga Views',
    lede: [
      "Urbane Haauz is an 8-room boutique hotel and dormitory in Upper Pelling, Sikkim. We're on the Skywalk-side ridge with direct Kanchenjunga views from Premium and Super Deluxe balconies, plus a shared rooftop deck for Standard and dorm guests.",
      "We're the only property in Upper Pelling offering both private rooms and dormitory beds on the same ridge. Direct booking with instant confirmation, best-rate guarantee, CP and MAP meal plans, and Bengali / Hindi / English / Nepali speaking staff.",
    ],
    keyFacts: [
      '8 rooms (Premium, Super Deluxe, Standard) plus shared dormitory',
      'Direct Kanchenjunga view from front-facing balconies',
      'CP (breakfast) and MAP (breakfast + dinner) meal plans',
      '24/7 inverter backup and solar-assisted hot water',
      '10-minute walk to Pelling Skywalk',
      'Bengali, Hindi, English and Nepali spoken',
    ],
  },
  {
    path: '/rooms',
    title: 'Rooms & Dorms in Pelling | Urbane Haauz Boutique Hotel',
    description:
      'Premium, Super Deluxe and Standard rooms plus dormitory beds at Urbane Haauz, Upper Pelling. Direct Kanchenjunga views, CP/MAP meals, instant booking confirmation.',
    ogImage: `${SITE}/og-image.jpg`,
    canonical: `${SITE}/rooms`,
    h1: 'Rooms & Dorms in Pelling, Sikkim — Kanchenjunga View Stays at Urbane Haauz',
    lede: [
      'Three accommodation categories at Urbane Haauz: Premium rooms with a private north-west-facing balcony directly overlooking Kanchenjunga, Super Deluxe rooms with the same balcony angle, and Standard rooms which share a rooftop viewing deck. Dormitory beds share the same rooftop access — the view itself is identical to what Premium guests see.',
      'All rooms include 24/7 inverter backup, solar-assisted hot water, free WiFi, and access to in-house Bengali, North Indian and Sikkimese cuisine. Best-rate direct booking with instant Razorpay confirmation.',
    ],
    keyFacts: [
      'Premium Room — direct Kanchenjunga view from private balcony',
      'Super Deluxe Room — direct Kanchenjunga view from private balcony',
      'Standard Room — view from shared rooftop viewing deck',
      'Dormitory Bed — shared rooftop access, lockers, shared hot-water bathrooms',
      'CP/MAP meal plans available at booking',
    ],
  },
  {
    path: '/experiences',
    title: 'Local Experiences in Pelling | Urbane Haauz',
    description:
      'Curated local experiences from Urbane Haauz: Pelling Skywalk, Pemayangtse Monastery, Khecheopalri Lake, Rabdentse Ruins, Sikkimese cooking, monastery walks.',
    ogImage: `${SITE}/og-image.jpg`,
    canonical: `${SITE}/experiences`,
    h1: 'Local Experiences in Pelling, Sikkim',
    lede: [
      "Things to do in Pelling, curated by people who actually live in Upper Pelling. From the Skywalk and Chenrezig Statue (10-minute walk from us) to Pemayangtse Monastery, Rabdentse Ruins, Khecheopalri Lake and Kanchenjunga Falls — we'll tell you what's worth your morning, what to skip, and which places are empty before 8 AM.",
    ],
  },
  {
    path: '/book',
    title: 'Book Your Stay | Urbane Haauz Pelling — Direct Booking',
    description:
      'Book directly with Urbane Haauz in Upper Pelling, Sikkim. Secure Razorpay payment, instant confirmation, best-rate guarantee.',
    ogImage: `${SITE}/og-image.jpg`,
    canonical: `${SITE}/book`,
    h1: 'Book Your Stay at Urbane Haauz — Boutique Hotel in Upper Pelling, Sikkim',
    lede: [
      'Direct booking at Urbane Haauz with instant Razorpay confirmation, best-rate guarantee (no OTA commission), and flexible cancellation policy. Choose your dates, room category (Premium / Super Deluxe / Standard / Dorm Bed), and meal plan (Room only, CP, or MAP).',
      "For multi-room family bookings, group reservations, or if you need to discuss specific room categories, WhatsApp us at +91 9136032524 — we answer within the hour during business hours.",
    ],
  },
  {
    path: '/contact',
    title: 'Contact Urbane Haauz | Boutique Hotel in Upper Pelling, Sikkim',
    description:
      'Contact Urbane Haauz in Upper Pelling: +91 9136032524, info@urbanehaauz.com. SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113.',
    ogImage: `${SITE}/og-image.jpg`,
    canonical: `${SITE}/contact`,
    h1: 'Contact Urbane Haauz — Pelling, Sikkim',
    lede: [
      'WhatsApp or call +91 9136032524, email info@urbanehaauz.com, or use our contact form. WhatsApp is the fastest channel — we usually answer within an hour during business hours (9:00 AM to 9:00 PM IST).',
      'Address: SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113, India. Staff and founders speak English, Hindi, Bengali and Nepali.',
    ],
  },
  {
    path: '/blog',
    title: 'Pelling & Sikkim Travel Guides | Urbane Haauz',
    description:
      'Honest, locally-written guides to Pelling and Sikkim — Kanchenjunga views, Upper Pelling neighbourhoods, when to visit, how to reach, things to do, 2-day itineraries.',
    ogImage: `${SITE}/og-image.jpg`,
    canonical: `${SITE}/blog`,
    h1: 'Pelling & Sikkim Travel Guides',
    lede: [
      'Locally-written guides covering Kanchenjunga views, where to stay in Upper Pelling, how to reach Pelling, things to do, the best time to visit, and a tested 2-day itinerary. Written by the Urbane Haauz team in Upper Pelling.',
    ],
  },
  {
    path: '/rangotsav',
    title: 'Rangotsav · The Tale Of Two States | Urbane Haauz',
    description:
      'Rangotsav — a Bengal-Sikkim cultural celebration bringing artists, music, and cuisine together in Pelling, West Sikkim. 25–26 May 2026, hosted by Urbane Haauz.',
    ogImage: `${SITE}/rangotsav-ganesh.jpeg`,
    ogType: 'event',
    canonical: `${SITE}/rangotsav`,
    h1: 'Rangotsav · The Tale Of Two States',
    lede: [
      "Rangotsav 2026 — a two-day Bengal-Sikkim cultural conglomerate at Urbane Haauz, Upper Pelling, on 25–26 May 2026. Art, music, folk performances, cuisine. Festival Pass at ₹100, capacity 300.",
    ],
  },
  {
    path: '/pelling-2.0',
    title: "Pelling 2.0 · Pelling's evenings, reimagined. | Urbane Haauz",
    description:
      "Pelling 2.0 — A policy brief from Urbane Haauz proposing a Pelling Cultural Center with nightly performances, artisan markets, and a PPP model for Sikkim's next cultural capital.",
    ogImage: `${SITE}/og-image.jpg`,
    ogType: 'article',
    canonical: `${SITE}/pelling-2.0`,
    h1: "Pelling 2.0 — Pelling's Evenings, Reimagined",
    lede: [
      'A structured vision for nightly cultural programming, tourist-attraction events, and a sustained evening economy in West Sikkim. Authored by the Urbane Haauz founders.',
    ],
  },
];
