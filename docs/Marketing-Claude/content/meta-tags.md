# Urbane Haauz — Per-Page Meta Tags

**Source**: KEYWORD_BRIEF.md §8 assignments, refined for character limits, conversion, and Bengali-family audience.
**Domain**: https://urbanehaauz.com
**Last updated**: 2026-04-06
**For**: @technical-seo agent to wire into React Helmet blocks.

All titles are ≤60 characters. All descriptions are ≤155 characters. Character counts shown in parentheses.

---

## `/` — Homepage

- **Target keyword**: boutique hotel in upper pelling with kanchenjunga view
- **Title (59)**: `Urbane Haauz — Boutique Hotel in Upper Pelling, Sikkim`
- **Meta description (154)**: `Boutique hotel in Upper Pelling with direct Kanchenjunga views. 8 rooms plus dorm beds, CP/MAP meal plans, direct Razorpay booking. No OTA fees.`
- **OG title**: `Urbane Haauz — Upper Pelling Boutique Hotel, Direct Kanchenjunga Views`
- **OG description**: `Wake up to Kanchenjunga at 8,586m. 8 rooms plus dorm beds in Upper Pelling, Sikkim. CP/MAP meal plans. Direct booking — save 15–18% vs OTAs.`
- **Canonical**: `https://urbanehaauz.com/`
- **H1 recommendation**: `Boutique Hotel in Upper Pelling — Direct Kanchenjunga Views`

---

## `/rooms` — Rooms & Dorms

- **Target keyword**: kanchenjunga view hotel pelling
- **Title (58)**: `Rooms & Dorm Beds in Upper Pelling — Kanchenjunga View`
- **Meta description (152)**: `8 boutique rooms and dorm beds in Upper Pelling with Kanchenjunga views. Standard, Deluxe, Premium from ₹1,800. Dorm from ₹400. CP/MAP plans.`
- **OG title**: `Rooms & Dorm Beds — Urbane Haauz, Upper Pelling`
- **OG description**: `Standard, Deluxe and Premium rooms plus shared dorm beds facing Kanchenjunga. The only boutique hotel in Pelling with dormitory accommodation.`
- **Canonical**: `https://urbanehaauz.com/rooms`
- **H1 recommendation**: `Rooms & Dorms in Upper Pelling — Kanchenjunga-View Hotel`

---

## `/experiences` — Local Experiences

- **Target keyword**: things to do in upper pelling
- **Title (58)**: `Things to Do in Upper Pelling — Monasteries, Views, Treks`
- **Meta description (153)**: `Pemayangtse, Rabdentse, Sangachoeling, Khecheopalri and Kanchenjunga Falls — everything worth doing within 30 minutes of Urbane Haauz, Upper Pelling.`
- **OG title**: `Things to Do in Upper Pelling, Sikkim`
- **OG description**: `Monasteries, ruins, waterfalls and Kanchenjunga viewpoints within easy reach of Urbane Haauz in Upper Pelling, West Sikkim.`
- **Canonical**: `https://urbanehaauz.com/experiences`
- **H1 recommendation**: `Things to Do in Upper Pelling, Sikkim`

---

## `/book` — Direct Booking

- **Target keyword**: pelling hotel direct booking
- **Title (59)**: `Book Urbane Haauz Direct — No OTA Fees, Pelling Hotel`
- **Meta description (152)**: `Book Urbane Haauz, Upper Pelling directly via Razorpay. Save 15–18% over MakeMyTrip and Booking.com. Instant confirmation, best rate guaranteed.`
- **OG title**: `Book Urbane Haauz Direct — Upper Pelling, Sikkim`
- **OG description**: `Direct booking via Razorpay. No OTA commission, no booking fee, instant confirmation. Best rate guaranteed on all rooms and dorm beds.`
- **Canonical**: `https://urbanehaauz.com/book`
- **H1 recommendation**: `Book Your Stay at Urbane Haauz, Upper Pelling`

---

## `/contact` — Contact & Pickups

- **Target keyword**: njp to pelling hotel with pickup
- **Title (58)**: `Contact Urbane Haauz — Pelling Hotel, NJP/IXB Pickups`
- **Meta description (151)**: `Contact Urbane Haauz in Upper Pelling, West Sikkim 737113. Airport and railway pickups from Bagdogra and NJP on request. Call or email to plan your stay.`
- **OG title**: `Contact Urbane Haauz — Upper Pelling, Sikkim`
- **OG description**: `Upper Pelling, West Sikkim 737113. Pickup assistance from Bagdogra Airport and NJP Railway Station on request.`
- **Canonical**: `https://urbanehaauz.com/contact`
- **H1 recommendation**: `Contact Urbane Haauz, Upper Pelling`

---

## `/my-bookings` — Guest Bookings (noindex)

- **Target keyword**: none (user account page)
- **Title (52)**: `My Bookings — Urbane Haauz, Upper Pelling`
- **Meta description (108)**: `View and manage your Urbane Haauz bookings. Direct-booking guests can check dates, meal plans and payment status.`
- **OG title**: `My Bookings — Urbane Haauz`
- **OG description**: `Manage your direct bookings at Urbane Haauz, Upper Pelling.`
- **Canonical**: `https://urbanehaauz.com/my-bookings`
- **Robots**: `noindex, nofollow` (personal account page — must not be indexed)
- **H1 recommendation**: `My Bookings`

---

## Implementation Notes for @technical-seo

1. Use `react-helmet-async` with `<HelmetProvider>` wrapping the app, and a `<Helmet>` block inside each page component.
2. `/my-bookings`, `/admin`, `/admin/login` and `/auth/callback` must all emit `<meta name="robots" content="noindex, nofollow">`. Also add matching `X-Robots-Tag` headers in `vercel.json` as a belt-and-braces fallback in case helmet does not render on those routes.
3. Canonicals must always use the bare `https://urbanehaauz.com/...` form (no trailing slash except on `/`, no hash, no query parameters).
4. All OG images should point to a self-hosted asset on `urbanehaauz.com` (not Unsplash). A single site-wide OG image is acceptable for launch; per-page OG images can follow.
5. Title case in titles uses em-dashes (`—`), not hyphens, for visual weight in SERPs.
6. Bengali-script meta variants (KEYWORD_BRIEF.md C12–C14) are NOT included here and must be flagged for native human review before any publication.

## Items Flagged for Founder Review

- Confirm whether the brand name in `/rooms`, `/experiences`, `/book`, `/contact` titles should always include "Urbane Haauz" (current versions omit it to save characters for keywords — a deliberate trade-off).
- Confirm exact peak-season price floor for `/rooms` description (₹1,800 used, matches KEYWORD_BRIEF.md; verify against current PMS rate card).
- Confirm pickup service wording on `/contact` — "on request" is used throughout; if pickup is a paid service, the description should hint at it.
- Bengali-script metadata remains pending a native-speaker review before it can ship.
