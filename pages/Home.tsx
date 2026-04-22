import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Cloud, Sun, Wifi, Coffee, ChevronRight, Star } from 'lucide-react';
import { TESTIMONIALS } from '../lib/mockData';
import { useApp } from '../context/AppContext';

// Home-page FAQPage. Lived in index.html previously, but a site-wide block was
// colliding with page-specific FAQs on /rooms and /contact (Google flags
// multiple FAQPage items on one URL as invalid rich-results candidates).
// Keeping it here scopes the schema to the homepage only.
const HOME_FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://urbanehaauz.com/#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: "What's the phone number to book Urbane Haauz directly?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Call or WhatsApp us at +91 9136032524, or email urbanehaauz@gmail.com. You can also book direct at urbanehaauz.com with best-rate guarantee and instant Razorpay confirmation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Urbane Haauz have Kanchenjunga view rooms?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — our property in Upper Pelling has direct Kanchenjunga views from the upper-floor balconies and common areas. On clear mornings you'll see Kanchenjunga lit in gold at sunrise. Premium rooms have private balconies facing the range.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do you have dormitory beds for backpackers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — Urbane Haauz is the only property in Upper Pelling offering both private hotel rooms and dorm beds. Dorm beds come with lockers, shared hot-water bathrooms, and the same Kanchenjunga-view balcony access as other guests.',
      },
    },
    {
      '@type': 'Question',
      name: 'How far is Urbane Haauz from Pelling Skywalk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "10-minute walk. We're on Skywalk Road in Upper Pelling, close to Pemayangtse Monastery (5 min drive), Rabdentse Ruins, Sangachoeling, and Khecheopalri Lake.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do you serve food? Any Bengali or vegetarian options?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — in-house restaurant with CP (breakfast included) and MAP (breakfast + dinner) meal plans. Our kitchen does Bengali, North Indian, Sikkimese, and continental. Pure veg and Jain-friendly options available on request.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I reach Pelling from NJP or Bagdogra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NJP station or Bagdogra airport to Pelling is approximately 140 km / 4.5–5 hours by shared or private cab via Siliguri–Jorethang–Legship. We can arrange pickup — call +91 9136032524 at least 24 hours in advance.',
      },
    },
  ],
};

