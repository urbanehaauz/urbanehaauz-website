import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Music,
  Palette,
  Utensils,
  MapPin,
  Calendar,
  ArrowRight,
  Instagram,
  Facebook,
  Share2,
  ExternalLink,
  Users,
  Heart,
} from 'lucide-react';

const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section';
}> = ({ children, delay = 0, className = '' }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-out will-change-transform ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               INLINE SVG ART                               */
/* -------------------------------------------------------------------------- */

const OrchidSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className}>
    <g opacity="0.85">
      {[0, 72, 144, 216, 288].map((rot) => (
        <ellipse
          key={rot}
          cx="60"
          cy="28"
          rx="9"
          ry="34"
          fill="url(#orchidGrad)"
          transform={`rotate(${rot} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="9" fill="#D4A574" />
      <circle cx="60" cy="60" r="4" fill="#7B2D8E" />
    </g>
    <defs>
      <linearGradient id="orchidGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F0E0FF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#9B59B6" stopOpacity="0.6" />
      </linearGradient>
    </defs>
  </svg>
);

const OrchidAltSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" className={className}>
    <g opacity="0.9">
      {[0, 60, 120, 180, 240, 300].map((rot) => (
        <ellipse
          key={rot}
          cx="60"
          cy="30"
          rx="10"
          ry="28"
          fill="url(#orchidAltGrad)"
          stroke="#D4A574"
          strokeOpacity="0.4"
          strokeWidth="0.6"
          transform={`rotate(${rot} 60 60)`}
        />
      ))}
      <circle cx="60" cy="60" r="8" fill="#D4A574" />
      <circle cx="60" cy="60" r="3" fill="#7B2D8E" />
    </g>
    <defs>
      <radialGradient id="orchidAltGrad">
        <stop offset="0%" stopColor="#E8D0F0" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#8E44AD" stopOpacity="0.75" />
      </radialGradient>
    </defs>
  </svg>
);

const MountainRangeSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 1600 400" fill="none" className={className} preserveAspectRatio="none">
    <path
      d="M0,400 L0,280 L180,180 L320,240 L500,120 L680,220 L860,140 L1040,230 L1220,160 L1400,240 L1600,200 L1600,400 Z"
      fill="url(#mtnBack)"
      opacity="0.5"
    />
    <path
      d="M0,400 L0,320 L140,240 L300,300 L460,200 L640,290 L820,220 L1000,300 L1180,240 L1360,310 L1600,260 L1600,400 Z"
      fill="url(#mtnMid)"
      opacity="0.75"
    />
    <path
      d="M0,400 L0,360 L120,310 L260,340 L420,290 L580,340 L760,300 L940,350 L1120,310 L1320,355 L1600,330 L1600,400 Z"
      fill="#1C1C1C"
      opacity="0.9"
    />
    <defs>
      <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2D1B69" />
        <stop offset="100%" stopColor="#2C5F7C" />
      </linearGradient>
      <linearGradient id="mtnMid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2C5F7C" />
        <stop offset="100%" stopColor="#1C1C1C" />
      </linearGradient>
    </defs>
  </svg>
);

const MandalaDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 800 60" fill="none" className={className}>
    <line x1="0" y1="30" x2="330" y2="30" stroke="#D4A574" strokeWidth="0.8" />
    <line x1="470" y1="30" x2="800" y2="30" stroke="#D4A574" strokeWidth="0.8" />
    <g transform="translate(400 30)">
      {[0, 30, 60, 90, 120, 150].map((r) => (
        <line
          key={r}
          x1="0"
          y1="-20"
          x2="0"
          y2="20"
          stroke="#D4A574"
          strokeWidth="0.7"
          transform={`rotate(${r})`}
        />
      ))}
      <circle r="16" fill="none" stroke="#D4A574" strokeWidth="0.8" />
      <circle r="9" fill="none" stroke="#D4A574" strokeWidth="0.6" />
      <circle r="3" fill="#D4A574" />
    </g>
  </svg>
);

const NoiseOverlay: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.08] mix-blend-overlay pointer-events-none" aria-hidden>
    <filter id="rb-noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#rb-noise)" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                               SUB-COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const StandaloneHeader: React.FC = () => (
  <header className="absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex items-center justify-between">
    <Link
      to="/"
      className="group flex items-center gap-2 text-[#FAF7F2]/90 hover:text-[#D4A574] transition-colors"
    >
      <img src="/logo.jpeg" alt="Urbane Haauz logo" className="h-10 md:h-12 w-auto rounded" />
      <span className="text-xs uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100">
        Pelling Cultural Initiative
      </span>
    </Link>
    <a
      href="#register"
      className="hidden md:inline-flex items-center gap-2 border border-[#D4A574]/60 text-[#D4A574] px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] hover:bg-[#D4A574] hover:text-[#1C1C1C] transition"
    >
      Register <ArrowRight className="w-3.5 h-3.5" />
    </a>
  </header>
);

const HeroSection: React.FC = () => (
  <section className="relative min-h-screen overflow-hidden flex items-center">
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #C84B0F 0%, #D4A574 22%, #8A3E7A 52%, #2D1B69 78%, #2C5F7C 100%)',
      }}
    />
    <NoiseOverlay />

    {/* Floating decorative SVGs */}
    <OrchidSVG className="absolute top-[18%] left-[6%] w-20 md:w-28 animate-[rb-float_9s_ease-in-out_infinite]" />
    <OrchidAltSVG className="absolute top-[14%] right-[8%] w-20 md:w-32 animate-[rb-float_11s_ease-in-out_infinite_0.5s]" />
    <OrchidSVG className="absolute bottom-[30%] right-[14%] w-14 md:w-20 opacity-70 animate-[rb-float_13s_ease-in-out_infinite_1.5s]" />
    <OrchidAltSVG className="absolute bottom-[34%] left-[12%] w-16 md:w-24 opacity-80 animate-[rb-float_10s_ease-in-out_infinite_2s]" />
    <MountainRangeSVG className="absolute bottom-0 left-0 w-full h-[38%]" />

    {/* Ornamental frame */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-24 left-6 right-6 md:left-12 md:right-12 h-px bg-gradient-to-r from-transparent via-[#D4A574]/50 to-transparent" />
      <div className="absolute bottom-24 left-6 right-6 md:left-12 md:right-12 h-px bg-gradient-to-r from-transparent via-[#D4A574]/50 to-transparent" />
    </div>

    <StandaloneHeader />

    <div className="relative z-10 w-full px-6 md:px-12 pt-32 pb-24 text-center">
      <div className="animate-fade-in">
        <span className="inline-block text-[#D4A574] text-[10px] md:text-xs uppercase tracking-[0.4em] mb-8 border border-[#D4A574]/30 px-5 py-2 rounded-full backdrop-blur-sm font-medium">
          A Cultural Conglomerate
        </span>
      </div>

      <h1
        className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-[#FAF7F2] animate-fade-in-up"
        style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
      >
        Ranglaher Utsav
      </h1>

      <div className="mt-5 md:mt-6 flex items-center justify-center gap-4 animate-fade-in-up">
        <span className="h-px w-12 bg-[#D4A574]/50" />
        <p className="text-sm md:text-base text-[#D4A574] uppercase tracking-[0.35em] font-medium">
          The Tale Of Two States
        </p>
        <span className="h-px w-12 bg-[#D4A574]/50" />
      </div>

      <p className="mt-8 md:mt-10 text-base md:text-xl text-[#FAF7F2]/90 font-serif italic max-w-2xl mx-auto animate-fade-in-up leading-relaxed">
        Art is in the Air; Music is in the Mist and Flavours on your Plate.
      </p>
      <p className="mt-3 text-xs md:text-sm text-[#FAF7F2]/50 max-w-lg mx-auto animate-fade-in-up tracking-wide leading-relaxed">
        From Bengal's Soul to Sikkim's Spirit. From Bengal's red soil to Sikkim's mountain rocks — A Cultural Confluence.
      </p>

      <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 text-[#FAF7F2] bg-[#1C1C1C]/30 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#FAF7F2]/20">
          <Calendar className="w-4 h-4 text-[#D4A574]" />
          <span className="uppercase text-xs tracking-[0.3em]">May 2025</span>
        </div>
        <div className="inline-flex items-center gap-2 text-[#FAF7F2] bg-[#1C1C1C]/30 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#FAF7F2]/20">
          <MapPin className="w-4 h-4 text-[#D4A574]" />
          <span className="uppercase text-xs tracking-[0.3em]">Pelling, West Sikkim</span>
        </div>
      </div>

      <a
        href="#register"
        className="group mt-12 inline-flex items-center gap-3 bg-[#D4A574] hover:bg-[#e6bd8e] text-[#1C1C1C] font-semibold px-9 py-4 rounded-full transition-all shadow-2xl shadow-[#C84B0F]/30 hover:shadow-[#D4A574]/50 hover:-translate-y-0.5 uppercase tracking-[0.18em] text-sm animate-fade-in-up"
      >
        Register Interest
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </a>

      <p className="mt-16 text-[#FAF7F2]/60 text-xs uppercase tracking-[0.4em] animate-fade-in">
        Hosted by Urbane Haauz
      </p>
    </div>

    <style>{`
      @keyframes rb-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-18px) rotate(6deg); }
      }
    `}</style>
  </section>
);

const PhilosophySection: React.FC = () => (
  <section className="relative py-28 md:py-36 px-6 md:px-12 bg-[#FAF7F2] text-[#1C1C1C] overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-3xl">
      <MandalaDivider className="w-full h-10 opacity-70" />
    </div>

    <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 md:gap-16 items-start">
      <Reveal className="md:col-span-2">
        <span
          className="text-[#C84B0F] text-5xl md:text-6xl leading-none font-serif block mb-4"
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="font-serif italic text-2xl md:text-3xl leading-tight text-[#1C1C1C]">
          Culture does not end at borders. It flows like rivers — finding new valleys, creating new stories.
        </blockquote>
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px w-12 bg-[#D4A574]" />
          <span className="text-xs uppercase tracking-[0.3em] text-[#4A7C59]">Ranglaher Utsav Manifesto</span>
        </div>
      </Reveal>

      <Reveal className="md:col-span-3" delay={120}>
        <div className="space-y-6 text-[#1C1C1C]/80 font-serif text-lg leading-relaxed">
          <p>
            Pelling sits at a crossroads — where Tibetan Buddhism touches Nepali folk traditions,
            where the Kanchenjunga's shadow falls on villages that still sing songs older than the
            highways. And yet, for too long, Pelling has been a place you pass through on the way
            to a viewpoint. <span className="text-[#C84B0F] font-semibold">Ranglaher Utsav exists to change that.</span>
          </p>
          <p>
            This May, a group of exceptionally talented artists from West Bengal — painters whose
            brushes tell countless stories, along with folk Baul singers, instrumentalists, dancers,
            and reciters — will come together to meet and collaborate with their counterparts from
            Sikkim.
          </p>
          <p>
            We believe tourism should mean cultural exchange, not just mountain views. We believe
            the food cooked by a grandmother in Dentam carries as much soul as a fine-dining menu.
            We believe Pelling's children deserve to see their own culture celebrated, and to meet
            artists who have made a life from tradition. Ranglaher Utsav is our first step.
          </p>
        </div>
      </Reveal>
    </div>

    <div className="mt-24 max-w-3xl mx-auto">
      <MandalaDivider className="w-full h-12 opacity-60" />
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                               PROGRAM CARDS                                */
/* -------------------------------------------------------------------------- */

const PROGRAMS = [
  {
    Icon: Palette,
    title: 'Art & Art Competition',
    kicker: 'Art',
    body: "Art and Art Competition at Ranglaher Utsav brings together creativity, learning, and cultural exchange on one vibrant platform. Young participants receive first-hand guidance and inspiration from seasoned stalwarts, gaining valuable exposure beyond the classroom. The competition is not just about showcasing talent, but about nurturing it through interaction, observation, and experience. At the same time, artists from Sikkim connect with visiting artists from West Bengal, creating a meaningful exchange of ideas, techniques, and perspectives. This shared space encourages collaboration, celebrates diversity in artistic expression, and builds a bridge between two rich cultural landscapes through the universal language of art.",
    accent: '#D4A574',
  },
  {
    Icon: Music,
    title: 'Folk Music, Instrumental & Dance',
    kicker: 'Performing Arts',
    body: "Folk Music, Instrumental Performances, and Dance at Ranglaher Utsav present a vibrant cultural tapestry of Bengal and Sikkim. Folk singers from both regions bring soulful melodies, while instrumentalists add depth and rhythm to the experience. Dancers from Bengal showcase expressive forms like Kathak and contemporary, alongside Sikkim's Limbu, Lepcha, and Bhutia communities performing traditional dances such as the Chyabrung. Reciters add a literary touch by presenting works of iconic poets from their respective cultures. Together, these performances create a powerful cultural confluence, celebrating heritage, storytelling, and artistic diversity in its most authentic and immersive form.",
    accent: '#C84B0F',
  },
  {
    Icon: Utensils,
    title: 'Culinary Heritage',
    kicker: 'Food',
    body: "The Culinary Heritage segment at Ranglaher Utsav celebrates the rich and diverse palates of Bengal and Sikkim, bringing together flavours shaped by tradition, culture, and generations of expertise. It is a platform to proudly showcase timeless recipes and authentic tastes for all to savour and appreciate. From local delicacies to regional classics, this segment highlights the unique culinary identities of both regions. It also empowers small and large food joints of Pelling to present their masterful touch and age-old traditions, creating a vibrant space where food becomes a storyteller of heritage, passion and community.",
    accent: '#4A7C59',
  },
];

const ProgramCard: React.FC<{ p: (typeof PROGRAMS)[number]; idx: number }> = ({ p, idx }) => (
  <Reveal delay={idx * 80}>
    <article
      className="group relative h-full bg-[#FAF7F2] rounded-2xl p-8 border border-[#1C1C1C]/10 hover:border-[#D4A574] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
      style={{ boxShadow: '0 10px 40px -20px rgba(28,28,28,0.15)' }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${p.accent}, #D4A574)` }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ background: `${p.accent}15`, color: p.accent }}
      >
        <p.Icon className="w-6 h-6" />
      </div>
      <span className="text-xs uppercase tracking-[0.3em] text-[#4A7C59]">{p.kicker}</span>
      <h3 className="mt-2 font-serif text-2xl leading-tight text-[#1C1C1C]">{p.title}</h3>
      <p className="mt-4 text-[#1C1C1C]/70 leading-relaxed">{p.body}</p>
      <div className="mt-6 flex items-center gap-2 text-[#D4A574] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
        Details coming soon <ArrowRight className="w-4 h-4" />
      </div>
    </article>
  </Reveal>
);

