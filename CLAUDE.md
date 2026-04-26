# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Urbane Haauz is a boutique hotel management system for a hotel in Pelling, Sikkim. It serves dual purposes: a public-facing booking site for guests and a private admin dashboard for hotel management.

## Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build to dist/
npm run preview      # Preview production build

# Remotion video generation (marketing videos)
npm run remotion:studio          # Open Remotion Studio
npm run remotion:render:hero     # Render hero video
npm run remotion:render:full     # Render full marketing video
npm run remotion:render:all      # Render all videos
```

No test suite exists in this project.

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

`GEMINI_API_KEY` is referenced in `vite.config.ts` but not yet used in the app.

## Architecture

### Routing
Uses **HashRouter** (not BrowserRouter). This is intentional — Supabase OAuth redirects use `/#/auth/callback` format. Do not change to BrowserRouter.

Routes: `/`, `/rooms`, `/experiences`, `/book`, `/contact`, `/my-bookings`, `/admin`, `/admin/login`, `/auth/callback`

Admin routes suppress the Navbar footer, WhatsApp button, and language switcher.

### Context Provider Hierarchy

```
AuthProvider          ← Supabase auth state, isAdmin flag
  └── LanguageProvider  ← en/hi i18n, persisted in localStorage
        └── AppProvider   ← All data (rooms, bookings, staff, etc.)
```

**AppContext depends on AuthContext** — it reads `isAdmin` and `user` to scope data fetching. Data for staff, investments, expenses, and financial tracker only loads when `isAdmin` is true.

### Admin Authorization

Admin status is determined in [context/AuthContext.tsx](context/AuthContext.tsx):
1. Primary: `user_profiles.is_admin` column in Supabase
2. Fallback: `user.user_metadata.is_admin === true`

The `loginAdmin`/`logoutAdmin` methods in AppContext are deprecated stubs — use AuthContext's `signIn`/`signOut` instead.

### Database Column Mapping

Supabase uses `snake_case`; TypeScript types use `camelCase`. All mapping is done inside `AppContext.tsx`. For example: `guest_name` → `guestName`, `max_occupancy` → `maxOccupancy`, `check_in` → `checkIn`.

### Key Supabase Tables

| Table | Access |
|-------|--------|
| `rooms` | Public read (requires RLS policy: `USING (true)`) |
| `bookings` | Public insert; users see own rows; admins see all |
| `staff`, `tasks` | Admin only |
| `investments`, `expenses` | Admin only |
| `financial_tracker_daily` | Admin only |
| `settings` | Public read (`home_hero_image` key), admin write |
| `user_profiles` | Used for `is_admin` flag |
| `seasonal_pricing`, `promo_codes` | Used in booking flow |

### Real-time Updates

`AppContext` subscribes to Supabase real-time on the `bookings` table via `postgres_changes`. The subscription is cleaned up on unmount.

### Financial Tracker Logic

The `calculateFinancialMetrics` function in AppContext implements a specific formula:
- `G = (B×D) + (E×C) + F` — per-day inflow
- Monthly inflow = `G × days_in_month`
- Gross Profit (EBITDA) = Monthly inflow − (H + I)
- Net Profit = EBITDA − (K + L + M + N)
- Break-even target is ₹3,00,000/month

### i18n

Supports English (`en`) and Hindi (`hi`). Translations live in [lib/i18n/translations.ts](lib/i18n/translations.ts). Use the `useLanguage()` hook and access strings via `t.keyName`.

### Input Validation

All user-facing form inputs must go through [lib/security/validation.ts](lib/security/validation.ts). It provides `validateEmail`, `validatePhone`, `validateName`, `validateText`, `validateDate`, `validateBookingForm`, and a client-side `checkRateLimit`.

### Deployment

- **Platform**: Vercel (auto-deploy on push to `main`)
- **Production**: urbanehaauz.com
- Config: [vercel.json](vercel.json) — all routes rewrite to `index.html`, security headers set
- SQL migration scripts: `database/sql/`
- Setup docs: `docs/`
