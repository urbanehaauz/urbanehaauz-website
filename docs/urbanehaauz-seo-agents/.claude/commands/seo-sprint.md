# /seo-sprint — Full SEO & GEO Optimization Run

Run a complete SEO + GEO optimization sprint for Urbane Haauz. This command orchestrates all agents in the correct sequence, running parallel agents simultaneously where safe.

## What This Does

Executes a full optimization cycle:
1. **Audit** → understand current state
2. **Research** → find keyword and GEO opportunities (parallel)
3. **Implement** → fix technical issues, add schema, improve content
4. **Document** → produce reports for Ayan/Souvik/Shovit

## Execution Plan

### Phase 1 — Audit (Sequential, must complete first)
```
Use the @seo-auditor agent to:
- Crawl all pages in the codebase
- Produce the full SEO audit report to docs/SEO_REPORT.md
- Identify the top 10 critical issues
- List all pages missing meta tags
- Report back a summary when done
```

### Phase 2 — Parallel Research (Run simultaneously after Phase 1)
Once seo-auditor completes, spawn THREE agents in parallel:

```
Spawn in background:
1. @keyword-researcher → analyze keyword opportunities, write docs/KEYWORD_BRIEF.md
2. @geo-optimizer → analyze GEO gaps, write docs/GEO_BRIEF.md  
3. @local-seo → audit NAP consistency, write docs/LOCAL_SEO_BRIEF.md
```

### Phase 3 — Implementation (After Phase 2)
```
Sequential implementation:
1. @technical-seo → fix robots.txt, sitemap, Vite config, image optimization
2. @schema-architect → implement JSON-LD (reads seo-auditor memory for page list)
3. @content-writer → draft meta tags for all pages missing them (reads keyword-researcher output)
```

### Phase 4 — Backlink Strategy
```
@link-builder → produce docs/LINK_BUILDING_BRIEF.md with outreach templates
```

## Final Output

After all agents complete, produce a summary in `docs/SPRINT_SUMMARY.md`:

```markdown
# SEO Sprint Summary — [Date]

## What Was Fixed
[List of actual code changes made]

## What Was Drafted (Needs Review)
[Content, copy, strategy docs requiring founder review]

## Critical Actions for Founders (This Week)
[Numbered list of manual tasks Ayan/Shovit/Souvik need to do]

## Expected Impact (3-6 months)
[Realistic expectations based on what was implemented]

## Next Sprint Recommendation
[What to run next time]
```

---
*Run this monthly. First run will take longest. Subsequent runs are faster as agents build memory.*
