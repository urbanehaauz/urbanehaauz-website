# Urbane Haauz — SEO & GEO Optimization Agent System

## Project Identity

**Property**: Urbane Haauz Boutique Hotel  
**Location**: Upper Pelling, Sikkim, India  
**Website**: https://urbanehaauz.com (repo: urbanehaauz/urbanehaauz-website)  
**Stack**: React + TypeScript + Vite + Tailwind CSS + Supabase + Vercel  
**Domain**: urbanehaauz.com (Namecheap DNS)

## What This System Does

This Claude Code workspace runs a coordinated team of SEO and GEO (Generative Engine Optimization) agents against the Urbane Haauz website codebase. Agents can run in parallel or sequentially depending on the task.

## Property Context (Always Load)

- **8 rooms**: Standard, Deluxe, Premium categories + DORM beds
- **USP**: Upper Pelling commands 20–30% premium over lower Pelling due to **Kanchenjunga mountain views** — this is the #1 differentiator
- **F&B**: Restaurant + small bar; CP/MAP meal plans (rare among Pelling competitors)
- **Primary market**: Bengali/Bihari families from Kolkata; budget backpackers (DORM)
- **Secondary market**: OTA travelers (MakeMyTrip, Booking.com, Agoda)
- **Peak season rates**: ₹1,800–3,900 | Off-season: ₹1,200–3,100
- **B2B**: Travel agent commissions 15–18%
- **PMS**: RunHotels (channel manager + PMS)
- **Payment**: Razorpay direct booking
- **Languages**: English primary; Bengali secondary audience

## Agent Roster

| Agent | File | When to invoke |
|-------|------|----------------|
| seo-auditor | `.claude/agents/seo-auditor.md` | Full site SEO audit |
| geo-optimizer | `.claude/agents/geo-optimizer.md` | AI answer engine optimization |
| content-writer | `.claude/agents/content-writer.md` | SEO blog posts, landing pages, meta copy |
| schema-architect | `.claude/agents/schema-architect.md` | Structured data / JSON-LD |
| technical-seo | `.claude/agents/technical-seo.md` | Core Web Vitals, sitemap, robots, performance |
| local-seo | `.claude/agents/local-seo.md` | Google Business, local citations, map pack |
| keyword-researcher | `.claude/agents/keyword-researcher.md` | Keyword gaps, OTA keyword analysis |
| link-builder | `.claude/agents/link-builder.md` | Backlink strategy, travel PR outreach |

## Orchestration Rules

1. **Always start** with `seo-auditor` before any other agent on first run
2. **Parallel-safe**: `keyword-researcher` + `geo-optimizer` + `local-seo` can run simultaneously
3. **Sequential**: `schema-architect` must run AFTER `seo-auditor` has completed its page inventory
4. **Content pipeline**: `keyword-researcher` → `content-writer` (pass keyword brief)
5. Sub-agents return summaries; parent agent consolidates into `/docs/SEO_REPORT.md`

## File Paths in the Website Repo

```
urbanehaauz-website/
├── pages/          ← Next.js / Vite page components (target for meta tags)
├── components/     ← React components (target for semantic HTML)
├── public/         ← Static assets (target for robots.txt, sitemap.xml)
├── index.html      ← Root HTML (target for title, og:tags, structured data)
└── vite.config.ts  ← Build config (target for performance optimizations)
```

## Output Conventions

- All audit reports → `docs/SEO_REPORT.md`
- All keyword research → `docs/KEYWORD_BRIEF.md`  
- All GEO content → `docs/GEO_BRIEF.md`
- All schema JSON-LD → `docs/schema/` folder
- All content drafts → `docs/content/` folder
- Implementation patches → edit actual source files with `Write`/`Edit` tools

## Key Competitors for Benchmarking

- Elgin Mount Pandim (upper Pelling, premium tier)
- Hotel Garuda (mid-tier Pelling)
- The Norbu Ghang Resort (mountain view competitor)
- Generic OTA listings on MakeMyTrip for "Pelling hotels"

## Non-Negotiables

- Never recommend purchased contact databases or black-hat link schemes
- All structured data must validate at schema.org validator
- All content must be factually accurate to the property (8 rooms, Upper Pelling, Kanchenjunga view)
- Bengali-language meta variants should be flagged for human review before publishing
