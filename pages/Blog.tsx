import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { getAllPosts } from '../lib/blog';

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Blog: React.FC = () => {
  const posts = getAllPosts();

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Urbane Haauz — Pelling Travel Guides',
    description:
      'In-depth Pelling travel guides written from Upper Pelling: Kanchenjunga views, routes, itineraries, monthly weather, and where to stay.',
    url: 'https://urbanehaauz.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Urbane Haauz',
      logo: {
        '@type': 'ImageObject',
        url: 'https://urbanehaauz.com/logo-uh.png',
      },
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      url: `https://urbanehaauz.com/blog/${p.slug}`,
      image: `https://urbanehaauz.com${p.image}`,
      author: {
        '@type': 'Organization',
        name: 'Urbane Haauz',
      },
    })),
  };

  return (
    <div className="min-h-screen bg-urbane-mist">
      <Helmet>
        <title>Pelling Travel Guides & Blog | Urbane Haauz</title>
        <meta
          name="description"
          content="Honest Pelling travel guides from Upper Pelling — Kanchenjunga views, how to reach, 2-day itineraries, month-by-month weather, and where to stay."
        />
        <link rel="canonical" href="https://urbanehaauz.com/blog" />
        <meta property="og:title" content="Pelling Travel Guides & Blog | Urbane Haauz" />
        <meta
          property="og:description"
          content="In-depth Pelling travel guides written from Upper Pelling — views, routes, weather, and itineraries."
        />
        <meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />
        <meta property="og:url" content="https://urbanehaauz.com/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      <section className="relative h-72 bg-gradient-to-r from-urbane-darkGreen to-urbane-green overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <p className="text-urbane-gold tracking-[0.3em] uppercase text-sm mb-2">
              From Upper Pelling
            </p>
            <h1 className="font-serif text-5xl font-bold mb-3">Pelling Travel Guides</h1>
            <p className="text-gray-200 max-w-2xl mx-auto">
              Honest, specific, locally-written guides to Pelling — views, routes, weather, and
              itineraries.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No guides published yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                    <Calendar size={14} className="text-urbane-gold" />
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-urbane-charcoal mb-3 leading-snug">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="hover:text-urbane-gold transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                    {post.excerpt || post.description}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-5 inline-flex items-center text-urbane-green hover:text-urbane-gold font-medium text-sm uppercase tracking-widest"
                  >
                    Read guide
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-20 text-center bg-white rounded-2xl shadow-md p-10">
          <h2 className="font-serif text-2xl font-bold text-urbane-charcoal mb-3">
            Planning your Pelling trip?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Our front desk in Upper Pelling answers every message personally. Book directly for
            the best rate and a pre-arranged pickup from NJP or Bagdogra.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://urbanehaauz.runhotel.site/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-urbane-gold to-urbane-goldLight text-urbane-darkGreen px-8 py-3 rounded-none font-bold hover:shadow-gold transition-all text-sm tracking-wide uppercase"
            >
              Book Now
            </a>
            <Link
              to="/contact"
              className="border-2 border-urbane-green text-urbane-green px-8 py-3 rounded-none font-bold hover:bg-urbane-green hover:text-white transition-all text-sm tracking-wide uppercase"
            >
              Ask us anything
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
