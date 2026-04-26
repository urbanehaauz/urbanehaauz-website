import { corsHeaders } from '../_shared/cors.ts';

// Proxies Anthropic Messages API with the web_search tool so the Pelling After Dark
// "Proof of Concept" section can fetch real case-study images + stats at render time.
// ANTHROPIC_API_KEY stays in Supabase secrets — never exposed to the browser.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const PROMPT = `You are a research assistant. For each of these cultural tourism destinations, return a JSON array with: location name, one verified statistic about cultural tourism economic impact, one real publicly accessible image URL of the cultural event or location, a 2-sentence description, and a canonical reference URL.

CRITICAL for the "url" field: it must be a page that SHOWS the nightlife / cultural experience with photos on it (e.g. a Wikipedia article with gallery, the cultural center's official live-entertainment page, or an editorial article with embedded images). DO NOT use generic government tourism board homepages (like tourism.rajasthan.gov.in/ or keralatourism.org/ root) — those are landing pages with no specific content about the cultural experience. Pick pages where a reader lands directly on photos and descriptions of the performances, architecture, or festival.

Locations:
1) Rajasthan folk cultural shows (Jaipur/Pushkar) — e.g. Chokhi Dhani's live entertainment page
2) Kerala Kathakali cultural tourism — e.g. Kerala Kathakali Centre Fort Kochi official site
3) Dubai Al Seef cultural district — e.g. Wikipedia Al Seef article, or an editorial with night-lit waterfront photos
4) Kandy Esala Perahera Sri Lanka — e.g. Wikipedia Kandy Esala Perahera article

Schema for each item: { "name": string, "stat": string, "image": string (full https URL), "description": string, "url": string (full https URL to a page that shows the cultural experience with photos) }.

Return ONLY valid JSON array, no markdown, no prose, no code fences.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropicRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: PROMPT }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, err);
      return new Response(JSON.stringify({ error: 'Anthropic API request failed', status: anthropicRes.status }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await anthropicRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('claude-research error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
