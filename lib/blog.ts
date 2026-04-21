// Blog post loader + minimal markdown parser.
// We intentionally avoid adding react-markdown / remark / rehype deps — the six pillar
// posts use a predictable subset of Markdown (headings, bold, italics, links, lists,
// blockquotes, tables, horizontal rules). This parser covers that subset.

export interface BlogFrontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  keywords: string[];
  image: string;
}

export interface BlogPost extends BlogFrontmatter {
  body: string; // raw markdown without frontmatter
  excerpt: string; // first non-heading paragraph, plain text
}

// Eagerly pull every .md file under /content/blog as a raw string.
// Vite resolves this at build time; no runtime fetches.
const rawPosts = import.meta.glob('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const parseFrontmatter = (raw: string): { data: BlogFrontmatter; body: string } => {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Blog post missing frontmatter');
  }
  const [, fmBlock, body] = match;
  const data: Record<string, unknown> = {};
  for (const line of fmBlock.split('\n')) {
    const keyMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!keyMatch) continue;
    const [, key, rawValue] = keyMatch;
    const trimmed = rawValue.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      // simple JSON-ish array of strings
      try {
        data[key] = JSON.parse(trimmed.replace(/'/g, '"'));
      } catch {
        data[key] = trimmed.slice(1, -1).split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
      }
    } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      data[key] = trimmed.slice(1, -1);
    } else {
      data[key] = trimmed;
    }
  }
  return { data: data as unknown as BlogFrontmatter, body: body.trim() };
};

const stripMarkdown = (md: string): string =>
  md
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_]/g, '')
    .trim();

const buildExcerpt = (body: string): string => {
  const paragraphs = body.split(/\n{2,}/);
  for (const p of paragraphs) {
    const t = p.trim();
    if (!t || t.startsWith('#') || t.startsWith('|') || t.startsWith('---')) continue;
    const clean = stripMarkdown(t).replace(/\s+/g, ' ');
    if (clean.length > 60) {
      return clean.length > 200 ? clean.slice(0, 197).trimEnd() + '…' : clean;
    }
  }
  return '';
};

let cache: BlogPost[] | null = null;

export const getAllPosts = (): BlogPost[] => {
  if (cache) return cache;
  const posts: BlogPost[] = Object.entries(rawPosts).map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw);
    if (!data.slug) {
      // fall back to filename
      const filename = path.split('/').pop() || '';
      data.slug = filename.replace(/\.md$/, '');
    }
    return {
      ...data,
      body,
      excerpt: buildExcerpt(body),
    };
  });
  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  cache = posts;
  return posts;
};

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  getAllPosts().find((p) => p.slug === slug);

// Minimal markdown -> HTML conversion. Supports:
// - ATX headings (# through ######)
// - Bold **x**, italic *x*, inline code `x`
// - Links [text](url)
// - Unordered lists (- item) and ordered lists (1. item)
// - Blockquotes (> text)
// - Horizontal rules (---)
// - GFM-style pipe tables
// - Paragraphs
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const inline = (s: string): string => {
  // escape first, then re-inject allowed inline markup
  let out = escapeHtml(s);
  // links [text](href) — href is untrusted text but we already escaped
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
    const isExternal = /^https?:\/\//i.test(href);
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${attrs}>${text}</a>`;
  });
  // bold then italic (bold first to avoid greedy match)
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
};

const isTableDivider = (line: string): boolean =>
  /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);

export const renderMarkdown = (md: string): string => {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    if (!buf.length) return;
    const joined = buf.join(' ').trim();
    if (joined) out.push(`<p>${inline(joined)}</p>`);
    buf.length = 0;
  };

  const paragraphBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    // blank line — paragraph break
    if (line.trim() === '') {
      flushParagraph(paragraphBuf);
      i += 1;
      continue;
    }

    // horizontal rule
    if (/^---+\s*$/.test(line)) {
      flushParagraph(paragraphBuf);
      out.push('<hr />');
      i += 1;
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushParagraph(paragraphBuf);
      const level = h[1].length;
      const text = h[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    // blockquote
    if (line.startsWith('> ')) {
      flushParagraph(paragraphBuf);
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quote.push(lines[i].slice(2));
        i += 1;
      }
      out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(line)) {
      flushParagraph(paragraphBuf);
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i += 1;
      }
      out.push('<ul>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ul>');
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph(paragraphBuf);
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      out.push('<ol>' + items.map((it) => `<li>${inline(it)}</li>`).join('') + '</ol>');
      continue;
    }

    // table
    if (line.trim().startsWith('|') && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      flushParagraph(paragraphBuf);
      const parseRow = (row: string): string[] =>
        row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());
      const header = parseRow(line);
      i += 2; // skip header + divider
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseRow(lines[i]));
        i += 1;
      }
      const thead = '<thead><tr>' + header.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead>';
      const tbody =
        '<tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody>';
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // regular paragraph line
    paragraphBuf.push(line);
    i += 1;
  }
  flushParagraph(paragraphBuf);

  return out.join('\n');
};
