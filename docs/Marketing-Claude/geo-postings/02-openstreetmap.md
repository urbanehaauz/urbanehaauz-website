# 02 · OpenStreetMap Node

**Why:** One OSM edit propagates to Apple Maps, Bing Maps, DuckDuckGo Maps, Mapbox, Foursquare, and every app built on those — plus OSM data is in every LLM training set.

**Time:** 20 minutes
**Cost:** Free
**Account needed:** OSM account (free, instant) at https://www.openstreetmap.org/user/new

---

## Step 1 — Find or place the pin

1. Go to **https://www.openstreetmap.org**
2. Search "Pelling, Sikkim"
3. Zoom into Upper Pelling until you can identify the exact location of the hotel
4. Click **Edit** (top-left, opens the iD editor in your browser — no software install needed)
5. Click **Point** (top toolbar) and click the exact location of the hotel building

---

## Step 2 — Tag the node

In the right-hand panel that appears, click **"All tags"** (small text at the bottom) and add these key/value pairs **exactly**. (You can also use the "Search" box to find each tag with autocomplete.)

```
tourism = hotel
name = Urbane Haauz
name:en = Urbane Haauz
brand = Urbane Haauz
operator = Urbane Haauz
addr:street = Skywalk Road
addr:place = Upper Pelling
addr:city = Pelling
addr:district = West Sikkim
addr:state = Sikkim
addr:postcode = 737113
addr:country = IN
phone = +91 91360 32524
contact:phone = +91 91360 32524
contact:whatsapp = +91 91360 32524
contact:email = urbanehaauz@gmail.com
contact:website = https://urbanehaauz.com
website = https://urbanehaauz.com
contact:instagram = https://instagram.com/urbanehaauz
contact:facebook = https://facebook.com/urbanehaauz
rooms = 8
stars =                       (LEAVE BLANK — only fill if officially registered)
internet_access = wlan
internet_access:fee = no
wheelchair = limited          (or "no" — be honest)
smoking = outside
opening_hours = 24/7
check_date = 2026-04-06
description = Boutique hotel in Upper Pelling with direct Kanchenjunga views, restaurant, bar, dormitory beds and CP/MAP meal plans.
description:en = Boutique hotel in Upper Pelling with direct Kanchenjunga views, restaurant, bar, dormitory beds and CP/MAP meal plans.
```

If you also want to be linked to the Wikidata item from step 01, add:
```
wikidata = Q[your-number-from-step-01]
```

---

## Step 3 — Save the changeset

1. Click **Save** (top-right)
2. Changeset comment: `Add Urbane Haauz boutique hotel in Upper Pelling, Sikkim`
3. Source: `survey;website` (because you're verifying it from the operator's own website)
4. Click **Upload**

Done. Your edit goes live within 1–2 minutes.

---

## Step 4 — Verification

After ~24 hours, search "Urbane Haauz" on:
- https://www.openstreetmap.org → should show the pin
- https://www.bing.com/maps → should show after Bing's next OSM sync (1–2 weeks)
- Apple Maps → after Apple's next sync (2–4 weeks)
- DuckDuckGo Maps → ~1 week

---

## Pitfalls

- **Do NOT spam-edit** existing nearby nodes. Only add the one for Urbane Haauz.
- **Do NOT add `stars=4`** unless registered with Sikkim Tourism. OSM has a community of editors who revert false claims.
- **Be precise on the pin location** — drag it on the satellite layer if needed. A pin in the wrong place is worse than no pin.
- **One node only** — don't create polygons unless you're confident in tracing the building outline.
