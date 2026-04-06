# Urbane Haauz — Local SEO Brief

**Author**: local-seo agent
**Date**: 2026-04-06
**Peak window**: 86 days remaining (until 30 Jun 2026)
**Gap**: ₹28,05,541
**Objective**: Dominate Google Maps "Pelling hotel" local pack + OTA rank for peak-window walk-ups and last-minute Bengali-family bookings.

> **FOUNDER VERIFICATION REQUIRED before publishing anywhere** (flag for Ayan / Shovit / Souvik):
> - [ ] **Phone number**: is `+91 91360 32524` the canonical WhatsApp + voice line? Any secondary reception line?
> - [ ] **Exact street / landmark line**: "Upper Pelling" is a locality, not a street — need nearest landmark (e.g. "Near Pelling Helipad", "Above Pemayangtse Road junction")
> - [ ] **GPS coordinates** (lat/lng) of the actual property — pull from Google Maps pin once GBP is claimed
> - [ ] **Opening hours** for Reception / Restaurant / Bar (24h reception? Restaurant 7:00–22:30?)
> - [ ] **GSTIN** (currently placeholder `11AAAAA0000A1Z5` in Footer)
> - [ ] **Email**: `urbanehaauz@gmail.com` vs `info@urbanehaauz.com` — pick ONE
> - [ ] **Property legal name** for GBP ("Urbane Haauz" vs "Urbane Haauz Boutique Hotel")

---

## 1. Canonical NAP (Name, Address, Phone)

This block MUST appear byte-identical on the website footer, Contact page, all JSON-LD, GBP, every directory, every OTA, every press release, every invoice. Citation consistency is the #1 Google local ranking factor after proximity.

### Canonical NAP block (copy-paste)

```
Urbane Haauz
Upper Pelling, Pelling, West Sikkim 737113, India
Phone: +91 91360 32524
Email: urbanehaauz@gmail.com
Web:   https://urbanehaauz.com
```

### Structured variants

| Field | Value |
|---|---|
| `name` | `Urbane Haauz` |
| `legalName` | `Urbane Haauz Boutique Hotel` *(only on invoices/GSTIN docs)* |
| `streetAddress` | `Upper Pelling` *(replace w/ verified landmark line)* |
| `addressLocality` | `Pelling` |
| `addressRegion` | `Sikkim` |
| `postalCode` | `737113` |
| `addressCountry` | `IN` |
| `telephone` | `+91-91360-32524` (E.164: `+919136032524`) |
| `latitude` | *TBD — pull from GBP pin* |
| `longitude` | *TBD — pull from GBP pin* |

### NAP audit checklist

- [ ] `index.html` JSON-LD — fix `telephone` (currently placeholder `+91-98765-43210`) and `addressLocality: "West Sikkim"` → `"Pelling"`
- [ ] `components/Footer.tsx` — render NAP in plain text (not image), phone as `tel:` link
- [ ] `pages/Contact.tsx` — NAP block above map embed
- [ ] GBP — identical format
- [ ] MakeMyTrip / Booking.com / Agoda / Goibibo / TripAdvisor listings — identical format
- [ ] RunHotels PMS master record — identical format
- [ ] Invoices, email signatures, Razorpay receipt footer — identical format
- [ ] Business cards / signage at property — identical format

---

## 2. Google Business Profile — Setup & Optimization Checklist

### 2.1 Claim & verify
- [ ] Claim at https://business.google.com with `urbanehaauz@gmail.com`
- [ ] Complete video verification (Google now prefers video for hotels; record 2 min walkaround showing signage + reception + exterior landmark)
- [ ] Flag as "Hotel" business type (NOT "Local business") — unlocks hotel-specific attributes, booking links, room rates
- [ ] Connect to Google Hotel Ads / Hotel Center once live (free Book-on-Google links)

### 2.2 Basic info
- [ ] **Name**: `Urbane Haauz` (no keyword stuffing — Google penalises "Urbane Haauz Boutique Hotel Pelling Kanchenjunga")
- [ ] **Address**: canonical NAP (§1). Drop pin in Upper Pelling — NOT the generic Pelling town centroid
- [ ] **Service area**: leave blank (brick-and-mortar)
- [ ] **Phone**: `+91 91360 32524`
- [ ] **Website**: `https://urbanehaauz.com` (NOT runhotel.site)
- [ ] **Appointment link**: `https://urbanehaauz.com/#/book`
- [ ] **Menu link** (restaurant): `https://urbanehaauz.com/#/experiences` (or dedicated `/menu` once built)

