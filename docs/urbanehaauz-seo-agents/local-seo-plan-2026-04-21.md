# Urbane Haauz — Local SEO Action Plan (90-Day Execution)

**Author**: local-seo agent
**Date**: 2026-04-21
**Owner**: Ayan
**Goal**: Map-pack top-3 and organic #1 for "hotels in Pelling" within 90 days.
**Assumes**: NAP unification on site (commit 26c1d74), GBP description drafted (`gbp-description.md`), phone update blocked pending Google case 4-3669000040947.

---

## NAP Master Record (single source of truth)

Every listing, directory, schema tag, footer, email signature, invoice, and social bio **must** match this exactly. Variations = ranking drag.

| Field | Exact value (copy-paste) |
|---|---|
| Name | Urbane Haauz |
| Street | SH-510, Skywalk Road |
| Locality | Upper Pelling |
| Region | West Sikkim |
| Postal code | 737113 |
| Country | India |
| Phone (display) | +91 9136032524 |
| Phone (E.164) | +919136032524 |
| Email | urbanehaauz@gmail.com |
| Website | https://urbanehaauz.com |
| Booking URL | https://urbanehaauz.com/book |
| WhatsApp | https://wa.me/919136032524 |
| GSTIN | 11AXUPB9728M1ZY |

**Do not use**: "Urbane Haauz Boutique Hotel", "Urbane Haauz Hotel & Restaurant", "The Urbane Haauz". Name field is *Urbane Haauz* only — category handles the descriptor.

**Coordinates (fill before publishing schema)**: `[FLAG — owner to confirm from GBP pin]` lat/lng. Upper Pelling approximate centroid: 27.3171° N, 88.2389° E — verify actual pin.

---

## Priority Ladder (what to do first)

**Week 1 (P0 — do this week)**
1. Finish GBP description + attributes per `gbp-description.md`
2. Upload the photo set (Task 1 below)
3. Set service-area radius
4. Seed owner Q&A (already drafted in `gbp-description.md`)
5. Claim/verify listings on Justdial, TripAdvisor, Booking.com, MakeMyTrip, Agoda (P0 citations)
6. Install checkout QR review funnel

**Week 2–4 (P1)**
7. Post-stay email automation via Supabase Edge Function
8. Remaining P1 citations (15 directories)
9. First 4 GBP posts scheduled
10. Rangotsav attendee review-request sequence

**Month 2–3 (P2)**
11. Niche/long-tail citations (Hostelworld, Hostelbookers, regional Bengali forums)
12. Monthly NAP drift audit
13. Review-velocity target: 15 new reviews/month steady-state

---

## 1. GBP Optimization — Beyond the Description

The existing `gbp-description.md` covers description copy, categories, attributes list, posts, and Q&A. This section adds what's missing: photo strategy, service area, posting cadence, insight monitoring.

### 1a. Photo strategy

Google ranks hotels partly on photo *volume*, *recency*, and *category coverage*. Target state in 90 days: **120+ photos across 8 categories**, with ≥10 new uploads per month to keep the "recently updated" signal alive.

| Category | Minimum count | What to shoot | Shot notes |
|---|---|---|---|
| Exterior | 8 | Building front (day + dusk), signage closeup, approach from Skywalk Road, entrance arch | Include one shot with the Kanchenjunga visible behind the building — this is the single highest-CTR hotel photo on GBP for Pelling. |
| Lobby / reception | 6 | Reception desk, seating area, stairwell, any local art | Shoot at 10 AM with natural light; avoid flash. |
| Rooms — Standard | 10 | Bed straight-on, room from doorway, bathroom, window view, details (kettle, towel art), wide from balcony back into room | One room per type; keep consistent angle so users can compare. |
| Rooms — Deluxe | 10 | Same angles as Standard | |
| Rooms — Premium | 10 | Same angles + amenity highlights (balcony seating, extra space) | |
| Rooms — DORM | 8 | Bunk layout wide, lockers, shared bathroom, common area, charging points closeup | This is a competitive moat — shoot as well as private rooms, not as a lesser product. |
| Restaurant + bar | 12 | Interior wide, table setup, 4–5 hero dishes (thukpa, Bengali fish, breakfast plate, momos, a dessert), bar counter, a bottle shelf | Food photos drive bookings more than room photos for the Bengali family segment. |
| Views | 20 | Kanchenjunga sunrise (5:30–6:30 AM), mid-morning, sunset glow, from each floor, from balcony, from restaurant window, at different seasons | **Priority category.** Shoot fresh every clear-sky week. Variety > perfection. |
| Amenities | 8 | Hot-water geyser, power-backup unit, WiFi router area, parking, luggage storage | Proves claims against competitors who fake it. |
| Neighborhood | 10 | Pelling Skywalk (show walking route), Pemayangtse Monastery, Rabdentse Ruins, Kanchenjunga Falls, Khecheopalri Lake, local market | Geo-signal for "near X" searches. |
| Team / "by owners" | 4 | Staff at reception, chef, housekeeping, Ayan at property | Humanises listing; LLMs cite these in "who runs" queries. |
| Events | 6+ | Rangotsav setup, previous guest celebrations, festival decor | Add after each event. |

