# Setup Guide — Urbane Haauz SEO Agent System

## What You're Installing

A Claude Code multi-agent workspace that runs 8 specialized SEO & GEO agents against the `urbanehaauz-website` codebase. Agents can run in parallel, share memory, and produce both code changes and strategy documents.

## Prerequisites

- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- Access to `urbanehaauz/urbanehaauz-website` repo (clone it locally)
- A Claude Pro or Max plan (parallel agents consume tokens fast)

## Installation Steps

### Step 1 — Clone the website repo (if not already done)
```bash
git clone https://github.com/urbanehaauz/urbanehaauz-website.git
cd urbanehaauz-website
```

### Step 2 — Copy the agent system INTO the website repo
```bash
# From wherever you saved this agent system folder:
cp -r urbanehaauz-seo-agents/.claude ./          # Copy agents, skills, commands
cp urbanehaauz-seo-agents/CLAUDE.md ./            # Copy master context
cp urbanehaauz-seo-agents/MARKETING_PROMPT.md ./  # Copy master prompt
mkdir -p docs                                      # Create docs output folder
```

Your repo should now look like:
```
urbanehaauz-website/
├── .claude/
│   ├── agents/
│   │   ├── seo-auditor.md
│   │   ├── geo-optimizer.md
│   │   ├── content-writer.md
│   │   ├── schema-architect.md
│   │   ├── technical-seo.md
│   │   ├── local-seo.md
│   │   ├── keyword-researcher.md
│   │   └── link-builder.md
│   ├── skills/
│   │   ├── pelling-market-context.md
│   │   └── react-vite-seo-patterns.md
│   └── commands/
│       ├── seo-sprint.md
│       ├── fix-meta.md
│       └── write-blog.md
├── CLAUDE.md                 ← master context (auto-loaded by Claude Code)
├── MARKETING_PROMPT.md       ← your starting prompt
├── docs/                     ← agent outputs go here
├── pages/
├── components/
└── ... (rest of website)
```

### Step 3 — Start Claude Code
```bash
cd urbanehaauz-website
claude
```

### Step 4 — Start Your First Session

Paste the contents of `MARKETING_PROMPT.md` as your first message, then say:

```
Run the full SEO sprint.
```

Claude Code will automatically:
- Load CLAUDE.md (property context)
- Load agent definitions from .claude/agents/
- Run seo-auditor first
- Spawn parallel agents for research
- Implement fixes in your codebase
- Produce reports in docs/

## Running Specific Agents

### Slash Commands (quick invocation)
```
/seo-sprint        → Full sprint (all agents)
/fix-meta          → Quick meta tag fix across all pages
/write-blog upper pelling vs lower pelling
```

### Direct Agent Mention
```
@seo-auditor run a quick audit of the pages/ folder
@keyword-researcher what keywords should we target for the DORM page?
@content-writer write a room description for the Premium room
@technical-seo check our robots.txt and fix it
```

### Parallel Agent Run
```
Run @keyword-researcher and @geo-optimizer simultaneously, 
then pass results to @content-writer for the homepage copy
```

## Token Budget Guidance

| Task | Approx Token Use | Recommended Plan |
|------|-----------------|-----------------|
| Quick meta fix | 20–50K | Pro |
| Single blog post | 30–80K | Pro |
| Single agent task | 50–150K | Pro |
| Full sprint (all agents) | 500K–2M | Max |
| Monthly sprint with parallel | 1M–3M | Max |

**Ayan's recommendation**: Run full sprints on Max plan. Run targeted fixes on Pro.

## Commit Strategy

After an agent session, review changes before committing:

```bash
# Review what agents changed
git diff

# Stage and commit agent-generated SEO changes
git add docs/ public/robots.txt public/sitemap.xml
git commit -m "chore(seo): agent sprint - meta tags, robots.txt, sitemap"

# Stage and commit code changes (review carefully first!)
git add components/ pages/ index.html
git commit -m "feat(seo): add JSON-LD schema, meta tags, image lazy loading"

# Push to trigger Vercel deployment
git push origin main
```

## Monthly Sprint Schedule

| Month | Focus | Primary Agents |
|-------|-------|---------------|
| Month 1 | Foundation | seo-auditor, technical-seo, schema-architect, local-seo |
| Month 2 | Content | keyword-researcher, content-writer (4–5 blog posts) |
| Month 3 | GEO + Links | geo-optimizer, link-builder |
| Month 4+ | Iterate | seo-auditor (re-audit), content-writer (new posts) |

## What Agents Can and Cannot Do

### ✅ Agents CAN
- Read and edit all source files in the repo
- Create new files (robots.txt, sitemap.xml, schema files, blog posts)
- Write strategic briefs and reports to docs/
- Fix meta tags, add JSON-LD, update image attributes
- Draft content for human review

### ❌ Agents CANNOT (human must do)
- Submit to Google Business Profile (manual login required)
- Submit to OTA extranets (MakeMyTrip, Booking.com)
- Reach out to bloggers (outreach is human-driven)
- Verify actual GPS coordinates (check on Google Maps)
- Enter real phone numbers, emails (fill in [INSERT_X] placeholders)
- Purchase any tools or subscriptions

## Filling in Placeholders

After any agent run, search for `[INSERT_` in all output files:
```bash
grep -r "\[INSERT_" docs/ pages/ components/ index.html
```

These require human input (phone, email, coordinates, OTA listing URLs).

## Questions?

Ayan leads this system. Shovit to action OTA submissions and GBP. Souvik to review and approve content strategy before publishing.