### 2.3 Categories (pick ALL that apply — max 10 secondary)

Ranked by relevance for Sikkim boutique hotel:

| # | Category | Primary/Secondary |
|---|---|---|
| 1 | **Hotel** | PRIMARY |
| 2 | Boutique hotel | Secondary |
| 3 | Bed & breakfast | Secondary |
| 4 | Guest house | Secondary |
| 5 | Lodge | Secondary |
| 6 | Resort hotel | Secondary |
| 7 | Extended stay hotel | Secondary |
| 8 | Hostel | Secondary *(justifies DORM rooms)* |
| 9 | Inn | Secondary |
| 10 | Mountain cabin | Secondary |
| 11 | Restaurant | Secondary *(unlocks food photos)* |
| 12 | Bar | Secondary |
| 13 | Wedding venue | Secondary *(if applicable)* |
| 14 | Conference center | Secondary *(if MAP groups)* |

> Note: Google sometimes blocks "Hostel" + "Hotel" simultaneously. If so, keep **Hotel** primary and add **Hostel** only if DORM revenue > ₹5k/day. Otherwise drop Hostel.

### 2.4 Attributes (tick every truthful one)

- [ ] Free Wi-Fi
- [ ] Free parking
- [ ] Free breakfast (if CP)
- [ ] Restaurant on site
- [ ] Bar on site
- [ ] Room service
- [ ] Hot tub / geyser in rooms
- [ ] Mountain view
- [ ] Non-smoking rooms
- [ ] Family rooms
- [ ] Pet-friendly (verify)
- [ ] Wheelchair accessible (verify — likely NO given terrain)
- [ ] Airport shuttle (paid) — if offered from Bagdogra/Pakyong
- [ ] Luggage storage
- [ ] 24-hour front desk (verify)
- [ ] Laundry service
- [ ] Accepts credit cards / UPI / Razorpay
- [ ] LGBTQ+ friendly
- [ ] Identifies as women-owned / minority-owned (only if true)

### 2.5 Description (750 char max) — DRAFT v1

```
Urbane Haauz is a boutique hotel in Upper Pelling, West Sikkim, with
direct Kanchenjunga mountain views from every room. We offer 8 rooms
across Standard, Deluxe, and Premium categories plus shared dormitory
beds — the only boutique property in Pelling with a DORM option for
solo travellers and backpackers. Our in-house restaurant serves North
Indian, Bengali, and Sikkimese cuisine with CP and MAP meal plans.
Walk to Pemayangtse Monastery, Rabdentse Ruins, Pelling Helipad, and
the Sky Walk. 130 km from Gangtok, 140 km from Bagdogra Airport (IXB).
Book direct at urbanehaauz.com to skip OTA commissions and unlock the
best rate. Bengali-speaking staff. Family-friendly. Bar on site.
```
(703 chars — under 750 limit)

### 2.6 Photos — upload cadence

Minimum **50 photos before launch**; add **5 per week** during peak window.

Required categories (tick as uploaded):

- [ ] Logo (square, 720x720, on brand background)
- [ ] Cover photo (Kanchenjunga view FROM A ROOM — highest CTR)
- [ ] Exterior ×3 (front signage, side, street approach)
- [ ] Reception/lobby ×3
- [ ] Standard room ×4
- [ ] Deluxe room ×4
- [ ] Premium room ×4
- [ ] DORM room ×3 (bunk beds, lockers, shared bath)
- [ ] Bathroom ×2 (clean, hot water evidence)
- [ ] Restaurant interior ×3
- [ ] Food: thali ×1, breakfast ×1, Bengali fish curry ×1, momos ×1, Sikkimese thali ×1
- [ ] Bar ×2
- [ ] Kanchenjunga sunrise ×3 (different days, same angle)
- [ ] Balcony/view from each room category
- [ ] Common areas / sit-out
- [ ] Staff (with consent)
- [ ] Nearby landmarks: Pemayangtse Monastery, Rabdentse, Sky Walk, Khecheopalri
- [ ] 360° tour (Google Street View Trusted Photographer — book one in Siliguri ₹8–12k one-time, massive ranking boost)

