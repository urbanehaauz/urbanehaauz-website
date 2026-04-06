# Urbane Haauz — Prerender Plan

**Status**: DEFERRED (requires follow-up session)
**Date**: 2026-04-06
**Hard constraint**: `HashRouter` must remain because Supabase OAuth uses `/#/auth/callback`. Do NOT swap to `BrowserRouter` globally — CLAUDE.md forbids this.

## Why this is deferred, not done now

The site currently uses `HashRouter`, so every crawlable URL is of the form `https://urbanehaauz.com/#/rooms`. Search engines treat everything after `#` as an in-page fragment and do not index hash routes as separate URLs. Meta-tag fixes (react-helmet-async, JSON-LD) help once a user is on the page but do not solve discoverability. We need real static HTML emitted at `/rooms`, `/experiences`, `/book`, `/contact` in `dist/` at build time.

Three approaches were considered; the recommended one is listed last.

## Option A — `vite-plugin-prerender` / `@prerenderer/rollup-plugin`

Runs a headless Chromium (puppeteer) over each route during `vite build`, snapshots the fully-rendered HTML, and writes it to `dist/<route>/index.html`.

- Requires refactoring routing. HashRouter is incompatible — puppeteer loads `/rooms`, which the app must render as the Rooms page. With HashRouter, `/rooms` falls through to `<Home>` because the router only reads `location.hash`.
- Workaround: mount two routers — `BrowserRouter` for content routes, `HashRouter` mounted only under `/auth/*` for the Supabase callback. Supabase redirect URL stays the same (`/#/auth/callback`) because that lives in `window.location.hash`, not the path. Needs careful testing.
- Pros: fully rendered HTML, images, Helmet tags injected.
- Cons: refactor risk touches `App.tsx` and `index.tsx`; puppeteer adds ~300MB to CI.

## Option B — Static stubs per route (no router change)

Build-time script (Node) that writes N small HTML files to `dist/` — one per public route — each containing: correct `<title>`, meta description, canonical, OG tags, JSON-LD, a `<noscript>` text block with the page's static copy, and a `<script>` that redirects to `/#/<route>` on load. Vercel `rewrites` in `vercel.json` must be made conditional so existing static files are served before falling through to `/index.html`.

- Pros: zero router refactor; keeps HashRouter intact.
- Cons: crawlers see a thin stub that JS-redirects; Googlebot follows JS redirects but quality signal is weaker than a real SSR.
- **Implementation sketch**: a `scripts/generate-stubs.mjs` that reads a route manifest (title/description/JSON-LD per route), templated from `index.html`, runs as a postbuild step via `"build": "vite build && node scripts/generate-stubs.mjs"`. Update `vercel.json` rewrite source to `"/((?!assets/|.*\\.[a-zA-Z0-9]+$).*)"` (already done in this commit) so `.html` files at `dist/rooms.html` etc. are served as-is.

## Option C (RECOMMENDED) — Headless-render at build time against `vite preview`

1. `vite build` normally.
2. Start `vite preview` on a local port.
3. Use Playwright (lighter than puppeteer) to navigate to `http://localhost:4173/#/rooms`, `/#/experiences`, etc., wait for network-idle, `document.documentElement.outerHTML`, and write to `dist/rooms/index.html`, `dist/experiences/index.html`, etc.
4. Each generated file already contains correct Helmet meta, JSON-LD, and the visible content the crawler needs.
5. Add a tiny inline `<script>` at the top of each emitted stub that calls `location.replace('/#' + location.pathname)` so real users land in the SPA at the right route — Googlebot executes the page first and indexes the HTML it sees before the redirect.
6. `vercel.json` rewrite must exclude HTML files (already done in this commit).

This keeps HashRouter for Supabase OAuth, requires no router refactor, and gives crawlers real rendered HTML per route.

## Action for next session

- Install `@playwright/test` (dev dep) and Chromium browser.
- Add `scripts/prerender.mjs` implementing Option C.
- Add postbuild script: `"build": "vite build && node scripts/prerender.mjs"`.
- Verify `curl https://urbanehaauz.com/rooms` returns real `<title>Rooms & Dorms…</title>` after deploy.
- Submit updated sitemap to Google Search Console.

## Until prerender lands

- `public/robots.txt`, `public/sitemap.xml`, `react-helmet-async`, and per-page canonical tags shipped in this session all help once a URL is crawled.
- Canonical URLs currently use `https://urbanehaauz.com/#/path` placeholders. After prerender, flip canonicals to clean `https://urbanehaauz.com/path`.
