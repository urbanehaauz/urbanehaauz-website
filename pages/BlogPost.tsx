import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { getAllPosts, getPostBySlug, renderMarkdown } from '../lib/blog';

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  // Strip the first # H1 — we render the title in the hero instead, to avoid duplicate H1s.
  const html = useMemo(() => {
    if (!post) return '';
    const withoutFirstH1 = post.body.replace(/^#\s+.*\n+/, '');
    return renderMarkdown(withoutFirstH1);
  }, [post]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return getAllPosts()
      .filter((p) => p.slug !== post.slug)
      .slice(0, 3);
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const canonical = `https://urbanehaauz.com/blog/${post.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    headline: post.title,
    description: post.description,
    image: `https://urbanehaauz.com${post.image}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    keywords: post.keywords.join(', '),
    author: {
      '@type': 'Organization',
      name: 'Urbane Haauz',
      url: 'https://urbanehaauz.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Urbane Haauz',
      logo: {
        '@type': 'ImageObject',
        url: 'https://urbanehaauz.com/uh-badge.png',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://urbanehaauz.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://urbanehaauz.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-urbane-mist">
      <Helmet>
        <title>{`${post.title} | Urbane Haauz`}</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.keywords.join(', ')} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={`https://urbanehaauz.com${post.image}`} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={`https://urbanehaauz.com${post.image}`} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <section className="relative h-80 md:h-96 overflow-hidden">
        <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />
        <div className="relative h-full flex flex-col justify-end max-w-4xl mx-auto px-4 pb-10">
          <Link
            to="/blog"
            className="inline-flex items-center text-urbane-gold text-sm tracking-widest uppercase mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            All guides
          </Link>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center text-gray-200 text-sm space-x-3">
            <Calendar size={14} className="text-urbane-gold" />
            <time dateTime={post.publishedAt}>Published {formatDate(post.publishedAt)}</time>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <>
                <span>•</span>
                <span>Updated {formatDate(post.updatedAt)}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <div
          className="blog-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border-l-4 border-urbane-gold">
          <p className="text-sm text-gray-600 italic">
            Written by the Urbane Haauz team in Upper Pelling. Questions about your trip?{' '}
            <Link to="/contact" className="text-urbane-green font-semibold hover:text-urbane-gold">
              Write to us
            </Link>{' '}
            or{' '}
            <Link to="/book" className="text-urbane-green font-semibold hover:text-urbane-gold">
              check live availability
            </Link>
            .
          </p>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-urbane-charcoal mb-6">
              More Pelling guides
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-serif font-bold text-urbane-charcoal text-base leading-snug mb-2 hover:text-urbane-gold">
                    {p.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                    {p.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
