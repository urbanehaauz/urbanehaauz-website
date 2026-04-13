# /daily-content

Generate today's social media content for Urbane Haauz and send it to Telegram for approval.

## What this command does

1. Read `marketing/config.ts` to determine today's voice (warm/founder/practical) and theme (seasonal/bengali/weekend/practical)
2. Check if a Bengali festival content window is active — if so, override the theme
3. Check the current Pelling season for visual mood cues
4. Generate an Instagram post: English caption + Bengali translation + image prompt + hashtags
5. Generate a GBP post variant (shorter, CTA-focused)
6. Insert both into Supabase `marketing_content` table with status `pending_approval`
7. Send a formatted preview to the Telegram Marketing Bot

## Steps

### Step 1: Determine today's content parameters
Read `marketing/config.ts` and call `getVoiceForDate(new Date())` and `getThemeForDate(new Date())`. Check `isInFestivalWindow(new Date())` for festival overrides.

### Step 2: Generate content
Use the `content-generator` agent (at `.claude/agents/content-generator.md`) to produce the post. Pass it the voice, theme, season, and any festival context.

### Step 3: Write to Supabase
Use `mcp__plugin_supabase_supabase__execute_sql` to insert the generated content:
```sql
INSERT INTO marketing_content (content_type, theme, voice, language, title, body_en, body_bn, image_prompt, hashtags, platform, scheduled_date, status)
VALUES ('instagram', $theme, $voice, 'en', $title, $body_en, $body_bn, $image_prompt, $hashtags, 'instagram', CURRENT_DATE, 'pending_approval');
```

### Step 4: Send Telegram preview
Use `mcp__plugin_telegram_telegram__reply` to send a formatted preview to the marketing chat. Include:
- The full English caption
- The Bengali translation
- The image prompt (so founder can generate the image)
- Instructions: "Reply APPROVE to post, REJECT to revise"

### Step 5: Also generate GBP post (if Wednesday)
On Wednesdays, also generate a Google Business Profile post and send separately.

## Usage
```
/daily-content
```
No arguments needed — the command auto-detects the date, voice, theme, and season.
