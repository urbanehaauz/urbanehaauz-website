# 01 · Wikidata Item

**Why this is #1:** Wikidata is the structured-data backbone every major LLM (ChatGPT, Claude, Gemini, Perplexity, Llama) was trained on. Once Urbane Haauz has a Wikidata Q-number, AI engines will start treating us as a "real" entity they can quote.

**Time:** 25–30 minutes
**Cost:** Free
**Account needed:** Wikimedia account (free, instant) — same account works for Wikipedia, Wikivoyage, Commons. Create at https://www.wikidata.org/wiki/Special:CreateAccount

---

## Step 1 — Create the item

1. Go to **https://www.wikidata.org/wiki/Special:NewItem**
2. Sign in
3. Fill the form:

| Field | Paste this |
|---|---|
| Label (English) | `Urbane Haauz` |
| Description (English) | `boutique hotel in Upper Pelling, Sikkim, India` |
| Aliases | `Urbane Haauz Boutique Hotel`<br>`Urbane Hauz` |

4. Click **Create**. Wikidata gives the item a Q-number (e.g. `Q12345678`). **Write it down.**

---

## Step 2 — Add statements (one at a time, on the new item page)

For each row below, click "**+ add statement**", type the property name (Wikidata will autocomplete), then paste the value.

| Property (P) | Value |
|---|---|
| `instance of` (P31) | `hotel` (Q27686) |
| `instance of` (P31) | `boutique hotel` (Q2188189) — add as a *second* P31 statement |
| `country` (P17) | `India` (Q668) |
| `located in the administrative territorial entity` (P131) | `Pelling` (Q3375518) — search for Pelling, Sikkim |
| `coordinate location` (P625) | (Get the exact lat/long from Google Maps app — long-press the property pin, copy the coords. Format: `27.3167, 88.2395` — replace with your verified pin) |
| `official website` (P856) | `https://urbanehaauz.com` |
| `phone number` (P1329) | `+91 91360 32524` |
| `email address` (P968) | `urbanehaauz@gmail.com` |
| `inception` (P571) | (Year the hotel opened — e.g. `2024` or `2025`. Use "year" precision.) |
| `number of rooms` (P5670) | `8` |
| `image` (P18) | (Skip for now — needs a Wikimedia Commons upload first. Add later via file 01b.) |

---

## Step 3 — Add identifiers (later, as you create them)

Come back to the Wikidata item later and add:

- `Google Knowledge Graph ID` (P2671) — once GBP is verified
- `OpenStreetMap node ID` (P11693) — after step 02
- `TripAdvisor ID` (P3134) — once listed
- `Booking.com hotel ID` (P5085) — once listed
- `Instagram username` (P2003) → `urbanehaauz`
- `Facebook ID` (P2013) → `urbanehaauz`

Each external ID you add is another piece of evidence to LLMs that we're real.

---

## Step 4 — Save & verify

- Wikidata auto-saves on each statement.
- View your new item at: `https://www.wikidata.org/wiki/Q[your-number]`
- Within 24–48 hours, the item will be picked up by Wikidata's Linked Data API, and within ~2–4 weeks LLMs that re-crawl Wikidata (Perplexity does this often) will start seeing us.

---

## Pitfalls to avoid

- **Do NOT add promotional language.** ("luxury", "best", "stunning") — Wikidata is factual only. It will get reverted.
- **Do NOT invent dates.** If you don't know the inception year, leave it out.
- **Do NOT skip the coordinate.** This is the single most useful field for AI tools.
- **Do NOT add a star rating** unless it's officially registered with Sikkim Tourism Department.

---

## After you save

Paste the Q-number here and tell me — I'll wire it into the JSON-LD on the website (`sameAs` array) so Google and other LLMs can connect the website to the Wikidata entity in both directions.