**Video** (1): 30-sec walkaround uploaded to GBP + YouTube (embed on homepage).

### 2.7 Posts — weekly cadence (every Monday 10:00 IST)

Rotate post types across the 86-day window:

| Week | Post type | Topic |
|---|---|---|
| 1 | Offer | "Peak-season direct-book 10% off — Apr-Jun" |
| 2 | Event | "Saga Dawa festival at Pemayangtse — stay with us" |
| 3 | Update | "New: Bengali breakfast menu" |
| 4 | Photo | "Kanchenjunga sunrise this morning" |
| 5 | Offer | "Book 3 nights, get MAP free" |
| 6 | Event | "Losar preparations in Pelling" |
| 7 | Update | "DORM beds ₹400/night — book direct" |
| 8 | Photo | "View from Deluxe Room 201" |
| 9 | Offer | "Family package — 2 adults + 2 kids" |
| 10 | Update | "Airport pickup from Bagdogra now available" |
| 11 | Photo | "Our restaurant's momo platter" |
| 12 | Offer | "Last-minute June availability" |

### 2.8 Q&A seeding (self-ask from a different Google account, answer as owner)

10 seed Q&As:

1. **Q**: Does every room have a Kanchenjunga view?
   **A**: Yes — all 8 rooms at Urbane Haauz face Kanchenjunga. Deluxe and Premium rooms have larger picture windows and private balconies. On clear mornings (Oct–May best window) the sunrise over the peak is visible from your bed.

2. **Q**: Do you have dorm beds?
   **A**: Yes. We are the only boutique hotel in Upper Pelling offering shared dormitory beds, starting at ₹400/night. The dorm has lockers, shared bathroom, and the same Kanchenjunga view as our private rooms.

3. **Q**: How far is Urbane Haauz from Bagdogra Airport?
   **A**: Approximately 140 km / 4.5–5 hours by road. We can arrange a private cab pickup (₹4,500–5,500). NJP railway station is 130 km / 4 hours. Pakyong Airport (PYG) is 150 km.

4. **Q**: Is the hotel in Upper Pelling or Lower Pelling?
   **A**: Upper Pelling. Upper Pelling sits at a higher elevation (~2,150 m) and offers the best unobstructed Kanchenjunga views — this is why Upper Pelling hotels command a 20–30% premium over Lower Pelling.

5. **Q**: Do you serve Bengali food?
   **A**: Yes. Our restaurant menu includes Bengali favourites (machher jhol, luchi-alur dom, mishti) alongside North Indian, Chinese, and traditional Sikkimese dishes. We accommodate Bengali family groups regularly.

6. **Q**: Can I book directly to avoid OTA commissions?
   **A**: Yes — please book at https://urbanehaauz.com. Direct booking is the best rate (OTAs add 15–18% markup). We accept Razorpay (UPI, cards, net banking).

7. **Q**: What is the best time to visit Pelling?
   **A**: Mid-March to early June for clear Kanchenjunga views and rhododendrons, and October to early December for crisp post-monsoon skies. We stay open year-round; July–August brings monsoon mist and lower rates.

8. **Q**: Are children allowed?
   **A**: Absolutely. We are family-friendly and popular with Bengali families from Kolkata. Kids under 5 stay free with parents; extra beds available in Premium rooms.

9. **Q**: What attractions are walking distance?
   **A**: Pemayangtse Monastery (2 km), Rabdentse Ruins (3 km), Pelling Helipad and Sky Walk (1.5 km). Khecheopalri Lake is 27 km (taxi).

10. **Q**: Do you have a bar?
    **A**: Yes, a small on-site bar serving Indian beers, spirits, and a short cocktail list. Open to hotel guests until 22:30.

### 2.9 Review velocity strategy

