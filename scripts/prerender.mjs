// scripts/prerender.mjs
//
// Generates static HTML stubs for every public route after `vite build`.
//
// Why: the site is a Vite + React BrowserRouter SPA. Vercel rewrites every
// path to /index.html, so non-JS-executing crawlers (SEOptimer, Screaming
// Frog free, GPTBot, ClaudeBot, PerplexityBot) see the same empty SPA shell
// for every route. This script writes per-route HTML with proper title,
// description, canonical, OG tags, JSON-LD, an H1 and an above-the-fold
// noscript body — so crawlers can index each route independently.
//
// Users still get the live React app: when JS executes, React mounts into
// `<div id="root">` exactly as before. The noscript content is invisible to
// users and ignored by hydration.
//
// Source of truth for per-route metadata: lib/seo/routes-meta.ts.
// Blog post metadata is read directly from content/blog/*.md frontmatter.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://urbanehaauz.com';

// ---------- 1. read /lib/seo/routes-meta.ts (compile-free) ---------------- //
// We avoid spinning up tsc just for this file. The TS source is plain
// JS-compatible apart from the interface declaration; we strip it out.

const readRoutesMeta = async () => {
  const src = await fs.readFile(
    path.join(ROOT, 'lib', 'seo', 'routes-meta.ts'),
    'utf-8',
  );
  // Drop the interface block + the `import type` lines + the `export` keyword
  // so the file evaluates as plain JS. We then `Function`-eval the rest.
  let js = src
    .replace(/export interface RouteMeta\s*\{[\s\S]*?\n\}\n/g, '')
    .replace(/:\s*RouteMeta\[\]/g, '')
    .replace(/export const ROUTES_META/g, 'const ROUTES_META');
  js += '\n;return ROUTES_META;';
  return new Function(js)();
};

// ---------- 2. read & parse every blog post -------------------------------- //

const parseFrontmatter = (raw) => {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) throw new Error('Blog post missing frontmatter');
  const data = {};
  for (const line of m[1].split('\n')) {
    const km = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!km) continue;
    const [, key, raw] = km;
    const v = raw.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      try {
        data[key] = JSON.parse(v.replace(/'/g, '"'));
      } catch {
        data[key] = v
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^"|"$/g, ''));
      }
    } else if (v.startsWith('"') && v.endsWith('"')) {
      data[key] = v.slice(1, -1);
    } else {
      data[key] = v;
    }
  }
  return { data, body: m[2].trim() };
};

const readAllBlogPosts = async () => {
  const dir = path.join(ROOT, 'content', 'blog');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
  const posts = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(dir, f), 'utf-8');
    const { data, body } = parseFrontmatter(raw);
    if (!data.slug) data.slug = f.replace(/\.md$/, '');
    posts.push({ ...data, body });
  }
  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return posts;
};

// ---------- 3. minimal markdown -> HTML (mirrors lib/blog.ts) ------------- //

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const inline = (s) => {
  let out = escapeHtml(s);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, h) => {
    const ext = /^https?:\/\//i.test(h);
    return `<a href="${h}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${t}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
};

const isTableDivider = (l) =>
  /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(l);

const renderMarkdown = (md) => {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const buf = [];
  const flush = () => {
    const j = buf.join(' ').trim();
    if (j) out.push(`<p>${inline(j)}</p>`);
    buf.length = 0;
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      flush();
      i++;
      continue;
    }
    if (/^---+\s*$/.test(line)) {
      flush();
      out.push('<hr />');
      i++;
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flush();
      out.push(`<h${h[1].length}>${inline(h[2].trim())}</h${h[1].length}>`);
      i++;
      continue;
    }
    if (line.startsWith('> ')) {
      flush();
      const q = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        q.push(lines[i].slice(2));
        i++;
      }
      out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flush();
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      out.push('<ul>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ul>');
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      flush();
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      out.push('<ol>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ol>');
      continue;
    }
    if (line.trim().startsWith('|') && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      flush();
      const parseRow = (r) =>
        r
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());
      const head = parseRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      const thead = '<thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead>';
      const tbody =
        '<tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody>';
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }
    buf.push(line);
    i++;
  }
  flush();
  return out.join('\n');
};

// ---------- 4. HTML transformation ---------------------------------------- //

const replaceHead = (html, replacements) => {
  let out = html;

  // <title>
  out = out.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(replacements.title)}</title>`,
  );

  // <meta name="description">
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(replacements.description)}" />`,
  );

  // <link rel="canonical">
  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${replacements.canonical}" />`,
  );

  // og:title — match either property="og:title" form
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(replacements.title)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(replacements.description)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${replacements.canonical}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${replacements.ogImage}" />`,
  );
  if (replacements.ogType) {
    if (/<meta\s+property="og:type"/i.test(out)) {
      out = out.replace(
        /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:type" content="${replacements.ogType}" />`,
      );
    } else {
      out = out.replace(
        /(<meta\s+property="og:image"[^>]*>)/i,
        `$1\n    <meta property="og:type" content="${replacements.ogType}" />`,
      );
    }
  }

  // twitter:title / twitter:description / twitter:image
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(replacements.title)}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(replacements.description)}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${replacements.ogImage}" />`,
  );

  return out;
};

