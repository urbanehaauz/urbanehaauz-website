# Urbane Haauz — SEO & GEO Agent System

Multi-agent Claude Code workspace for SEO and Generative Engine Optimization (GEO) of urbanehaauz.com.

## Quick Start

```bash
# 1. Copy .claude/ folder and CLAUDE.md into your website repo
# 2. cd urbanehaauz-website && claude
# 3. Paste MARKETING_PROMPT.md and say "Run the full SEO sprint"
```

See `SETUP.md` for full installation instructions.

## Agent System

```
8 Specialized Agents:
├── seo-auditor        → Master audit (run first)
├── keyword-researcher → Keyword gaps & content planning
├── geo-optimizer      → AI answer engine optimization
├── content-writer     → Blog posts, room copy, meta tags
├── schema-architect   → JSON-LD structured data
├── technical-seo      → robots.txt, sitemap, Core Web Vitals
├── local-seo          → Google Business, map pack, OTA listings
└── link-builder       → Backlinks, blogger outreach, PR

2 Skills (loaded on demand):
├── pelling-market-context    → Competitor & audience data
└── react-vite-seo-patterns   → Code patterns for the stack

3 Commands:
├── /seo-sprint        → Full sprint orchestration
├── /fix-meta          → Quick meta tag sweep
└── /write-blog [topic]→ Single blog post production
```

## Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Auto-loaded context — property facts, agent roster |
| `MARKETING_PROMPT.md` | Paste this to start any Claude Code session |
| `SETUP.md` | Installation guide |
| `.claude/agents/*.md` | Agent definitions |
| `.claude/skills/*.md` | On-demand skill context |
| `.claude/commands/*.md` | Slash command definitions |
| `docs/` | All agent output goes here |

## Maintained By

Ayan — Technology & Marketing, Urbane Haauz