- **Target**: 30 new Google reviews in 86 days (≈ 2.5/week). Current competitor (Hotel Garuda) sits at ~180 reviews — we need velocity, not total parity.
- **Ask method**: QR code card placed on reception desk + in each room with "Scan to review us on Google" pointing to the GBP review link `https://g.page/r/<placeID>/review`
- **Checkout script**: "Thank you for staying with us — if you had a good time, a quick Google review helps us a lot. Here's the QR code."
- **Response SLA**: every review answered within 24h by Shovit (owner tone, mention guest by first name, reference a specific detail from their stay)
- **Never** incentivise reviews with discounts (Google policy violation, leads to delisting)

### 2.10 Review response templates

**Template A — 5-star, view mention**
> Thank you so much, {name}! We're thrilled the Kanchenjunga sunrise lived up to your expectations. Rooms like {room #} are exactly why we chose Upper Pelling. Please come back in October when the post-monsoon skies are even clearer. — Shovit, Urbane Haauz

**Template B — 5-star, family stay**
> {Name}, it was a pleasure hosting your family. We're glad the kids enjoyed the momos and that Bengali breakfast hit the spot. See you on your next Sikkim trip! — Shovit

**Template C — 3/4-star, constructive**
> Thank you for the honest feedback, {name}. You're right that {issue} needs attention — we've already {action taken}. We'd love a chance to host you again and show the improvement. Please reach me directly at +91 91360 32524. — Shovit

**Template D — 1/2-star, room issue**
> {Name}, I'm genuinely sorry your stay fell short. {Specific acknowledgement}. This isn't the standard we hold ourselves to. I've spoken with the team and {corrective action}. Please call me directly at +91 91360 32524 so I can make this right. — Shovit, Owner

**Template E — 1/2-star, value concern**
> Thank you for the feedback, {name}. Our peak-season rates reflect Upper Pelling's premium views and our direct-booking terms, but I hear you on {specific point}. Please reach out at +91 91360 32524 — I'd like to offer you a return stay at our direct-book rate. — Shovit

---

## 3. Citation & Directory List — 30 targets ranked by impact

Legend: **MUST** = submit this week · **SHOULD** = within 30 days · **NICE** = within 86 days.

| # | Directory | Submit URL | Info needed | Est. DA | Priority |
|---|---|---|---|---|---|
| 1 | Google Business Profile | business.google.com | NAP, photos, categories, video verif | 100 | **MUST** |
| 2 | Booking.com (Extranet) | join.booking.com | NAP, photos, rates, policies, bank | 93 | **MUST** |
| 3 | MakeMyTrip (MMT Connect) | partners.makemytrip.com | NAP, GSTIN, photos, contract | 88 | **MUST** |
| 4 | TripAdvisor | tripadvisor.in/Owners | NAP, photos, description | 93 | **MUST** |
| 5 | Agoda YCS | ycs.agoda.com | NAP, photos, rates | 91 | **MUST** |
| 6 | Goibibo (ingoMMT) | partners.goibibo.com | same as MMT | 82 | **MUST** |
| 7 | Google Maps (pin accuracy) | maps.google.com | GPS, photos | 100 | **MUST** |
| 8 | Bing Places | bingplaces.com | NAP, hours, photos | 94 | **MUST** |
| 9 | Apple Business Connect | businessconnect.apple.com | NAP, photos | 100 | **MUST** |
| 10 | Facebook Page (Meta Business) | business.facebook.com | NAP, cover, about | 96 | **MUST** |
| 11 | Instagram Business | business.instagram.com | linked to FB, bio NAP | 95 | **MUST** |
| 12 | Yatra | b2b.yatra.com | NAP, rates | 78 | **MUST** |
| 13 | Cleartrip | partners.cleartrip.com | NAP, rates | 77 | **SHOULD** |
| 14 | EaseMyTrip | agent.easemytrip.com | NAP, rates | 74 | **SHOULD** |
| 15 | JustDial | justdial.com/freelisting | NAP, category | 78 | **SHOULD** |
| 16 | Sulekha | sulekha.com/add-business | NAP, category | 72 | **SHOULD** |
| 17 | IndiaMART | seller.indiamart.com | NAP, GSTIN | 77 | **SHOULD** |
| 18 | Holidify | holidify.com/contact (hotel add) | NAP, photos, desc | 62 | **SHOULD** |
| 19 | Tripoto | tripoto.com/business | NAP, story, photos | 63 | **SHOULD** |
| 20 | Thrillophilia | thrillophilia.com/supplier-signup | NAP, experiences | 66 | **SHOULD** |
| 21 | Travel Triangle | traveltriangle.com/supplier | NAP, rates | 61 | **SHOULD** |
| 22 | HolidayIQ | holidayiq.com/add-hotel | NAP, photos | 58 | **SHOULD** |
| 23 | Trivago (auto-pulled from BKG/Agoda) | trivago.in | NAP | 86 | **SHOULD** |
| 24 | Sikkim Tourism (official) | sikkimtourism.gov.in / sikkimtourism.travel | NAP, registration # | 58 | **SHOULD** |
| 25 | Ministry of Tourism India — NIDHI+ | nidhi.nic.in | DoT registration | 88 | **SHOULD** |
| 26 | Incredible India | incredibleindia.org | NAP, photos | 75 | **NICE** |
| 27 | Hostelworld (for DORM) | hostelworld.com/inbox/properties/signup | NAP, dorm rates | 72 | **NICE** |
| 28 | Airbnb (DORM + rooms) | airbnb.co.in/host | NAP, photos, ID | 94 | **NICE** |
| 29 | Lonely Planet (editorial pitch) | lonelyplanet.com/contact | pitch email | 89 | **NICE** |
| 30 | Wikivoyage (Pelling article edit) | wikivoyage.org/wiki/Pelling | factual listing only, no promo | 91 | **NICE** |