**Technical specs**: 1200×1200 minimum, under 5 MB each, JPEG. **Rename files before upload** — `urbane-haauz-pelling-kanchenjunga-view-room-deluxe.jpg` beats `IMG_4523.jpg` for GBP's internal indexing.

**Cadence**: Upload 3–5 photos every Sunday. Never bulk-dump 100 photos in one session — Google's recency signal rewards steady activity.

### 1b. Service area

Hotels are "pinned" businesses so the primary location is fixed to the pin. But GBP now allows a *service-area* overlay for pickup/drop-off, delivery, and tours.

**Enable service area for**: airport pickup + guided tours.

**Radius**: 150 km from property. This covers Bagdogra airport, NJP station, Gangtok, Lachung, Yuksom, Namchi, Ravangla. Any further and the pickup pricing gets awkward.

**Why this matters**: service-area businesses appear in the map pack for queries like "airport pickup Pelling" and "Gangtok to Pelling taxi" — free exposure for a service Urbane Haauz already offers.

### 1c. Attributes — what to enable vs disable

From the `gbp-description.md` list, audit these carefully. **False attributes get the listing suspended.**

**Enable (confirmed)**:
- Free Wi-Fi, Free parking, Restaurant on-site, Bar, Room service, Mountain view, Family-friendly, Air conditioning, Smoke-free property, Breakfast, Dinner, Airport shuttle (paid), Luggage storage, Housekeeping, Front desk (24h), Heating