const buildNoscriptBlock = ({ h1, lede, keyFacts, articleHtml }) => {
  const ledeHtml = lede.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
  const factsHtml = keyFacts
    ? `<ul>${keyFacts.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`
    : '';
  const article = articleHtml ? `<article>${articleHtml}</article>` : '';
  return `<noscript><div class="seo-fallback"><h1>${escapeHtml(h1)}</h1>${ledeHtml}${factsHtml}${article}</div></noscript>`;
};

const insertNoscriptIntoBody = (html, noscript) => {
  // Place the noscript block immediately inside <body>, before <div id="root">.
  return html.replace(
    /(<div\s+id="root"[^>]*>)/i,
    `${noscript}\n    $1`,
  );
};

const insertJsonLd = (html, jsonLdArray) => {
  if (!jsonLdArray || jsonLdArray.length === 0) return html;
  const scripts = jsonLdArray
    .map(
      (obj) =>
        `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`,
    )
    .join('\n    ');
  // Insert before </head>
  return html.replace(/<\/head>/i, `${scripts}\n  </head>`);
};

// ---------- 5. blog post helpers ------------------------------------------ //

const buildBlogPostJsonLd = (post) => {
  const canonical = `${SITE}/blog/${post.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      headline: post.title,
      description: post.description,
      image: `${SITE}${post.image}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : post.keywords,
      author: { '@type': 'Organization', name: 'Urbane Haauz', url: SITE },
      publisher: {
        '@type': 'Organization',
        name: 'Urbane Haauz',
        logo: { '@type': 'ImageObject', url: `${SITE}/logo-uh.png` },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
      ],
    },
  ];
};

// ---------- 6. main ------------------------------------------------------- //

const main = async () => {
  console.log('🔧 prerender: starting');
  const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf-8');
  const routesMeta = await readRoutesMeta();
  const blogPosts = await readAllBlogPosts();

  let written = 0;

  // 6a. landing routes from routes-meta.ts (skip "/" — keep dist/index.html as-is for home)
  for (const route of routesMeta) {
    if (route.path === '/') {
      // Update the home shell in place (no extra dir needed)
      const noscript = buildNoscriptBlock({
        h1: route.h1,
        lede: route.lede,
        keyFacts: route.keyFacts,
      });
      let html = replaceHead(template, route);
      html = insertNoscriptIntoBody(html, noscript);
      await fs.writeFile(path.join(DIST, 'index.html'), html, 'utf-8');
      written++;
      console.log(`  ✓ / (overwrote dist/index.html)`);
      continue;
    }
    const dir = path.join(DIST, route.path.replace(/^\//, ''));
    await fs.mkdir(dir, { recursive: true });
    const noscript = buildNoscriptBlock({
      h1: route.h1,
      lede: route.lede,
      keyFacts: route.keyFacts,
    });
    let html = replaceHead(template, route);
    html = insertNoscriptIntoBody(html, noscript);
    await fs.writeFile(path.join(dir, 'index.html'), html, 'utf-8');
    written++;
    console.log(`  ✓ ${route.path}`);
  }

  // 6b. blog index article list — only the lede; each post has its own page
  // (handled in 6a via routes-meta /blog entry — we just enrich it with a
  // post list here for crawler comprehension)
  const blogIndexPath = path.join(DIST, 'blog', 'index.html');
  try {
    let blogHtml = await fs.readFile(blogIndexPath, 'utf-8');
    const postsList = blogPosts
      .map((p) => `<li><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a> — ${escapeHtml(p.description)}</li>`)
      .join('');
    blogHtml = blogHtml.replace(
      /<\/article>(?=<\/div><\/noscript>)/,
      `<ul>${postsList}</ul></article>`,
    );
    // The above replace only fires if the regex matches; if not, append before noscript close:
    if (!/<ul>/.test(blogHtml)) {
      blogHtml = blogHtml.replace(
        /(<\/div><\/noscript>)/,
        `<ul>${postsList}</ul>$1`,
      );
    }
    await fs.writeFile(blogIndexPath, blogHtml, 'utf-8');
  } catch (e) {
    console.warn(`  ⚠ blog index enrichment skipped: ${e.message}`);
  }

  // 6c. individual blog posts
  for (const post of blogPosts) {
    const dir = path.join(DIST, 'blog', post.slug);
    await fs.mkdir(dir, { recursive: true });
    const canonical = `${SITE}/blog/${post.slug}`;
    const ogImage = post.image && post.image.startsWith('/') ? `${SITE}${post.image}` : post.image || `${SITE}/og-image.jpg`;

    // Strip the first H1 from body — blog template uses the title as H1
    const bodyWithoutH1 = post.body.replace(/^#\s+.*\n+/, '');
    const articleHtml = renderMarkdown(bodyWithoutH1);

    const noscript = buildNoscriptBlock({
      h1: post.title,
      lede: [post.description],
      articleHtml,
    });

    let html = replaceHead(template, {
      title: `${post.title} | Urbane Haauz`,
      description: post.description,
      canonical,
      ogImage,
      ogType: 'article',
    });
    html = insertJsonLd(html, buildBlogPostJsonLd(post));
    html = insertNoscriptIntoBody(html, noscript);
    await fs.writeFile(path.join(dir, 'index.html'), html, 'utf-8');
    written++;
    console.log(`  ✓ /blog/${post.slug}`);
  }

  console.log(`✅ prerender: wrote ${written} HTML files`);
};

main().catch((err) => {
  console.error('❌ prerender failed:', err);
  process.exit(1);
});