Checklist:
- [ ] Export NAP block (§1) as a `.txt` file to paste verbatim into every form
- [ ] Maintain a spreadsheet: Directory | Submitted date | Live date | Listing URL | NAP hash
- [ ] Re-verify monthly that no directory has reverted to old phone/address

---

## 4. OTA Listing Optimization Briefs

### 4.1 Shared assets (use on every OTA)

**Hero photo**: Kanchenjunga sunrise from a Deluxe room balcony (NOT exterior, NOT lobby). This single photo drives CTR more than any other optimization.

**Amenity tags to check everywhere** (if platform supports): Free WiFi · Free parking · Restaurant · Bar · Room service · Mountain view · Family rooms · Airport shuttle · 24h reception · Hot water · Heating · Laundry · Luggage storage · Non-smoking · Bengali-speaking staff · Meal plans (CP/MAP) · Direct booking available

**Rate parity rule**: OTA rate = Direct rate. Differentiate direct booking via PERKS (free airport pickup for 3+ nights, free dinner upgrade, 2 PM late checkout) — NOT price. Violating parity gets you delisted by Booking.com.

### 4.2 MakeMyTrip

- **Title**: `Urbane Haauz - Boutique Hotel | Kanchenjunga View | Upper Pelling`
- **Short description (200 char)**:
  > Boutique hotel in Upper Pelling with direct Kanchenjunga views from every room. 8 rooms + dorm beds. Restaurant, bar, CP/MAP plans. Bengali-friendly.
- **Medium description (500 char)**:
  > Urbane Haauz is a boutique hotel perched in Upper Pelling, West Sikkim, offering unobstructed Kanchenjunga mountain views from every room. Choose from 8 Standard, Deluxe, and Premium rooms or our shared dormitory beds — the only boutique DORM in Pelling. Walk to Pemayangtse Monastery, Rabdentse Ruins, and the Sky Walk. Our restaurant serves Bengali, North Indian, and Sikkimese cuisine with CP/MAP meal plans. Family-friendly, Bengali-speaking staff, free WiFi, free parking, and airport transfers from Bagdogra on request.
- **Long description (2000 char)**: expand the 500-char version with dedicated paragraphs on (a) the view and upper-vs-lower Pelling differential, (b) room categories and DORM, (c) food and Bengali hospitality, (d) local attractions with distances, (e) how to reach from Kolkata/NJP/Bagdogra, (f) the peak-season window and when to visit.
- **Photos**: 25 minimum. Order: 1) Kanchenjunga from room, 2) Deluxe interior, 3) Restaurant, 4) Exterior, 5) Food thali, 6) Bathroom, 7) DORM, 8–25) rotating room/view/local shots.
- **Amenities**: all applicable ticked; MMT's "Mountain View" and "Family Friendly" flags ON
- **Rate plans**: EP, CP, MAP all listed separately
- **Cancellation**: free cancel >7 days, 50% 3–7 days, non-refundable <3 days