const ProgramSection: React.FC = () => (
  <section className="py-28 md:py-36 px-6 md:px-12 bg-gradient-to-b from-[#FAF7F2] to-[#f2ece0]">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.5em] text-[#C84B0F]">What's Happening</span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl text-[#1C1C1C] leading-tight">
            What's Happening
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-[#1C1C1C]/65 text-lg">
            A celebration of Creativity, Rhythm & Taste
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {PROGRAMS.map((p, i) => (
          <ProgramCard p={p} idx={i} key={p.title} />
        ))}
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                             ARTISTS (12 VOICES)                            */
/* -------------------------------------------------------------------------- */

const CulturalConglomerateSection: React.FC = () => (
  <section className="py-28 md:py-36 relative overflow-hidden bg-[#2D1B69] text-[#FAF7F2]">
    <NoiseOverlay />
    <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
      <Reveal>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.5em] text-[#D4A574]">
            Tale of Two States
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
            Tale of Two States
          </h2>
          <p className="mt-5 text-[#FAF7F2]/75 text-base md:text-lg leading-relaxed">
            Tale of Two States brings together the vibrant spirit of West Bengal and the serene soul
            of Sikkim in a unique cultural celebration. From the red soils of Bengal to the misty
            mountains of Sikkim, this festival is a harmonious blend of{' '}
            <span className="text-[#D4A574]">art</span>,{' '}
            <span className="text-[#D4A574]">music</span>, and{' '}
            <span className="text-[#D4A574]">culinary heritage</span>. It showcases the richness,
            diversity, and shared warmth of two distinct regions, united through creativity and
            tradition.
          </p>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[#FAF7F2]/75 text-base md:text-lg leading-relaxed">
            Artists, performers, and culinary experts come together to exchange stories, flavours,
            and expressions, creating an experience that transcends boundaries. It is not just a
            festival, but a journey where two cultures meet, interact, and become one.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                             PAINTERS FROM BENGAL                           */
/* -------------------------------------------------------------------------- */

type Artist = {
  name: string;
  image: string;
  bio: string;
  feature?: boolean;
};

const ARTISTS: Artist[] = [
  {
    name: 'Sudip Biswas',
    image: '/artists/sudip-biswas.jpeg',
    bio: "A professional painter since 2004, trained with an M.V.A. from Kolkata's Government College of Art and Craft. Recipient of the Kala Ratna Award (2025) and a first-prize honour from the Ministry of Culture, Government of India, with exhibitions across India and Bangladesh.",
    feature: true,
  },
  {
    name: 'Santanu Baidya',
    image: '/artists/santanu-baidya.jpeg',
    bio: "A First-Class B.V.A. graduate of Kolkata's Government College of Art and Craft, with two decades of participation in group shows, annual exhibitions, and art fairs across India. He teaches art at Springdale School in Nadia, West Bengal.",
    feature: true,
  },
  {
    name: 'Kanika Sarkar',
    image: '/artists/kanika-sarkar.jpg',
    bio: "A Bengal painter whose canvases weave colour and memory into quiet, evocative compositions. Her visual language draws from the everyday rhythms of life in West Bengal.",
  },
  {
    name: 'Pravat Kr Manna',
    image: '/artists/pravat-kr-manna.jpeg',
    bio: "A painter rooted in West Bengal's contemporary art scene, known for textured, layered works that hover between abstraction and figuration. His paintings have featured in group exhibitions across Bengal.",
  },
  {
    name: 'Susanta Das',
    image: '/artists/susanta-das.jpeg',
    bio: "A contemporary painter whose canvases explore line, colour, and the layered textures of lived environments. His work has been a regular feature at group shows across West Bengal.",
  },
  {
    name: 'Bappa Maji',
    image: '/artists/bappa-maji.jpeg',
    bio: "A Bengal painter threading tradition and the modern moment, moving between figurative and abstract vocabulary. His paintings reflect a deep engagement with Bengal's visual and cultural heritage.",
  },
  {
    name: 'Pijush Das',
    image: '/artists/pijush-das.jpeg',
    bio: "A painter from West Bengal working at the intersection of form, colour, and narrative — canvases that invite slow, considered viewing. He has participated in shows across Kolkata and beyond.",
  },
  {
    name: 'Tanmoy Hazra',
    image: '/artists/tanmoy-hazra.jpeg',
    bio: "A contemporary painter bringing a quiet, observational lens to colour and composition. His paintings have been shown at group exhibitions across the state.",
  },
  {
    name: 'Kartick Roy',
    image: '/artists/kartick-roy.png',
    bio: "A Bengal-based painter exploring figurative and abstract registers with an eye for tonal nuance and atmosphere. His practice is grounded in a close reading of place and light.",
  },
  {
    name: 'Sristha Ganguly',
    image: '/artists/sristha-ganguly.jpeg',
    bio: "A young painter from West Bengal whose evolving practice engages contemporary themes through a distinctly personal palette. Her work represents a new generation of Bengal's painters stepping onto the gallery scene.",
  },
];

const ArtistCard: React.FC<{ artist: Artist; idx: number }> = ({ artist, idx }) => (
  <Reveal delay={idx * 60}>
    <article className="group h-full bg-[#FAF7F2]/[0.04] border border-[#FAF7F2]/10 hover:border-[#D4A574]/60 rounded-2xl overflow-hidden backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#D4A574]/10 flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#1C1C1C] to-[#2D1B69]">
        <img
          src={artist.image}
          alt={`Portrait of ${artist.name}, painter`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0D0D2B]/90 via-[#0D0D2B]/40 to-transparent" />
        {artist.feature && (
          <div className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.25em] bg-[#D4A574] text-[#1C1C1C] px-2.5 py-1 rounded-full font-semibold">
            Featured
          </div>
        )}
      </div>
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <h3 className="font-serif text-xl md:text-2xl text-[#FAF7F2] leading-tight">
          {artist.name}
        </h3>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4A574] mt-1.5">
          Painter · West Bengal
        </p>
        <p className="mt-4 text-sm text-[#FAF7F2]/75 leading-relaxed flex-1">
          {artist.bio}
        </p>
      </div>
    </article>
  </Reveal>
);

const ArtistsSection: React.FC = () => (
  <section className="py-28 md:py-36 relative overflow-hidden bg-[#1f1248] text-[#FAF7F2]">
    <NoiseOverlay />
    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
      <Reveal>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.5em] text-[#D4A574]">
            The Lineup
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
            Painters from Bengal
          </h2>
          <p className="mt-4 text-[#FAF7F2]/70 text-base md:text-lg leading-relaxed">
            Ten contemporary painters travelling to Pelling — each bringing a distinct
            vocabulary of colour, form, and quiet observation to the Himalayas.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 md:gap-6">
        {ARTISTS.map((a, i) => (
          <ArtistCard key={a.name} artist={a} idx={i} />
        ))}
      </div>

      <Reveal delay={250}>
        <div className="text-center mt-14 max-w-2xl mx-auto">
          <div className="h-px w-20 mx-auto bg-[#D4A574]/40 mb-6" />
          <p className="text-[#FAF7F2]/65 italic text-sm md:text-base">
            Works from the visiting painters will be exhibited at Urbane Haauz during the
            festival. Prints and select originals will be available to collectors.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                                FOOD SECTION                                */
/* -------------------------------------------------------------------------- */

const SIKKIMESE = [
  { name: 'Thukpa', note: 'Hand-pulled noodles, bone broth, mountain herbs' },
  { name: 'Momo', note: 'Steamed dumplings — pork, beef, veg' },
  { name: 'Gundruk', note: 'Fermented leafy greens, a Sikkimese winter staple' },
  { name: 'Phaley', note: 'Tibetan fried bread — crispy, stuffed, and soul-warming' },
  { name: 'Thai Po', note: 'Traditional Sikkimese snack with a distinctive flavour' },
];

const BENGALI = [
  { name: 'Rolls', note: 'Kolkata-style kathi rolls — fast food with flair' },
  { name: 'Luchi & Alur Dom', note: 'Fried flatbread, slow-cooked spiced potatoes' },
  { name: 'Shorshe Maach', note: 'Fish in mustard paste — the Bengali soul dish' },
  { name: 'Rosogolla', note: 'Cottage cheese syrup-soaked dumplings' },
];

const FoodSection: React.FC = () => (
  <section className="py-28 md:py-36 bg-[#FAF7F2]">
    <div className="max-w-6xl mx-auto px-6 md:px-12">
      <Reveal>
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.5em] text-[#C84B0F]">At the Table</span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl text-[#1C1C1C] leading-tight">
            Two Kitchens, One Table
          </h2>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-8">
        <Reveal>
          <div className="relative rounded-2xl overflow-hidden p-10 h-full border border-[#2C5F7C]/20 bg-gradient-to-br from-[#2C5F7C] to-[#1a4053] text-[#FAF7F2]">
            <div className="absolute top-6 right-6 text-[#D4A574] text-xs uppercase tracking-[0.3em]">
              Sikkim
            </div>
            <h3 className="font-serif text-3xl mb-2">Sikkimese Kitchen</h3>
            <p className="text-[#FAF7F2]/70 text-sm mb-8">Sourced from Pelling and Dentam</p>
            <ul className="space-y-5">
              {SIKKIMESE.map((f) => (
                <li key={f.name} className="flex gap-4 border-b border-[#FAF7F2]/10 pb-4 last:border-0">
                  <span className="w-10 h-10 rounded-full bg-[#D4A574]/20 text-[#D4A574] flex items-center justify-center font-serif text-lg shrink-0">
                    •
                  </span>
                  <div>
                    <h4 className="font-serif text-lg">{f.name}</h4>
                    <p className="text-sm text-[#FAF7F2]/70">{f.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative rounded-2xl overflow-hidden p-10 h-full border border-[#C84B0F]/20 bg-gradient-to-br from-[#C84B0F] to-[#8a2f06] text-[#FAF7F2]">
            <div className="absolute top-6 right-6 text-[#D4A574] text-xs uppercase tracking-[0.3em]">
              Bengal
            </div>
            <h3 className="font-serif text-3xl mb-2">Bengali Kitchen</h3>
            <p className="text-[#FAF7F2]/70 text-sm mb-8">
              Stories from the home kitchens of Bengal
            </p>
            <ul className="space-y-5">
              {BENGALI.map((f) => (
                <li key={f.name} className="flex gap-4 border-b border-[#FAF7F2]/10 pb-4 last:border-0">
                  <span className="w-10 h-10 rounded-full bg-[#D4A574]/20 text-[#D4A574] flex items-center justify-center font-serif text-lg shrink-0">
                    •
                  </span>
                  <div>
                    <h4 className="font-serif text-lg">{f.name}</h4>
                    <p className="text-sm text-[#FAF7F2]/70">{f.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={200}>
        <div className="mt-12 bg-[#4A7C59] rounded-2xl p-8 md:p-10 text-[#FAF7F2] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <div className="w-14 h-14 rounded-full bg-[#D4A574] text-[#1C1C1C] flex items-center justify-center shrink-0">
            <Heart className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h4 className="font-serif text-2xl mb-2">Supporting Local</h4>
            <p className="text-[#FAF7F2]/85 leading-relaxed">
              All food vendors at Ranglaher Utsav are from Pelling and surrounding communities. Zero
              platform fees, zero entry cost. A vendor-first model — they keep what they earn.
            </p>
          </div>
          <a
            href="#register"
            className="shrink-0 inline-flex items-center gap-2 bg-[#FAF7F2] text-[#1C1C1C] hover:bg-[#D4A574] px-5 py-3 rounded-full text-sm font-semibold uppercase tracking-[0.15em] transition"
          >
            Join as Vendor <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                             REGISTRATION SECTION                           */
/* -------------------------------------------------------------------------- */

const TIERS = [
  {
    name: 'Volunteers',
    sub: 'Be part of the team',
    body: 'Help organise and run the festival. Art competition support, event coordination, and community engagement.',
    accent: '#4A7C59',
  },
  {
    name: 'Cultural Pass',
    sub: 'Full festival',
    body: 'All performances across three days. Entry to art exhibition and food stalls.',
    accent: '#D4A574',
    featured: true,
  },
  {
    name: 'Participants',
    sub: 'Artists & Performers',
    body: 'For artists, musicians, dancers, and culinary experts participating in Ranglaher Utsav.',
    accent: '#C84B0F',
  },
];

const RegistrationSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    console.log('[ranglaher-utsav] interest registered:', email);
    setSubmitted(true);
  };

  return (
    <section id="register" className="py-28 md:py-36 px-6 md:px-12 bg-[#1C1C1C] text-[#FAF7F2] relative overflow-hidden">
      <NoiseOverlay />
      <div className="relative z-10 max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.5em] text-[#D4A574]">Registration</span>
            <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
              Be Part of Ranglaher Utsav
            </h2>
          </div>
        </Reveal>

        <div className="relative">
          <div className="absolute -top-6 -right-4 md:right-0 z-20 pointer-events-none">
            <div
              className="border-4 border-[#C84B0F] text-[#C84B0F] font-serif tracking-[0.2em] text-xs md:text-sm uppercase px-6 py-3 rounded"
              style={{
                transform: 'rotate(-8deg)',
                boxShadow: '0 0 0 2px rgba(200,75,15,0.15), 0 8px 30px -10px rgba(200,75,15,0.6)',
                background: 'rgba(28,28,28,0.9)',
              }}
            >
              Coming Soon
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 100}>
                <div
                  className={`h-full rounded-2xl p-8 border transition-all ${
                    tier.featured
                      ? 'border-[#D4A574] bg-[#D4A574]/5 scale-[1.02]'
                      : 'border-[#FAF7F2]/10 bg-[#FAF7F2]/[0.03]'
                  }`}
                >
                  <div
                    className="h-1 w-12 mb-6 rounded-full"
                    style={{ background: tier.accent }}
                  />
                  <h3 className="font-serif text-2xl mb-1">{tier.name}</h3>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#D4A574] mb-5">
                    {tier.sub}
                  </p>
                  <p className="text-[#FAF7F2]/70 leading-relaxed text-sm">{tier.body}</p>
                  <p className="mt-8 text-xs uppercase tracking-[0.2em] text-[#FAF7F2]/40">
                    Pricing TBD
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={200}>
          <div className="mt-16 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h4 className="font-serif text-2xl mb-2">
                Be the first to know when tickets open
              </h4>
              <p className="text-[#FAF7F2]/60 text-sm">
                We'll email you the moment registration goes live. No spam.
              </p>
            </div>
            {submitted ? (
              <div className="text-center bg-[#4A7C59]/30 border border-[#4A7C59] rounded-full px-6 py-4 text-[#D4A574]">
                Thank you. We'll be in touch as Ranglaher Utsav takes shape.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border border-[#FAF7F2]/20 rounded-full px-6 py-3.5 text-[#FAF7F2] placeholder:text-[#FAF7F2]/40 focus:border-[#D4A574] focus:outline-none"
                  style={{ backgroundColor: 'rgba(28,28,28,0.6)', color: '#FAF7F2' }}
                />
                <button
                  type="submit"
                  className="bg-[#D4A574] hover:bg-[#e6bd8e] text-[#1C1C1C] font-semibold px-8 py-3.5 rounded-full uppercase tracking-[0.15em] text-sm transition"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  FOOTER                                    */
/* -------------------------------------------------------------------------- */

const FooterCTA: React.FC = () => (
  <footer className="bg-[#0D0D2B] text-[#FAF7F2] py-16 px-6 md:px-12 relative overflow-hidden">
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(212,165,116,0.3), transparent 40%), radial-gradient(circle at 80% 80%, rgba(200,75,15,0.25), transparent 40%)',
      }}
    />
    <div className="relative z-10 max-w-5xl mx-auto text-center">
      <div className="inline-flex items-center gap-3 mb-6">
        <Users className="w-5 h-5 text-[#D4A574]" />
        <span className="text-xs uppercase tracking-[0.4em] text-[#D4A574]">
          A Pelling Cultural Initiative
        </span>
      </div>

      <h3 className="font-serif text-3xl md:text-5xl leading-tight mb-2">
        Ranglaher Utsav
      </h3>
      <p className="text-[#D4A574] text-sm md:text-base uppercase tracking-[0.4em] mb-6">
        The Tale Of Two States
      </p>
      <p className="text-[#FAF7F2]/70 max-w-xl mx-auto mb-10">
        Produced and hosted by Urbane Haauz — a boutique hotel in Upper Pelling committed to
        making Sikkim a cultural destination, not just a viewpoint.
      </p>

      <div className="flex justify-center gap-4 mb-10">
        <button
          aria-label="Share"
          className="w-11 h-11 rounded-full border border-[#FAF7F2]/20 hover:border-[#D4A574] hover:text-[#D4A574] flex items-center justify-center transition"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <a
          href="https://instagram.com/urbanehaauz"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-11 h-11 rounded-full border border-[#FAF7F2]/20 hover:border-[#D4A574] hover:text-[#D4A574] flex items-center justify-center transition"
        >
          <Instagram className="w-4 h-4" />
        </a>
        <a
          href="https://facebook.com/urbanehaauz"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="w-11 h-11 rounded-full border border-[#FAF7F2]/20 hover:border-[#D4A574] hover:text-[#D4A574] flex items-center justify-center transition"
        >
          <Facebook className="w-4 h-4" />
        </a>
      </div>

      <a
        href="https://urbanehaauz.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-[#D4A574] hover:text-[#FAF7F2] text-sm uppercase tracking-[0.22em] transition"
      >
        urbanehaauz.com <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <div className="mt-10 pt-8 border-t border-[#FAF7F2]/10 text-xs text-[#FAF7F2]/40 uppercase tracking-[0.3em]">
        © 2025 Urbane Haauz · Upper Pelling · West Sikkim
      </div>
    </div>
  </footer>
);

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

const Rangbhoomi: React.FC = () => (
  <>
    <Helmet>
      <title>Ranglaher Utsav · The Tale Of Two States | Urbane Haauz</title>
      <meta
        name="description"
        content="Ranglaher Utsav — a Bengal-Sikkim cultural celebration bringing artists, music, and cuisine together in Pelling, West Sikkim. Hosted by Urbane Haauz."
      />
      <meta property="og:title" content="Ranglaher Utsav · The Tale Of Two States" />
      <meta
        property="og:description"
        content="Art is in the Air; Music is in the Mist and Flavours on your Plate. May 2025, Pelling, Sikkim."
      />
      <meta property="og:type" content="event" />
      <link rel="canonical" href="https://urbanehaauz.com/#/ranglaher-utsav" />
    </Helmet>

    <div className="bg-[#FAF7F2] text-[#1C1C1C]">
      <HeroSection />
      <PhilosophySection />
      <ProgramSection />
      <CulturalConglomerateSection />
      <ArtistsSection />
      <FoodSection />
      <RegistrationSection />
      <FooterCTA />
    </div>
  </>
);

export default Rangbhoomi;
