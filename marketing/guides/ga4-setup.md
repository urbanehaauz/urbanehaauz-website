# Google Analytics 4 — Setup Guide

## Step 1: Create GA4 property
1. Go to https://analytics.google.com
2. Sign in with `urbanehaauz@gmail.com`
3. Click "Start measuring" or "Admin" > "Create Property"
4. Property name: `Urbane Haauz Website`
5. Time zone: `India (GMT+5:30)`
6. Currency: `INR`

## Step 2: Set up data stream
1. Choose **"Web"**
2. Website URL: `https://urbanehaauz.com`
3. Stream name: `urbanehaauz.com`
4. Click "Create stream"
5. Copy the **Measurement ID** (starts with `G-XXXXXXXXXX`)

## Step 3: Add to Vercel
Run this in your terminal:
```bash
vercel env add VITE_GA4_ID production
```
Paste the Measurement ID when prompted.

## Step 4: Add gtag to index.html
Claude Code will inject this script into `index.html` — no manual edit needed.
The script only loads when `VITE_GA4_ID` is set, so local dev stays clean.

## Step 5: Verify
1. Open https://urbanehaauz.com in a new incognito window
2. In GA4, go to **Reports > Realtime**
3. You should see 1 active user within 30 seconds

## Key events to track (set up in GA4 > Events)
- `click` on "Book Now" button (link to runhotel.site)
- `click` on WhatsApp button
- `page_view` on /rooms, /contact
- `scroll` depth > 75% on homepage
