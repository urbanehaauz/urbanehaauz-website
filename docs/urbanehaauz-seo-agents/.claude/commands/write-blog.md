# /write-blog [topic] — Write an SEO Blog Post

Write a fully optimized blog post for Urbane Haauz on the given topic.

## Usage
```
/write-blog upper pelling vs lower pelling
/write-blog best time to visit pelling
/write-blog kanchenjunga view hotel guide
```

## Steps

1. Check `docs/KEYWORD_BRIEF.md` for the target keyword and key points for this topic
2. Use the @content-writer agent to write the full post
3. Save to `docs/content/blog/[slug].md`
4. Include at the top of the file:
   - Target keyword
   - Meta title (≤60 chars)
   - Meta description (≤155 chars)
   - Suggested URL slug
   - Internal links to include
5. After writing, suggest where in the codebase the blog component/page should be updated

## Quality Bar
- Minimum 800 words
- At least 3 H2 subheadings
- One mention of direct booking at urbanehaauz.com
- One factual anchor (distance, altitude, date, price)
- No claims that can't be verified
