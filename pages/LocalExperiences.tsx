import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mountain, Footprints, Landmark, Waves, MapPin, Clock, Star, MessageCircle } from 'lucide-react';
import { HOTEL_CONTACT } from '../components/Footer';

interface Experience {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  distance: string;
  highlights: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const experiences: Experience[] = [
  {
    id: 1,
    title: "Pelling Skywalk",
    description: "Walk among the clouds on India's first glass skywalk. Experience breathtaking panoramic views of the Kanchenjunga range from 7,200 feet above sea level.",
    duration: "2-3 hours",
    difficulty: "Easy",
    distance: "2 km from hotel",
    highlights: ["Glass floor walkway", "360° mountain views", "Chenrezig Statue", "Best at sunrise"],
    icon: Mountain
  },
  {
    id: 2,
    title: "Rabdentse Ruins",
    description: "Explore the ancient ruins of Sikkim's second capital. These 17th-century palace remains offer a glimpse into the region's rich Buddhist heritage.",
    duration: "3-4 hours",
    difficulty: "Moderate",
    distance: "3 km from hotel",
    highlights: ["National monument", "Historic palace ruins", "Scenic hiking trail", "Monastery nearby"],
    icon: Landmark
  },
  {
    id: 3,
    title: "Khecheopalri Lake",
    description: "Visit the sacred 'Wish-fulfilling Lake' surrounded by dense forests. Legend says leaves that fall on the lake are picked up by birds to keep it clean.",
    duration: "Half day",
    difficulty: "Easy",
    distance: "28 km from hotel",
    highlights: ["Sacred Buddhist lake", "Prayer flags", "Bird watching", "Peaceful meditation spot"],
    icon: Waves
  },
  {
    id: 4,
    title: "Kanchenjunga Falls",
    description: "Witness one of Sikkim's most stunning waterfalls cascading down from a height of 100 feet, surrounded by lush greenery and misty mountains.",
    duration: "2-3 hours",
    difficulty: "Easy",
    distance: "5 km from hotel",
    highlights: ["100-foot waterfall", "Rainbow in mist", "Photo opportunities", "Refreshing spray"],
    icon: Waves
  },
  {
    id: 5,
    title: "Singshore Bridge Trek",
    description: "Walk across Asia's second-highest suspension bridge and enjoy spectacular valley views. The trek through rhododendron forests is unforgettable.",
    duration: "4-5 hours",
    difficulty: "Moderate",
    distance: "8 km from hotel",
    highlights: ["240m suspension bridge", "Valley views", "Rhododendron forest", "Adventure walk"],
    icon: Footprints
  },
  {
    id: 6,
    title: "Pemayangtse Monastery",
    description: "One of Sikkim's oldest and most significant monasteries. Marvel at the intricate wooden sculpture depicting the heavenly abode of Guru Padmasambhava.",
    duration: "2-3 hours",
    difficulty: "Easy",
    distance: "1.5 km from hotel",
    highlights: ["17th century monastery", "Sacred Buddhist art", "Sangthokpalri sculpture", "Panoramic views"],
    icon: Landmark
  }
];

const LocalExperiences: React.FC = () => {
  return (
    <div className="flex flex-col w-full font-sans">
      {/* Hero Section */}
      <Helmet>
        <title>Local Experiences in Pelling | Urbane Haauz</title>
        <meta name="description" content="Pelling Skywalk, Pemayangtse Monastery, Khecheopalri Lake and more — curated local experiences from Urbane Haauz in Upper Pelling, Sikkim." />
        <link rel="canonical" href="https://urbanehaauz.com/experiences" />
        <meta property="og:title" content="Local Experiences in Pelling | Urbane Haauz" />
        <meta property="og:description" content="Monasteries, waterfalls, skywalks and trails around Upper Pelling." />
        <meta property="og:image" content="https://urbanehaauz.com/og-image.jpg" />
        <meta property="og:url" content="https://urbanehaauz.com/experiences" />
      </Helmet>
      <section className="relative h-[40vh] w-full overflow-hidden bg-gradient-to-br from-urbane-darkGreen via-urbane-green to-urbane-darkGreen">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 z-10 pt-20">
          <span className="text-white uppercase tracking-[0.3em] text-xs md:text-sm mb-6 font-semibold animate-fade-in-up border-b border-white/50 pb-2">
            Discover Pelling
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white font-normal mb-6 max-w-5xl leading-tight">
            Local <span className="text-urbane-gold italic font-light">Experiences</span>
          </h1>
          <p className="font-serif text-white/90 text-base md:text-xl mb-8 max-w-2xl italic tracking-wide leading-relaxed">
            Immerse yourself in the magic of West Sikkim
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-urbane-gold font-serif italic text-xl mb-4">"Adventure Awaits at Every Turn"</p>
          <h2 className="font-serif text-3xl md:text-4xl text-urbane-charcoal font-bold mb-6 leading-tight">
            Curated Experiences Near Urbane Haauz
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            From ancient monasteries to breathtaking viewpoints, Pelling offers a treasure trove of experiences.
            Our team can arrange guided tours, transportation, and packed lunches for any of these adventures.
          </p>
        </div>
      </section>

      {/* Experiences Grid - Card style without images */}
      <section className="py-16 bg-urbane-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-white rounded-none shadow-soft hover:shadow-xl transition-all duration-500 overflow-hidden group border-t-4 border-urbane-gold">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-urbane-mist rounded-full">
                      <exp.icon className="h-6 w-6 text-urbane-green" />
                    </div>
                    <span className="bg-urbane-gold/10 text-urbane-gold px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      {exp.difficulty}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-urbane-charcoal mb-3">{exp.title}</h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1 text-urbane-gold" /> {exp.duration}
                    </span>
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1 text-urbane-gold" /> {exp.distance}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-urbane-charcoal mb-2">Highlights:</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.highlights.map((highlight, idx) => (
                        <span key={idx} className="bg-urbane-mist text-urbane-charcoal px-2 py-1 text-xs rounded-full">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-urbane-darkGreen text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Star className="h-8 w-8 text-urbane-gold mx-auto mb-4 fill-current" />
          <h2 className="font-serif text-3xl font-bold mb-6">Travel Tips from Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/5 p-6 border border-white/10">
              <h3 className="font-bold text-urbane-gold mb-2">Best Time to Visit</h3>
              <p className="text-gray-300 text-sm">October to May offers clear skies and stunning Kanchenjunga views. Monsoon (June-September) brings lush greenery but limited visibility.</p>
            </div>
            <div className="bg-white/5 p-6 border border-white/10">
              <h3 className="font-bold text-urbane-gold mb-2">What to Pack</h3>
              <p className="text-gray-300 text-sm">Layered clothing, comfortable walking shoes, sunscreen, sunglasses, and a camera. Evenings can be chilly year-round.</p>
            </div>
            <div className="bg-white/5 p-6 border border-white/10">
              <h3 className="font-bold text-urbane-gold mb-2">Permits Required</h3>
              <p className="text-gray-300 text-sm">Indian nationals need Inner Line Permits for certain areas. Our front desk can assist with the paperwork.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl text-urbane-charcoal font-bold mb-6">
            Ready to Explore?
          </h2>
          <p className="text-gray-500 mb-8 text-lg max-w-2xl mx-auto">
            Book your stay at Urbane Haauz and let us help you plan the perfect Pelling adventure.
            Our concierge can arrange private tours, guides, and transportation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="inline-block bg-gradient-to-r from-urbane-green to-urbane-darkGreen text-white px-10 py-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold tracking-widest uppercase text-sm"
            >
              Book Your Stay
            </Link>
            <a
              href={`tel:${HOTEL_CONTACT.phoneClean}`}
              className="inline-block border-2 border-urbane-charcoal text-urbane-charcoal px-10 py-4 hover:bg-urbane-charcoal hover:text-white transition-all duration-300 font-bold tracking-widest uppercase text-sm"
            >
              Call Us: {HOTEL_CONTACT.phone}
            </a>
            <a
              href={`https://wa.me/${HOTEL_CONTACT.whatsapp}?text=Hi! I'd like to know more about local experiences near Urbane Haauz.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-10 py-4 shadow-xl hover:bg-green-600 hover:-translate-y-1 transition-all duration-300 font-bold tracking-widest uppercase text-sm"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocalExperiences;