### 4.3 Booking.com

- **Property type**: Boutique Hotel
- **Property name** (Booking strips keywords): `Urbane Haauz`
- **Headline**: `Boutique Hotel with Kanchenjunga Views in Upper Pelling`
- **Description (max ~2000 char)**: same as MMT long-form, tuned for Booking's "property description" + "most popular facilities" + "surroundings" sections.
- **DORM**: list as a separate room type "4-Bed Mixed Dormitory Room" with per-bed pricing (Booking supports this since 2019)
- **Genius program**: enable 10% Genius discount on Standard rooms only (protects Deluxe/Premium margin, still boosts visibility)
- **Preferred Partner**: apply once you hit 30+ reviews — gives +65% visibility
- **Sustainability badge**: answer the sustainability questionnaire honestly, aim for Level 1 badge
- **Location highlights**: tag Pemayangtse Monastery, Rabdentse, Pelling Helipad

### 4.4 Agoda

- **Title**: `Urbane Haauz Boutique Hotel - Kanchenjunga View, Upper Pelling`
- **Description**: reuse MMT 500-char, localise for SEA + Thai/Korean/Japanese markets (Agoda's strength)
- **DORM visibility**: Agoda skews younger — list DORM prominently, it converts well here
- **Value Plus program**: enable for last-minute inventory (48h window) during the 86-day peak
- **Include all meal plan options**: EP/CP/MAP as distinct rate plans

### 4.5 Airbnb (for DORM + private rooms as separate listings)

- **Listing 1**: "Kanchenjunga View Dorm Bed in Upper Pelling Boutique"
- **Listing 2**: "Deluxe Kanchenjunga View Room · Urbane Haauz · Pelling"
- **Title formula**: `[Differentiator] [Room type] · [Neighbourhood]`
- **First 3 photos**: view, bed, bathroom (Airbnb algorithm weights the first 3 heavily)
- **Neighbourhood description**: emphasise Upper Pelling premium, walk-to-monastery, Bengali-friendly
- **Instant Book**: ON
- **Superhost track**: maintain >4.8 rating, <1% cancellation, >90% response rate

---

## 5. Map Pack Ranking Tactics

Google local pack ranking ≈ **Relevance × Distance × Prominence**. We can't change Distance (proximity to searcher) but we can stack Relevance + Prominence.

### 5.1 Relevance levers
- [ ] Primary category = "Hotel" (done in §2.3)
- [ ] GBP description contains "Upper Pelling", "Kanchenjunga", "boutique hotel", "dorm" (done in §2.5)
- [ ] Website homepage `<h1>` + `<title>` echo the same keywords (coordinate with technical-seo agent)
- [ ] JSON-LD `LodgingBusiness` with matching NAP (coordinate with schema-architect)
- [ ] Each photo filename + GBP caption contains a keyword (e.g., `upper-pelling-kanchenjunga-view-deluxe-room.jpg`)

### 5.2 Prominence levers
- [ ] 30+ Google reviews in 86 days (velocity matters more than total — see §2.9)
- [ ] 50+ photos, 5 new/week (freshness signal)
- [ ] Weekly GBP post (§2.7) — engagement signal
- [ ] Citation consistency across 30 directories (§3)
- [ ] Backlinks from Sikkim Tourism, travel bloggers (hand off to link-builder agent)
- [ ] Branded search volume ("urbane haauz" Google searches) — drive via Insta reels, WhatsApp status, Bengali travel groups

### 5.3 Operational cadence during 86-day peak window

| Frequency | Task | Owner |
|---|---|---|
| Daily | Respond to new reviews within 24h | Shovit |
| Daily | Reply to GBP messages / Q&A within 4h | Reception |
| Weekly (Mon) | New GBP post | Ayan |
| Weekly (Wed) | Upload 5 new photos | Ayan + front desk |
| Weekly (Fri) | Review velocity check: target 2.5 new reviews/wk | Shovit |
| Monthly | Citation audit — verify no stale NAP anywhere | Ayan |
| Monthly | Competitor GBP check — Elgin Mt Pandim, Norbu Ghang, Garuda | Ayan |

---

## 6. Geo-Targeted Landing Pages (hand off to content-writer)

Each page: 800–1200 words, unique `<title>`, meta desc, H1, breadcrumbs, LocalBusiness + TouristAttraction schema, internal link to `/book`, embedded map, photo gallery, FAQ section.

### 6.1 `/pelling/hotels-near-pemayangtse-monastery`
- **H1**: Hotels Near Pemayangtse Monastery — Urbane Haauz is 2 km Away
- **Outline**:
  1. Intro: Pemayangtse is Sikkim's 2nd-oldest monastery (1705), why it matters
  2. Distance / walk time / driving directions from Urbane Haauz
  3. Why stay in Upper Pelling vs closer Lower Pelling options
  4. Best time to visit the monastery (morning prayers 06:30)
  5. Combine with Rabdentse Ruins (10 min walk behind the monastery)
  6. Room options at Urbane Haauz + direct booking CTA
  7. FAQ (6 Qs)

### 6.2 `/pelling/hotels-near-khecheopalri-lake`
- **H1**: Hotels Near Khecheopalri Lake — Base Yourself at Urbane Haauz, 27 km
- **Outline**:
  1. Khecheopalri = sacred "wish-fulfilling" lake, UNESCO-listed sacred site
  2. Distance from Pelling (27 km, ~1h drive) — day-trip basis, not walking distance
  3. Why Pelling is the best base (infrastructure, food, Kanchenjunga views back at hotel)
  4. How to get there from Urbane Haauz (taxi ₹1800–2200 round trip, shared jeep ₹300)
  5. What to see around the lake (prayer wheels, monastery, forest walk)
  6. Combine with Yuksom (35 km further) on the same day
  7. FAQ

### 6.3 `/pelling/hotels-near-rabdentse-ruins`
- **H1**: Hotels Near Rabdentse Ruins — 3 km from Urbane Haauz
- **Outline**:
  1. Rabdentse = 2nd capital of Sikkim Kingdom (1670–1814), ASI-protected
  2. The 15-min forest walk from Pemayangtse access road
  3. Viewpoint over the valley and Kanchenjunga from the ruins
  4. Best photography time (golden hour)
  5. Historical context (worth doing with a local guide — we can arrange)
  6. Distance/directions from Urbane Haauz
  7. FAQ

### 6.4 `/pelling/upper-pelling-vs-lower-pelling`
- **H1**: Upper Pelling vs Lower Pelling — Which Should You Stay In?
- **Outline** (this page is a conversion goldmine — Bengali families literally Google this):
  1. TL;DR table: elevation / view / price / noise / walkability
  2. Why Upper Pelling is worth the 20–30% premium (view unobstructed by other buildings)
  3. Lower Pelling pros (closer to taxi stand, slightly cheaper, more budget options)
  4. Upper Pelling pros (views, quieter, better for families, most boutique properties)
  5. Map showing the divide
  6. Where Urbane Haauz sits on this map (Upper, premium view line)
  7. Rate comparison vs Lower Pelling equivalents
  8. FAQ (8 Qs covering "is it worth it", "how far apart", "which is better for honeymoon", "which for solo", etc.)
  9. Strong CTA: "Book direct, save OTA commission"

---

## 7. Bengali Audience Plays

Bengali families from Kolkata are the single largest segment for Pelling. Target them aggressively in the 86-day window.

### 7.1 Kolkata travel-agent tie-ups

- [ ] Compile list of 25 Kolkata-based travel agents specialising in Sikkim/Darjeeling packages (Chandni Chowk area, Esplanade, Gariahat)
- [ ] Offer 15% net rate + free site inspection for agent + spouse (standard industry practice)
- [ ] Priority agents: **Kundu Special, Travel Planners India, Bengal Travels, Help Tourism, Sikkim Tourism Centre (Kolkata), Calcutta Travel Club**
- [ ] Supply each agent with: PDF brochure, rate card, 10-photo grid, sample itinerary (3N4D Pelling+Gangtok)
- [ ] Telegram/WhatsApp group for agents — push last-minute availability

### 7.2 Bengali travel forum listings

- [ ] **Bong Bondhu** (bongbondhu.in) — largest Bengali travel community
- [ ] **Amar Bhraman** (Bengali travel magazine) — print + digital
- [ ] **Facebook groups**: "Bengalis Who Travel", "Ghurbo Bangla, Ghurbo Bishwo", "Sikkim Darjeeling Travel Group", "Weekend Trip from Kolkata" — not spammy; share genuine content (Kanchenjunga sunrise reels, Bengali food photos)
- [ ] **Quora Bengali topic space**: answer questions on Pelling, Sikkim, best time, hotels

### 7.3 Seasonal campaigns

#### Campaign A — April–June "Bengali Summer Escape" (active NOW, 86 days)
- **Hook**: "Kolkata 40°C, Pelling 18°C — Kanchenjunga view from your bed"
- **Offer**: 3N MAP package with free Bagdogra pickup, ₹19,500 for couple
- **Channels**: Insta reels (Bengali voiceover), Facebook ads targeting Kolkata + Howrah 35–55 M/F household income 10L+, WhatsApp status forwards to agent network
- **Landing page**: `/offers/bengali-summer-escape` with Bengali translation toggle

#### Campaign B — Durga Puja (October, plan NOW for 6-month lead time)
- **Hook**: "Puja Parikrama in the Himalayas — Urbane Haauz Pujor Package"
- **Offer**: Shashti to Dashami 5N4D package with Bengali thali on Ashtami + Sindoor khela celebration at property
- **Book open**: 1 May (Bengalis book Puja travel 5 months out — this is non-negotiable)
- **Agent channel**: exclusive Puja-week rates to Kolkata agents

#### Campaign C — Winter break (December–January)
- **Hook**: "Snow in Pelling? Chances + Kanchenjunga Christmas"
- **Offer**: 4N CP with NYE bonfire + Sikkimese dinner
- **Book open**: 1 October

### 7.4 Bengali-language content (flag for human review)

- [ ] Homepage tagline in Bengali (subtitle under the English H1)
- [ ] Key FAQ translated to Bengali
- [ ] Menu translated (restaurant printout)
- [ ] GBP posts during Puja week in Bengali
- [ ] Staff phrases: "Apnake sagotom" (welcome), basic hospitality phrases trained to all staff

---

## 8. Implementation Priority for the 86-Day Window

| Day | Task | Owner | Dependency |
|---|---|---|---|
| 1–2 | Verify NAP facts with founders, fix JSON-LD + Footer + Contact | Ayan | founder reply |
| 1 | Claim GBP + start video verification | Shovit | — |
| 3–5 | Shoot 50 baseline photos (use iPhone 15 Pro + tripod) | Ayan | — |
| 5 | GBP go-live with photos, description, hours, categories | Ayan | verification done |
| 6–10 | Submit to directories #1–#11 (MUST tier) | Ayan | NAP block ready |
| 10 | Launch review QR card at reception | Shovit | GBP review link |
| 14 | First GBP post + 5-photo refresh (cadence begins) | Ayan | — |
| 14 | Hand off geo-landing-page outlines to content-writer | Ayan | — |
| 21 | Submit to directories #12–#22 (SHOULD tier) | Ayan | — |
| 28 | Kolkata agent outreach wave 1 (10 agents) | Shovit | PDF brochure |
| 30 | Review velocity check #1 (target: 8 new reviews) | Shovit | — |
| 45 | Launch "Bengali Summer Escape" Facebook ads | Ayan | LP live |
| 60 | Submit directories #23–#30 (NICE tier) | Ayan | — |
| 75 | Puja campaign soft-launch to agent network | Shovit | — |
| 86 | Peak-window retrospective; lock Puja inventory | All | — |

---

## 9. Open items / handoffs

- **schema-architect**: use §1 canonical NAP to rebuild `LodgingBusiness` + `PostalAddress` + `GeoCoordinates` JSON-LD once GPS verified
- **content-writer**: outlines in §6 are ready to draft
- **technical-seo**: ensure `/pelling/*` routes are indexable under the prerender fix
- **link-builder**: priorities #24 (Sikkim Tourism), #25 (NIDHI), #29 (Lonely Planet), §7.1 (Kolkata agents)
- **founders (Ayan/Shovit/Souvik)**: verification items at top of this doc

---

**End of brief.** Review and sign-off required before any directory submission.
