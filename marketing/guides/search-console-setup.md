# Google Search Console — Setup Guide

## Step 1: Go to Search Console
1. Open https://search.google.com/search-console/about
2. Click "Start now"
3. Sign in with `urbanehaauz@gmail.com`

## Step 2: Add property
1. Choose **"URL prefix"** method (not Domain)
2. Enter: `https://urbanehaauz.com`
3. Click "Continue"

## Step 3: Verify ownership (DNS method — recommended)
1. Google gives you a TXT record like: `google-site-verification=XXXXXXXXX`
2. Go to your GoDaddy DNS dashboard
3. Add a new TXT record:
   - **Host**: `@`
   - **TXT Value**: (paste the google-site-verification string)
   - **TTL**: 1 hour
4. Go back to Search Console and click "Verify"
5. DNS propagation takes 5-60 minutes. If it fails, wait and retry.

## Step 4: Submit sitemap (immediately after verification)
1. In Search Console left sidebar, click **"Sitemaps"**
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Status should change to "Success" within a few hours

## Step 5: Request indexing for key pages
1. Go to **"URL Inspection"** (top search bar)
2. Paste: `https://urbanehaauz.com/`
3. Click "Request Indexing"
4. Repeat for any other important URLs

## What to monitor (weekly)
- **Performance > Search results**: impressions, clicks, CTR, position
- **Coverage**: indexed vs excluded pages
- **Sitemaps**: last read date, discovered URLs