**Enable only if confirmed by owner — flag each**:
- `[FLAG]` Pet-friendly (described as "on request" in gbp-description.md — either enable fully or don't claim it)
- `[FLAG]` Wheelchair accessible entrance (is the entrance ramped? If not, disable)
- `[FLAG]` Kid-friendly (high chairs? cots? if neither, disable)
- `[FLAG]` Paid parking on premises (or is it free?)

**Explicitly disable** (common over-claims that trigger suspensions):
- Swimming pool
- Spa
- Fitness center
- Business center
- Airport shuttle (free)
- All-inclusive

**Health & safety attributes** (still ranked by some Google markets post-COVID): enable *Staff wear masks: optional*, *Hand sanitizer available*. These don't cost anything and still show up in SERP filters in Indian market.

### 1d. Posting cadence

| Frequency | Post type | Notes |
|---|---|---|
| 1× / week | Offer or update | Rotate: direct-booking discount, seasonal package, festival hook, view-of-the-week |
| 1× / month | Event | Rangotsav, Losar, Saga Dawa, Pang Lhabsol, local monastery festivals |
| Ad hoc | Photo-only post | Fresh Kanchenjunga shot with one-line caption |

**Format discipline**:
- Always include phone number *in the post body* (until case 4-3669000040947 resolves)
- Always include one image
- CTA button: "Learn more" → direct booking URL for offers; "Call now" for service-related posts
- Posts expire at 7 days — that's why weekly cadence matters

### 1e. GBP Insights — what to monitor

Check GBP → Performance weekly. Target trajectory:

| Metric | Week 1 baseline | Day 90 target | Red flag |
|---|---|---|---|
| Searches → profile views | [capture now] | +100% | Any week-over-week drop >20% with no seasonal cause |
| Direct (name) searches | [capture now] | +50% | Flat = brand not building |
| Discovery (category) searches | [capture now] | +200% | Flat = not ranking for generic terms |
| Website clicks | [capture now] | +150% | Dropping while views rise = listing problem |
| Phone calls | [capture now] | +100% | Flat after case resolves = CTA problem |
| Direction requests | [capture now] | +75% | Good proxy for actual bookings |

`[FLAG]` **Action for Ayan**: screenshot GBP Insights dashboard today to establish week-1 baseline.

---

## 2. Citations Target List (25+ directories)

Citations are NAP mentions across third-party directories. Google uses them as corroboration — if 25 sites all say "Urbane Haauz, SH-510 Skywalk Road, +91 9136032524", Google trusts the pin. If they disagree, confidence drops.

**Submit in priority order. Every submission uses the NAP master record above — copy-paste, don't retype.**

### P0 — Core (do this week)

| # | Directory | URL | Cost | Effort | Notes |
|---|---|---|---|---|---|
| 1 | **Google Business Profile** | https://business.google.com | Free | 1 hr | Already claimed. Finish description, photos, attributes. |
| 2 | **Bing Places** | https://www.bingplaces.com | Free | 20 min | Import from GBP via their "Import from Google" tool. Gets you on Bing + ChatGPT citations. |
| 3 | **Apple Business Connect** | https://businessconnect.apple.com | Free | 30 min | Apple Maps = iPhone users = high-intent Bengali family market. Often overlooked. |
| 4 | **TripAdvisor** | https://www.tripadvisor.in/Owners | Free (paid tier optional) | 1 hr | Claim existing listing. Match NAP exactly. Respond to every existing review. |
| 5 | **Justdial** | https://www.justdial.com/Free-Listing | Free (paid upsell) | 30 min | Biggest Indian directory by far. **Expect aggressive upsell calls** — say no, keep the free listing. |
| 6 | **Booking.com** | https://join.booking.com | Commission 15% | 2 hr | Should already be live via RunHotels. Verify NAP + photos match website. |
| 7 | **MakeMyTrip (MMT)** | https://www.makemytrip.com/hotels/partners | Commission 15–20% | 2 hr | Primary Indian OTA. Listing title format: `Urbane Haauz - Boutique Hotel \| Kanchenjunga View \| Upper Pelling` |
| 8 | **Agoda** | https://ycs.agoda.com/en-us/public/create | Commission 15% | 2 hr | Budget-skewing audience — surface DORM prominently. |

### P1 — Major Indian OTAs + directories (weeks 2–4)

| # | Directory | URL | Cost | Effort | Notes |
|---|---|---|---|---|---|
| 9 | **Goibibo** | https://partners.goibibo.com | Commission 12–15% | 1 hr | Owned by MMT group but separate listing. |
| 10 | **Yatra** | https://partners.yatra.com | Commission 15% | 1 hr | Strong in Bengali corporate segment. |
| 11 | **Cleartrip** | https://www.cleartrip.com/partners/hotels | Commission 12–15% | 1 hr | Flipkart-owned, rising after restructure. |
| 12 | **EaseMyTrip** | https://partners.easemytrip.com | Commission 10–15% | 1 hr | Lower commission, growing share. |
| 13 | **Ixigo** | https://business.ixigo.com | Commission 12% | 1 hr | Strong for train-connecting travelers (NJP → Pelling). |
| 14 | **HolidayIQ** | https://www.holidayiq.com/business | Free listing + paid upsell | 45 min | Review aggregator; LLMs scrape it heavily. |
| 15 | **Sulekha** | https://www.sulekha.com/business/add-your-business | Free | 30 min | Second-tier Indian directory — still a citation signal. |
| 16 | **Asklaila** | https://www.asklaila.com | Free | 30 min | Long-tail directory. Low traffic but zero-effort citation. |
| 17 | **IndiaMart** | https://seller.indiamart.com | Free | 30 min | B2B angle — useful for travel-agent tie-ups. List service = "Hotel Accommodation Service". |
| 18 | **Trivago** | https://businessstudio.trivago.com | Free (metasearch, no commission) | 45 min | Pulls from Booking/Agoda; just claim the profile to manage it. |
| 19 | **Hotels.com** | via Expedia group | Commission 15% | included in #20 | Part of Expedia Partner Central — one login covers all. |
| 20 | **Expedia** | https://welcome.expediagroup.com | Commission 15% | 2 hr | Global OTA — relevant for foreign backpackers asking about DORM. |
| 21 | **Airbnb** | https://www.airbnb.co.in/host/homes | 3% host fee | 2 hr | List the DORM beds + one private room as an experiment. Different audience than OTAs. |
| 22 | **Hostelworld** | https://www.hostelworld.com/inbox/properties/signup | Commission 15% | 2 hr | **Critical for DORM segment.** Foreign backpacker traffic; competitor Zostel owns Pelling here. |
| 23 | **Hostelbookers / Hostelz** | https://www.hostelz.com | Free | 30 min | Hostelz is free and scraped by LLMs. Hostelbookers merged with Hostelworld. |

### P1 — Tourism boards & regional (weeks 2–4)

| # | Directory | URL | Cost | Effort | Notes |
|---|---|---|---|---|---|
| 24 | **Sikkim Tourism Department** | https://www.sikkimtourism.gov.in | Free | 1 hr | Official registration as a registered accommodation. Needed for high-season permit renewals anyway. |
| 25 | **Incredible India (Ministry of Tourism)** | https://www.incredibleindia.org | Free | 45 min | Gov-registered hotel listing. |
| 26 | **Sikkim Hotel Association** | Local — contact West Sikkim chapter | Membership fee `[FLAG — check cost]` | In person | Membership = credibility signal + B2B agent network. |
| 27 | **Holidify** | https://www.holidify.com/hotel-partner | Free | 30 min | Strong for "things to do in Pelling" — great for backlink + citation. |
| 28 | **Thrillophilia** | https://www.thrillophilia.com/supplier-signup | Commission on bookings | 1 hr | Experience-led; pair with "Kanchenjunga sunrise" package offer. |
| 29 | **TraWell Co** | https://www.trawell.in/contact | Free listing | 30 min | Regional travel portal; indexed by Indian SERPs. |
| 30 | **Wikivoyage — Pelling page** | https://en.wikivoyage.org/wiki/Pelling | Free | 30 min | *Edit* the Pelling page to add Urbane Haauz under "Sleep" — objective listing only, don't promote. Single highest-authority citation you'll ever get. |

### P2 — Niche / long-tail (month 2–3)

| # | Directory | URL | Cost | Effort | Notes |
|---|---|---|---|---|---|
| 31 | **Lonely Planet** | https://www.lonelyplanet.com (submit via editorial) | Free (editorial) | 1 hr pitch | Email editorial with a one-paragraph pitch — "only Upper Pelling property with dorm + Kanchenjunga view". Long shot but high value. |
| 32 | **Zostel Aggregator listing** | — | N/A | — | Skip. Competitor. Don't list through them. |
| 33 | **Tripoto** | https://www.tripoto.com | Free | 45 min | User-generated trip platform. Submit as a trip destination. Big with Bengali travelers. |
| 34 | **Travel Triangle** | https://traveltriangle.com/partner-with-us | Commission | 1 hr | Package-based; pair with multi-day Sikkim itinerary. |
| 35 | **Bengali diaspora forums** | — | Free | 2 hr | `[FLAG]` Specific forums to submit: Amar Kolkata groups on Facebook, r/kolkata, Bong Travelers groups. Participate authentically — don't spam. One post every 2 weeks when someone asks about Pelling. |

### What *not* to do

- Don't pay for "1000 citations in 24 hours" Fiverr gigs. Low-quality NAP mentions get Google to devalue all your citations.
- Don't submit to generic business directories unrelated to travel (Yellow Pages clones, free-business-listing.xyz domains). They add no weight and sometimes hurt trust.
- Don't create duplicate GBP listings for "Urbane Haauz Restaurant" or "Urbane Haauz Dormitory". One pin per physical location.

### Total time + cost estimate

- **Free submissions**: ~18 hours over 4 weeks if one person does it focused
- **Paid commissions**: 10–20% of bookings from OTA channels — only charged on actual bookings, no upfront cost
- **Paid upfront**: `[FLAG]` Sikkim Hotel Association membership (confirm fee) — probably ₹2–10k/year
- Everything else free

---

## 3. Ready-to-Paste Listing Copy

Use these exact texts for citation submissions. Copy the version that fits the field length.

### Short — 148 chars (for JustDial, Asklaila, business description fields with tight limits)

> Boutique hotel in Upper Pelling with Kanchenjunga views. Private rooms + dorm beds. Restaurant, bar, 10-min walk to Pelling Skywalk. +91 9136032524

### Medium — 394 chars (for MakeMyTrip, Booking.com, Agoda short descriptions)

> Urbane Haauz is a boutique hotel in Upper Pelling, West Sikkim offering direct Kanchenjunga views and the only property in the area with both private rooms and dormitory beds. CP/MAP meal plans, 24-hour hot water, power backup, free WiFi, in-house restaurant and bar. 10-minute walk to Pelling Skywalk; close to Pemayangtse Monastery and Rabdentse Ruins. Call +91 9136032524.

### Long — 748 chars (for TripAdvisor, Expedia, long-form description fields)

> Urbane Haauz is a boutique hotel in Upper Pelling, West Sikkim, with direct Kanchenjunga mountain views and the only property in the area offering both private rooms and dormitory beds for backpackers. Wake up to Kanchenjunga sunrise from the balcony. CP and MAP meal plans, 24-hour hot water, power backup, free WiFi, Bengali-speaking staff, in-house restaurant serving Bengali, Sikkimese and North Indian cuisine, and a small bar. 10-minute walk to the Pelling Skywalk; 5 minutes to Pemayangtse Monastery and Rabdentse Ruins; close to Khecheopalri Lake and Sangachoeling. Direct bookings at urbanehaauz.com carry a best-rate guarantee. Call or WhatsApp +91 9136032524, or email urbanehaauz@gmail.com.

### FAQ block (for listings with FAQ / "Good to know" sections)

**Where is Urbane Haauz located?**
SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113, India. 10 minutes walk to Pelling Skywalk, 5 minutes to Pemayangtse Monastery.

**Does Urbane Haauz have Kanchenjunga views?**
Yes. Upper-floor rooms and the balcony face Kanchenjunga directly. Best views are at sunrise (5:30–6:30 AM) on clear days.

**What room types are available?**
Standard, Deluxe, Premium private rooms, plus shared dormitory beds with lockers and shared hot-water bathrooms.

**What meals are available?**
CP (breakfast included) and MAP (breakfast + dinner) plans. In-house restaurant serves Bengali, Sikkimese, North Indian, and continental. Pure vegetarian and Jain-friendly options on request.

**How do I reach Pelling?**
NJP railway station or Bagdogra airport to Pelling is ~140 km, 4.5–5 hours by shared or private cab via Siliguri–Jorethang–Legship. Airport pickup available (paid) — call +91 9136032524 24 hours in advance.

**What's the best time to visit?**
Mid-October to late November and mid-February to April for clear Kanchenjunga views. Monsoon (July–September) brings clouds; peak winter (December–January) is cold but stunning.

**Do you accept direct bookings?**
Yes. Book at urbanehaauz.com with best-rate guarantee, instant confirmation, and free cancellation up to 48 hours before arrival.

**Is Urbane Haauz family-friendly?**
Yes. Family-friendly rooms, Bengali-speaking staff, Jain and vegetarian meals, airport pickup, and walking distance to major Pelling attractions.

---

## 4. Review-Generation Plan

Reviews drive map-pack ranking more than any other factor once NAP and citations are clean. Target: **15 new GBP reviews per month**, 4.6+ star average, 30%+ mentioning "Kanchenjunga" or "view".

### 4a. Checkout QR code

Print a card for the reception desk: **"Loved your stay? Scan to leave a 30-second review."** — QR goes to GBP review URL.

**GBP review URL**: `https://search.google.com/local/writereview?placeid=[PLACE_ID]`

`[FLAG]` **Action for Ayan**: get the Place ID from https://developers.google.com/places/place-id (paste "Urbane Haauz Pelling", copy ID). Generate QR at qr-code-generator.com (free). Print 10 copies, laminated, A6 size. Place one at reception desk, one in each room next to the kettle, one at restaurant billing counter.

**Staff script** (for reception at checkout): *"Hope your stay was great. If you have 30 seconds, we'd really appreciate a Google review — the QR on this card takes you straight there. It genuinely helps us."* Don't bribe (no free tea for reviews — Google suspends for that). Just ask.

### 4b. Post-stay email automation

Add to the existing Supabase Edge Function email flow (same infra as the Rangotsav confirmation email — commit 6e61007). Trigger: **3 days after `bookings.check_out`**.

**Template:**

Subject: `Thank you for staying with us at Urbane Haauz — one small favour`

Body:
```
Hi {{guestName}},

Thank you for choosing Urbane Haauz for your Pelling stay. We hope you caught a clear Kanchenjunga sunrise from the balcony.

If you have 30 seconds, we'd be genuinely grateful if you could leave us a quick Google review. Small boutique hotels like ours live and die by reviews, and yours helps future travelers find us.

>> Leave a Google review: {{gbpReviewUrl}}

If you had anything less than a perfect stay, please reply to this email directly — Ayan (the owner) reads every message personally.

Hope to host you again.

— The Urbane Haauz team
SH-510, Skywalk Road, Upper Pelling
+91 9136032524 | urbanehaauz.com
```

**Implementation notes for engineer:**
- New Supabase Edge Function: `supabase/functions/post-stay-review-email/`
- Cron trigger: daily at 10 AM IST, query `bookings WHERE check_out = CURRENT_DATE - INTERVAL '3 days' AND review_email_sent = false`
- Add column `review_email_sent boolean DEFAULT false` to `bookings` table
- Use the same Resend integration as the Rangotsav confirmation email
- FROM: `info@urbanehaauz.com` (matches recent email domain switch in commit 7d461b6)
- REPLY-TO: `urbanehaauz@gmail.com` (Ayan's inbox)
- Log send to a `review_email_log` table for rate-limit + debug visibility

Expected yield: ~15–20% of stayed guests leave a review with this flow. At 50 bookings/month → 7–10 reviews/month from email alone.

### 4c. Rangotsav attendee follow-up

Rangotsav has higher emotional engagement than a normal stay — review-rate should be 30%+ if asked well. Run a separate email sequence for Rangotsav attendees.

**Day 1 after event**: thank-you email with event photos link, soft review ask
**Day 7 after event**: review reminder, now includes a photo of them at the event if available (via tagged Instagram post)

Gate on a new `bookings.is_rangotsav_attendee` flag or query the existing Rangotsav signup table.

### 4d. Review response templates

**Response speed target**: all reviews answered within 24 hours. Google's local-search ranking factors explicitly reward response rate.

**Positive — mentions the view**
> Thank you, {{firstName}}. The Kanchenjunga sunrise is exactly why we built Urbane Haauz at this spot in Upper Pelling. So glad you caught a clear morning. Come back in autumn — the views are even sharper. — Ayan

**Positive — family stay**
> Thank you, {{firstName}}. Hosting families is what we do best, and we're thrilled the kids enjoyed the restaurant (our chef will be pleased). Looking forward to having you back. — Ayan

**Positive — backpacker / dorm**
> Thanks so much, {{firstName}}. Glad the dorm worked for your Pelling stop — we built it because every other upper-Pelling place was pricing backpackers out of the view. Safe travels onward. — Ayan

**Mixed — one issue, otherwise positive**
> Thank you for the honest review, {{firstName}}. You're right about {{specific_issue}} — we've already {{specific_action_taken}}. Really appreciate you flagging it. Next time you're in Pelling, please ask for me personally. — Ayan

**Negative — room issue (responding publicly)**
> Thank you for taking the time, {{firstName}}. I'm sorry the room fell short of what we promise. {{Specific_issue}} shouldn't happen — we've {{specific_fix}} since you left. I'd genuinely like to make it right: please email me at urbanehaauz@gmail.com so I can follow up personally. — Ayan, Owner

**Negative — value / price concern**
> Thanks for the feedback, {{firstName}}. We price higher than lower Pelling because of the Kanchenjunga view and the MAP-inclusive option — but that's only worth it if the experience matches, and if it didn't for you, that's on us. Please email urbanehaauz@gmail.com — I'd like to understand what specifically let you down. — Ayan

**Rules for responses:**
- Sign off with "Ayan" or "Ayan, Owner" — personal > corporate
- Never argue. Never say "you're wrong". Even for clearly unfair reviews, acknowledge and pivot to a private channel.
- For negative reviews, *never* offer a refund publicly — only in the private follow-up email. Public refund offers attract fake negatives.
- Flag obviously fake reviews to Google ("report review" → "fake engagement") — but don't count on removal.

---

## 5. Map Pack Ranking Levers — Pelling-Specific

Map pack (the 3-hotel block at the top of mobile search) is won by three things: proximity, prominence, relevance. Pelling-specific tactics:

### 5a. Proximity tactics

You can't move the pin, but you *can* influence what queries you appear for.

- **Verify the pin is in Upper Pelling, not Lower Pelling or Middle Pelling**. On GBP → Edit profile → Location → drag the pin. Use satellite view, match to the actual roof of the building. `[FLAG]` Ayan to verify — this is a 5-minute fix that many Pelling hotels get wrong.
- **Set service area to 150 km** (covered in §1b). This creates eligibility for broader pickup/tour queries without moving the main pin.
- **Neighborhood terms in description**: use "Upper Pelling", "Skywalk Road", "near Pemayangtse" — all three appear in the current description draft. Good.

### 5b. Secondary categories to add

Primary: Hotel. Secondaries drive "also appears in" map-pack eligibility. Add **all** of these:

1. Boutique hotel
2. Guest house
3. Hostel / Backpacker hostel (for DORM)
4. Bed & breakfast (CP plan matches this)
5. Extended stay hotel (if offering monthly rates — `[FLAG]` owner to confirm)

Do **not** add:
- Restaurant (as a secondary on a hotel GBP) — creates category confusion and actually *hurts* hotel-search relevance. If you want food discoverability, run a separate GBP for "Urbane Haauz Restaurant" at the same address. Only worth it if restaurant drives walk-ins, which in Upper Pelling it probably doesn't.
- Event venue — same reason.

### 5c. Attribute selection matching search intent

Bengali family travelers to Pelling search with very specific filters. Map each to an enabled attribute:

| Traveler query | GBP filter / attribute | Enable? |
|---|---|---|
| "hotels in pelling with kanchenjunga view" | Mountain view | Yes |
| "pelling hotels with restaurant" | Restaurant, Breakfast | Yes |
| "pelling hotels free wifi" | Free Wi-Fi | Yes |
| "pelling hotels with parking" | Free parking on premises | Yes (if free — confirm) |
| "pelling hotels family" | Family-friendly, Good for kids | Yes (if child amenities real) |
| "pelling hotels near skywalk" | — (text signal only, no attribute) | Handle via description |
| "budget hotels pelling" | — (Google uses price-range badges) | Set price-range as $$ to differentiate from lower Pelling $ competitors while staying attractive |
| "pelling bengali food" | Vegetarian, Serves dinner | Yes |
| "pet friendly hotel pelling" | Pets allowed | `[FLAG]` Only if true, not "on request" |
| "pelling hotels with bar" | Bar on site | Yes |

### 5d. Local relevance multipliers

- **Embed a Google Map iframe** on the website Contact page pointing to the *exact* Place ID. This is a ranking signal for local-pack because Google correlates map embeds with geographic authority. `[FLAG]` verify current embed matches the Place ID.
- **Add local schema markup** (pass to schema-architect agent): `Hotel` schema + `LocalBusiness` + `@id` matching the GBP Place ID URL. Single strongest on-site signal for map pack.
- **Internal content linking "Pelling" and "Upper Pelling"**: every page should reference the locality once. Currently strong on homepage; weaker on /rooms and /experiences. Flag for content-writer.
- **Backlinks from Pelling-context sites**: Sikkim Tourism, local blogs, travel bloggers covering Pelling. Pass to link-builder agent.

---

## 6. NAP Monitoring — Monthly Audit Checklist

NAP drifts. OTAs auto-update their listings, staff at third-party call centers retype phone numbers, Google auto-suggests "updates" that aren't updates. Left unchecked, in 12 months your citations diverge and ranking silently decays.

**Run this checklist on the first Monday of every month. 30 minutes, tick each.**

### Monthly NAP audit

| # | Check | Expected value | If wrong |
|---|---|---|---|
| 1 | Google Business Profile | Name, address, phone match master record; description unchanged; phone field status (case 4-3669000040947) | Revert edits; re-escalate ticket if phone reverted |
| 2 | GBP secondary categories | Hotel (primary) + boutique, guest house, hostel, B&B | Re-add if Google dropped any |
| 3 | GBP photo count trajectory | ≥10 new uploads in last 30 days | Schedule catch-up photo session |
| 4 | GBP review count + average | Growing ≥10/month, ≥4.5 stars | Audit review-request flow; increase QR visibility |
| 5 | Bing Places | NAP matches | Re-sync from GBP |
| 6 | Apple Business Connect | NAP matches | Edit in console |
| 7 | Booking.com listing | NAP + photos + category matches | Edit via extranet |
| 8 | MakeMyTrip listing | NAP + title format + photos | Edit via partner portal |
| 9 | Agoda listing | NAP + DORM listed separately | Edit via YCS |
| 10 | Goibibo / Yatra / Cleartrip / EaseMyTrip / Ixigo | NAP check (quick eyeball) | Edit if drifted |
| 11 | TripAdvisor | NAP + respond to last month's reviews | Claim/edit; reply to reviews |
| 12 | Justdial | NAP + no paid upsell accidentally enabled | Edit if pitched into paid tier |
| 13 | Hostelworld | NAP + DORM pricing current | Edit; refresh availability |
| 14 | Wikivoyage Pelling page | Urbane Haauz entry present, NAP correct, no promotional language | Re-edit carefully; Wikivoyage rejects promo tone |
| 15 | Website footer | NAP unchanged in `components/Footer.tsx` (currently HOTEL_CONTACT constant) | Git-diff and restore |
| 16 | Website schema | JSON-LD `Hotel` + `LocalBusiness` with correct NAP + Place ID | Update via schema-architect |
| 17 | Email signature on `urbanehaauz@gmail.com` + `info@urbanehaauz.com` + `bookings@urbanehaauz.com` | Consistent NAP block | Edit via Gmail settings |
| 18 | Instagram / Facebook bio | Address, phone, website current | Edit profile |
| 19 | GST invoice footer | Legal address matches | Update invoice template |
| 20 | WhatsApp business profile | Address + business description consistent | Edit in WhatsApp Business settings |

### Drift-detection shortcut (quarterly deep audit)

Run a Google search for `"Urbane Haauz"` (with quotes) and scan the first 5 pages. Any listing that shows up with a wrong phone, wrong address, or wrong spelling of the name → claim it or contest it via the respective directory.

Also search `"9136032524"` and `"urbanehaauz@gmail.com"` — these surface citations where the name drifted but contact info stayed right, which is a different and more insidious kind of drift.

### Tooling (optional, paid)

If growth justifies it (month 4+), consider a paid citation tracker:
- **BrightLocal** (₹2,800/month) — automated citation audit + tracking. Overkill for single property but worth it if Urbane Haauz grows to a second property.
- **Moz Local** (₹1,600/month) — similar, weaker India coverage.

`[FLAG — cost decision]` **Recommend skip for the first 90 days.** Do manual monthly audit; reassess at month 4.

---

## 7. What's Missing / Flagged for Owner Input

Consolidated list of `[FLAG]`s from above — please provide so this plan is fully executable:

1. **GBP pin coordinates** — verify pin is in Upper Pelling, capture lat/lng for schema
2. **GBP Place ID** — needed for QR code + website map embed + schema `@id`
3. **GBP Insights baseline screenshots** — capture this week to measure 90-day delta
4. **Attributes to confirm true/false**: pet-friendly, wheelchair accessible, kid-friendly (high chairs / cots), paid vs free parking
5. **Extended-stay rates** — do you offer monthly rates? If yes, add "Extended stay hotel" as secondary category
6. **Sikkim Hotel Association membership cost** — worth paying for member network + citation
7. **Dormitory pricing parity across OTAs** — confirm Hostelworld pricing matches Booking.com dorm pricing
8. **Pet-friendly final answer** — "on request" isn't a GBP attribute; pick yes or no

---

## 8. Success Metrics — 90-Day Scorecard

Measure these three times: day 0 (today), day 45 (mid-point), day 90 (target).

| KPI | Day 0 | Day 45 target | Day 90 target |
|---|---|---|---|
| GBP profile views / month | [baseline] | +75% | +150% |
| "Hotels in Pelling" map-pack appearances | [likely page 2+] | Top 10 | Top 3 |
| "Hotels in Pelling" organic SERP position | [capture] | Top 20 | Top 5 |
| "Boutique hotel Pelling" — organic | [capture] | Top 10 | Top 3 |
| "Pelling Kanchenjunga view" — organic | [capture] | Top 5 | #1 |
| "Dorm stay Pelling" — organic + map | [capture] | Top 5 | #1 |
| GBP reviews (total) | [capture] | +15 | +45 |
| GBP average rating | [capture] | Hold ≥4.5 | Hold ≥4.5 |
| Direct bookings via urbanehaauz.com/book | [capture] | +40% | +100% |
| OTA booking share | [capture] | -10 pp | -20 pp (shift to direct) |
| Active citations (NAP live + correct) | ~6 | 22 | 30+ |
| Monthly GBP post cadence | ad-hoc | Weekly | Weekly |

---

## Handoffs to other agents

- **schema-architect**: Hotel + LocalBusiness schema with Place ID `@id`, coordinates, price range, aggregateRating pulled from GBP
- **content-writer**: "Hotels in Upper Pelling — complete guide" landing page; expand /rooms and /experiences with Pelling locality references; Bengali-audience landing page variant
- **technical-seo**: verify Google Maps iframe on /contact points to correct Place ID; check hreflang for Bengali if variant lives
- **link-builder**: outreach to Holidify, Tripoto, Bengali travel bloggers; pitch Lonely Planet editorial; Sikkim tourism official backlink
- **keyword-researcher**: Bengali-language keyword variants ("পেলিং এ হোটেল", "কাঞ্চনজঙ্ঘা ভিউ হোটেল"); long-tail "near X" landmark queries

---

**End of plan. File owner: Ayan. Execution owner: Ayan + Shovit.**
