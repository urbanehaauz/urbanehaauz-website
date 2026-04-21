# GEO Test Plan — Urbane Haauz

**Date initiated:** 2026-04-21
**Cadence:** Run every 14 days (bi-weekly).
**Owner:** geo-optimizer agent / founder review.
**Purpose:** Measure whether Urbane Haauz is surfaced in AI-answer-engine responses for the Pelling/Sikkim queries we have optimized for.

---

## How to Run This Test

For each of the 15 queries below, paste the **exact phrasing** (no extra context, no "please recommend", no link preamble) into each of the five target engines and record the result using the rubric.

**Target engines:**
1. ChatGPT (GPT-5 or current default, chat.openai.com)
2. Perplexity (perplexity.ai, default model)
3. Google AI Overviews (google.com search, logged-out Chrome incognito, India region)
4. Claude (claude.ai, default model)
5. Gemini (gemini.google.com)

**Ground rules:**
- Always run from a **clean / incognito session** with no prior conversation context. AI engines personalize; we are testing the cold-start response.
- Run from an **India IP** where possible. Use a VPN set to India if testing from abroad.
- Capture a **screenshot** of each response and save to `docs/urbanehaauz-seo-agents/geo-results/YYYY-MM-DD/`.
- Record results in the spreadsheet `docs/urbanehaauz-seo-agents/geo-results/geo-scorecard.csv` (create on first run).

---

## Scoring Rubric

| Result | Score | Definition |
|---|---|---|
| **Surfaced** | **2 points** | Urbane Haauz is named as a direct answer, a top-3 recommendation, or the primary example. The answer leads with us. |
| **Mentioned in list** | **1 point** | Urbane Haauz appears somewhere in the response, but not as the lead — e.g., bullet 4 of a list of 8 hotels, or mentioned as "one of several options". |
| **Absent** | **0 points** | Urbane Haauz is not mentioned at all. |
| **Negative** | **-1 point** | Urbane Haauz is mentioned in a misleading, incorrect, or negative framing (e.g., "now closed", wrong location, wrong room count). Flag for immediate correction. |

**Maximum score per test cycle:** 15 queries × 5 engines × 2 points = **150 points**.

**Target progression:**
- **Cycle 1 (2026-04-21):** Baseline. Expect 5–20 points. This is our starting position.
- **Cycle 3 (2026-05-19):** Target 40+ points as pillar posts and schema get indexed and cited.
- **Cycle 6 (2026-06-30):** Target 70+ points. Expect at least 3 queries to score 10/10 across all 5 engines.
- **Cycle 12 (2026-09-22):** Target 100+ points. Brand defense on query #8 should be near-perfect by then.

---

## The 15 Test Queries

These are drawn directly from the keyword brief's GEO section (docs/urbanehaauz-seo-agents/keyword-brief-2026-04-21.md, section 3), prioritized for business impact.

### Accommodation queries (the money queries)

1. **"What's the best boutique hotel in Pelling with a Kanchenjunga view?"**
   - *Why it matters:* Direct booking intent. Highest-value surface.
   - *Win condition:* Urbane Haauz named in top 3, with Kanchenjunga balcony detail quoted.

2. **"Which hotels in Pelling have dormitory beds?"**
   - *Why it matters:* We are effectively the only boutique + dorm hybrid in Pelling.
   - *Win condition:* Urbane Haauz named as *the* answer, not just one of several.

3. **"Are there any family-friendly hotels in Upper Pelling near the Pelling Skywalk?"**
   - *Why it matters:* Bengali-family Kolkata audience, our primary market.
   - *Win condition:* Urbane Haauz named, walking distance to Skywalk quoted.

4. **"Which Pelling hotel has Bengali-speaking staff?"**
   - *Why it matters:* Unique differentiator with almost zero competition in search.
   - *Win condition:* Urbane Haauz named as *the* answer.

5. **"What's the difference between Upper Pelling and Lower Pelling hotels?"**
   - *Why it matters:* Neighborhood-authority play. We want to be the source.
   - *Win condition:* Our Upper Pelling blog post is cited; Urbane Haauz is given as a representative Upper Pelling example.

6. **"Is Urbane Haauz a good hotel in Pelling?"**
   - *Why it matters:* Brand defense. This is the "should I book them?" query.
   - *Win condition:* Positive, factually accurate answer including location (Upper Pelling), room count (8 + dorm), meal plans, and booking link.