const Home: React.FC = () => {
  const { homeHeroImage, rooms } = useApp();

  return (
    <div className="flex flex-col w-full font-sans">
      <Helmet>
        <title>Urbane Haauz | Boutique Hotel in Upper Pelling with Kanchenjunga Views</title>
        <meta name="description" content="Boutique hotel in Upper Pelling, Sikkim with direct Kanchenjunga views. CP/MAP meal plans, dormitory beds, direct Razorpay booking — best rate guaranteed." />
        <link rel="canonical" href="https://urbanehaauz.com/" />
        <meta property="og:title" content="Urbane Haauz | Boutique Hotel in Upper Pelling" />
        <meta property="og:description" content="Direct Kanchenjunga views, CP/MAP meal plans, dorm beds. Book direct for best rates." />
        <meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />
        <meta property="og:url" content="https://urbanehaauz.com/" />
        <script type="application/ld+json">{JSON.stringify(HOME_FAQ_JSONLD)}</script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
            <img
              src={homeHeroImage}
              alt="Golden Sunrise over Kanchenjunga"
              width={1600}
              height={765}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
            />
            {/* Neutral dark overlay to ensure text readability without green tint */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        </div>
        
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 z-10 pt-20">
          <span className="text-white uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-semibold animate-fade-in-up border-b border-white/50 pb-2 drop-shadow-md">
            The Himalayas Await
          </span>
          <h1 className="font-serif text-5xl md:text-8xl text-white font-normal mb-6 max-w-5xl leading-none text-shadow drop-shadow-xl">
            Urbane <span className="text-white italic font-light">Haauz</span>
          </h1>
          <p className="font-serif text-white/90 text-base md:text-xl mb-12 max-w-2xl italic tracking-wide leading-relaxed drop-shadow-md">
            - Where luxury meets the clouds.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="https://urbanehaauz.runhotel.site/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white text-urbane-green px-10 py-4 transition-all duration-300 text-sm font-bold tracking-[0.2em] uppercase shadow-lg hover:bg-urbane-gold hover:text-white hover:shadow-xl hover:-translate-y-1"
              >
                Check Availability
              </a>
              <Link
                to="/rangotsav"
                className="group bg-transparent text-white px-10 py-4 transition-all duration-300 text-sm font-bold tracking-[0.2em] uppercase shadow-lg border-2 border-white/60 hover:bg-urbane-gold hover:border-urbane-gold hover:text-white hover:shadow-xl hover:-translate-y-1"
              >
                Rangotsav · 25 May
              </Link>
            </div>
            <p className="text-white/80 text-xs tracking-[0.15em] uppercase drop-shadow-md">
              Best Rate Guarantee · Instant Confirmation
            </p>
          </div>

          {/* Weather Widget Mock */}
          <div className="absolute bottom-10 right-10 hidden md:flex items-center space-x-6 bg-white/10 backdrop-blur-md p-6 rounded-none border-l-2 border-urbane-gold shadow-2xl">
            <div className="text-white text-right">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Pelling, Sikkim</p>
              <p className="font-serif text-3xl">12°C</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <Sun className="text-urbane-gold h-10 w-10 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 bg-white relative">
          <div className="max-w-3xl mx-auto text-center px-6">
             <p className="text-urbane-gold font-serif italic text-2xl mb-6">"Where Mountains Meet Modern Comfort"</p>
             <h2 className="font-serif text-4xl md:text-5xl text-urbane-charcoal font-bold mb-8 leading-tight">
                 Experience the Magic of <br/> Kanchenjunga
             </h2>
             <p className="text-gray-600 leading-loose text-lg">
                 Nestled in the heart of West Sikkim, Urbane Haauz offers an escape from the ordinary.
                 Whether you are a backpacker seeking adventure or a family looking for serenity,
                 our doors open to the majestic views of the third highest peak in the world.
             </p>
             <div className="mt-10 flex justify-center">
                <div className="w-1 h-16 bg-urbane-gold"></div>
             </div>
          </div>
      </section>

      {/* Quick Answers Section — GEO optimization for AI answer engines */}
      <section className="py-20 bg-urbane-mist border-t border-gray-100" aria-labelledby="quick-answers-heading">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-urbane-gold uppercase tracking-widest font-semibold text-xs">Quick Answers</span>
            <h2 id="quick-answers-heading" className="font-serif text-3xl md:text-4xl text-urbane-charcoal font-bold mt-3">
              Urbane Haauz at a Glance
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Short, honest answers to the questions travellers ask most often before booking Pelling.
            </p>
          </div>

          <dl className="space-y-6">
            <div className="bg-white p-6 border-l-4 border-urbane-gold shadow-soft">
              <dt className="font-serif text-lg font-bold text-urbane-charcoal mb-2">
                What is Urbane Haauz?
              </dt>
              <dd className="text-gray-600 leading-relaxed">
                Urbane Haauz is a boutique hotel in Upper Pelling, West Sikkim, with 8 private rooms (Standard, Super Deluxe, Premium) plus shared dormitory beds. It is one of the few Pelling hotels offering direct Kanchenjunga balcony views, CP/MAP meal plans, and direct Razorpay booking without OTA commission.
              </dd>
            </div>

            <div className="bg-white p-6 border-l-4 border-urbane-gold shadow-soft">
              <dt className="font-serif text-lg font-bold text-urbane-charcoal mb-2">
                Can you see Kanchenjunga from Urbane Haauz?
              </dt>
              <dd className="text-gray-600 leading-relaxed">
                Yes. Front-facing Super Deluxe and Premium rooms have private balconies looking directly at the Kanchenjunga massif (8,586 m). The clearest views are between October and early March, typically from 5:30 AM to 10:30 AM. Standard rooms share a rooftop viewing deck with the same angle.
              </dd>
            </div>

            <div className="bg-white p-6 border-l-4 border-urbane-gold shadow-soft">
              <dt className="font-serif text-lg font-bold text-urbane-charcoal mb-2">
                Does Urbane Haauz have dormitory beds?
              </dt>
              <dd className="text-gray-600 leading-relaxed">
                Yes. Urbane Haauz is the only boutique hotel in Upper Pelling that also offers shared dorm beds, priced ₹400–₹900 per night. Dorm guests get lockers, hot-water shared bathrooms, free WiFi, and access to the same Kanchenjunga-view common areas as private-room guests.
              </dd>
            </div>

            <div className="bg-white p-6 border-l-4 border-urbane-gold shadow-soft">
              <dt className="font-serif text-lg font-bold text-urbane-charcoal mb-2">
                Where exactly in Pelling is the hotel?
              </dt>
              <dd className="text-gray-600 leading-relaxed">
                On SH-510 in Upper Pelling, roughly 400 metres (a 5-minute walk) from the Pelling Skywalk and Chenrezig Statue, and about 2 km from Pemayangtse Monastery. Upper Pelling is the helipad-side ridge and commands the best Kanchenjunga viewing angles in town.
              </dd>
            </div>

            <div className="bg-white p-6 border-l-4 border-urbane-gold shadow-soft">
              <dt className="font-serif text-lg font-bold text-urbane-charcoal mb-2">
                Is Urbane Haauz good for Bengali families from Kolkata?
              </dt>
              <dd className="text-gray-600 leading-relaxed">
                Yes — Bengali-speaking staff, CP/MAP meal plans with vegetarian options, and a quieter Upper Pelling location make it a natural fit for families from Kolkata, Durgapur, Asansol, and Patna. NJP station to Pelling is approximately 140 km (4.5–5 hours by taxi); no Inner Line Permit is needed for Indian citizens.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-urbane-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
                { icon: Cloud, title: "Panoramic Views", text: "Uninterrupted sunrise views from every balcony." },
                { icon: Wifi, title: "Modern Essentials", text: "High-speed fiber internet & 24/7 power backup." },
                { icon: Coffee, title: "Authentic Dining", text: "Organic Sikkimese cuisine & craft beverages." }
            ].map((feature, idx) => (
                <div key={idx} className="bg-white p-10 shadow-soft hover:shadow-xl transition-all duration-500 group border-t-4 border-transparent hover:border-urbane-gold">
                    <feature.icon className="h-12 w-12 text-urbane-green mb-6 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-serif text-2xl font-bold mb-4 text-urbane-charcoal">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.text}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms Preview — indexable landing section + internal link equity to /rooms */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-xl">
              <span className="text-urbane-gold uppercase tracking-widest font-semibold text-xs">Accommodation</span>
              <h2 className="font-serif text-4xl md:text-5xl text-urbane-charcoal font-bold mt-3">Curated Spaces</h2>
              <p className="mt-4 text-gray-500">Designed for comfort, styled for luxury.</p>
            </div>
            <Link to="/rooms" className="group flex items-center text-urbane-charcoal font-medium hover:text-urbane-gold transition-colors mt-6 md:mt-0">
              View All Rooms <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {rooms.filter(r => r.available).slice(0, 2).map((room) => (
              <div key={room.id} className="group relative overflow-hidden shadow-2xl h-[500px] cursor-pointer">
                 <div className="absolute inset-0">
                  <div className="w-full h-full bg-gradient-to-br from-urbane-darkGreen to-urbane-charcoal" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
                </div>
                <div className="absolute bottom-0 left-0 p-10 text-white w-full">
                  <div className="flex justify-between items-end border-b border-white/20 pb-6 mb-6">
                      <div>
                        <p className="text-urbane-gold text-xs uppercase tracking-widest font-bold mb-2">{room.category}</p>
                        <h3 className="font-serif text-3xl font-bold">{room.name}</h3>
                      </div>
                  </div>
                  <div className="flex justify-end items-center">
                      <a href="https://urbanehaauz.runhotel.site/en/" target="_blank" rel="noopener noreferrer" className="bg-white text-urbane-charcoal px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-urbane-gold hover:text-white transition-colors">
                        Book Now
                      </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-urbane-darkGreen text-white relative overflow-hidden">
         <div className="max-w-6xl mx-auto px-4 relative z-10">
           <div className="text-center mb-16">
                <Star className="h-8 w-8 text-urbane-gold mx-auto mb-4 fill-current" />
                <h2 className="font-serif text-4xl font-bold mb-4">Guest Stories</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t) => (
                <div key={t.id} className="bg-white/5 p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <p className="font-serif text-xl leading-relaxed italic text-gray-200 mb-8">"{t.text}"</p>
                  <div className="flex items-center">
                      <div className="w-10 h-10 bg-urbane-gold rounded-full flex items-center justify-center text-urbane-darkGreen font-bold font-serif">
                          {t.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                          <p className="font-bold text-sm uppercase tracking-wide">{t.name}</p>
                          <div className="flex text-urbane-gold mt-1">
                            {[...Array(t.rating)].map((_, i) => (
                                <Star key={i} size={12} fill="currentColor" />
                            ))}
                          </div>
                      </div>
                  </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="font-serif text-5xl text-urbane-charcoal font-bold mb-6">
             Your Mountain Home Awaits
           </h2>
           <p className="text-gray-500 mb-10 text-lg max-w-2xl mx-auto">
             Escape the chaos. Embrace the clouds. Book directly with us for exclusive welcome perks and guaranteed best rates.
           </p>
           <a
             href="https://urbanehaauz.runhotel.site/en/"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-block bg-gradient-to-r from-urbane-green to-urbane-darkGreen text-white px-12 py-5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold tracking-widest uppercase text-sm"
           >
             Reserve Your Stay
           </a>
        </div>
      </section>
    </div>
  );
};

export default Home;