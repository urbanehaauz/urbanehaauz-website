# /fix-meta — Quick Meta Tag Fix for All Pages

Fast command: scan the codebase, find all pages missing proper meta tags, and fix them immediately using the keyword brief.

## Steps

1. Read `docs/KEYWORD_BRIEF.md` for target keywords per page (if it exists)
2. Use `Glob` to find all page components in `pages/`
3. For each page, check if it has: title tag, meta description, og:title, og:description, canonical
4. For any page missing these, write them now using this template:

**Homepage** target keyword: "boutique hotel upper pelling kanchenjunga view"
**Rooms page** target keyword: "hotel rooms pelling sikkim"
**Standard Room** target keyword: "standard room pelling hotel"
**Deluxe Room** target keyword: "deluxe room mountain view pelling"
**Premium Room** target keyword: "premium room kanchenjunga view pelling sikkim"
**DORM** target keyword: "dorm hostel bed pelling sikkim"
**Booking** target keyword: "book hotel pelling direct"
**About** target keyword: "about urbane haauz boutique hotel pelling"
**Contact** target keyword: "contact urbane haauz pelling hotel"
**Blog** target keyword: "pelling sikkim travel blog"

5. Implement using `react-helmet-async` pattern (see skill: react-vite-seo-patterns)
6. Report which pages were updated