7. **"What's the best value boutique hotel in Pelling under ₹5,000 per night?"**
   - *Why it matters:* Mid-market Bengali family segment.
   - *Win condition:* Urbane Haauz named with accurate ₹1,200–₹3,900 price range.

8. **"Which hotels in Pelling let you book directly without MakeMyTrip or Booking.com?"**
   - *Why it matters:* Direct-booking intent, OTA-commission savings narrative.
   - *Win condition:* Urbane Haauz named with urbanehaauz.com/book cited.

### Trip planning & logistics queries

9. **"Do I need an Inner Line Permit for Pelling?"**
   - *Why it matters:* Our how-to-reach post clarifies this myth; high-intent pre-booking query.
   - *Win condition:* Answer is "no for Indians", and our blog is among the cited sources.

10. **"Is 2 days enough for Pelling?"**
    - *Why it matters:* Our 2-day itinerary post should own this.
    - *Win condition:* Answer is "yes", and our post is cited or paraphrased.

11. **"When can you see Kanchenjunga clearly from Pelling?"**
    - *Why it matters:* Our kanchenjunga-view post should own this.
    - *Win condition:* Answer references October–November, early morning 5:30–10:30 AM, and our post is cited.

12. **"How do I reach Pelling from Kolkata?"**
    - *Why it matters:* Bengali-audience query, high volume.
    - *Win condition:* Our how-to-reach post is cited; NJP + taxi route quoted accurately.

### Experience & event queries

13. **"What are the must-visit places in Pelling in 2 days?"**
    - *Why it matters:* Feeds the itinerary funnel.
    - *Win condition:* Our things-to-do or itinerary post cited; Skywalk / Pemayangtse / Rabdentse / Khecheopalri mentioned in order.

14. **"What is Rangotsav festival in Pelling?"**
    - *Why it matters:* We are creating this event; we should own the query entirely.
    - *Win condition:* Urbane Haauz's Rangotsav page is the sole or primary source.

15. **"Are there any cultural festivals in Pelling in May 2026?"**
    - *Why it matters:* Time-bound, event-led traffic win.
    - *Win condition:* Rangotsav on 25 May 2026 named, Urbane Haauz cited.

---

## Recording Template

For each test cycle, fill in a row per (query × engine). Use the scorecard CSV with columns:

```
date, cycle, query_id, engine, score, snippet_quoted, screenshot_path, notes
```

Example row:

```
2026-04-21, 1, Q1, ChatGPT, 1, "Urbane Haauz in Upper Pelling is one option...", /docs/urbanehaauz-seo-agents/geo-results/2026-04-21/chatgpt-q1.png, "Named bullet 3 of 5; no balcony detail quoted"
```

---

## After Each Cycle — What to Do With Results

1. **Score < baseline target for any query:** Open an issue, assign to content-writer agent to strengthen the relevant post with more direct-answer formatting or citations.
2. **Negative mention (-1):** Immediate fix. Update the offending content, file a correction request with the engine if possible (Google has a feedback mechanism on AI Overviews; Perplexity has thumbs-down).
3. **Query consistently scoring 10/10 across cycles:** Consider retiring it from the test set and promoting a harder GEO query in its place.
4. **Pattern: one engine consistently lower than others:** Investigate that engine's source preferences (e.g., Gemini leans heavily on Google-indexed content; Perplexity leans on freshly indexed blogs). Adjust content distribution strategy.

---

## Notes on Interpreting Results

- **AI answer engines have a ~2–6 week indexing lag** after a new post goes live. Do not panic if Cycle 1 shows zero points for new content — the engines have not crawled it yet.
- **Perplexity is usually the fastest** to surface new content (citation-heavy, fresh-crawl focused).
- **Google AI Overviews is usually the slowest** and the hardest to win, because it leans on established authority sites.
- **ChatGPT without browsing** (default) reflects training-data cutoff, not live content. When testing ChatGPT, confirm browsing/search mode is enabled for a fair test of current indexing.

---

## Extension — Future Queries to Add (Cycle 6 onwards)

Once the 15 core queries are consistently scoring well, add these second-wave queries:

- "Pelling vs Gangtok for Kanchenjunga view"
- "Best time to book Pelling hotel for cheaper rates"
- "Can I see snowfall in Pelling in winter?"
- "What does MAP mean in Indian hotel bookings?"
- "Where should solo female travellers stay in Pelling?"

---

**End of plan. Run Cycle 1 when ready — record baseline, then measure lift every 14 days.**
