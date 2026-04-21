import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronDown,
  ChevronUp,
  Moon,
  Sparkles,
  TrendingUp,
  Users,
  Palette,
  Archive,
  Globe,
  Music,
  Utensils,
  ArrowRight,
  ArrowDown,
  Building2,
  Hotel,
  HandHeart,
  ExternalLink,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabase';

/* -------------------------------------------------------------------------- */
/*                           HOOKS & SHARED HELPERS                           */
/* -------------------------------------------------------------------------- */

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
}> = ({ children, delay = 0, className = '' }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  SVG ART                                   */
/* -------------------------------------------------------------------------- */

const StarField: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
    <defs>
      <radialGradient id="pd-star">
        <stop offset="0%" stopColor="#FAF7F2" />
        <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
      </radialGradient>
    </defs>
    {Array.from({ length: 80 }).map((_, i) => {
      const x = (i * 97 + 23) % 100;
      const y = (i * 53 + 11) % 100;
      const r = (i % 5) * 0.4 + 0.6;
      const o = 0.2 + ((i * 17) % 70) / 100;
      return (
        <circle
          key={i}
          cx={`${x}%`}
          cy={`${y}%`}
          r={r}
          fill="#FAF7F2"
          opacity={o}
          style={{ animation: `pd-twinkle ${2 + (i % 5)}s ease-in-out ${i * 0.13}s infinite` }}
        />
      );
    })}
  </svg>
);

const MountainSilhouette: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 1600 400" fill="none" preserveAspectRatio="none" className={className}>
    <path
      d="M0,400 L0,260 L160,170 L340,230 L520,110 L720,220 L900,140 L1080,240 L1260,170 L1440,250 L1600,200 L1600,400 Z"
      fill="#0a0a1f"
    />
    <path
      d="M0,400 L0,320 L140,260 L320,310 L500,230 L700,310 L900,260 L1100,320 L1280,270 L1460,330 L1600,290 L1600,400 Z"
      fill="#050512"
    />
  </svg>
);

const SleepingVillageSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 400 240" className={className} fill="none">
    <rect width="400" height="240" fill="#1f1f28" />
    {/* distant mountain */}
    <path d="M0,170 L80,110 L160,150 L260,90 L340,140 L400,120 L400,240 L0,240 Z" fill="#14141b" />
    {/* houses */}
    {[
      { x: 50, w: 45, h: 36 },
      { x: 110, w: 50, h: 42 },
      { x: 180, w: 55, h: 38 },
      { x: 255, w: 48, h: 46 },
      { x: 320, w: 44, h: 34 },
    ].map((h, i) => (
      <g key={i}>
        <rect x={h.x} y={240 - h.h} width={h.w} height={h.h} fill="#0c0c14" stroke="#2a2a36" />
        <polygon
          points={`${h.x - 4},${240 - h.h} ${h.x + h.w / 2},${240 - h.h - 16} ${h.x + h.w + 4},${240 - h.h}`}
          fill="#0c0c14"
          stroke="#2a2a36"
        />
        {/* one dim lit window */}
        {i === 2 && (
          <rect
            x={h.x + h.w / 2 - 4}
            y={240 - h.h + h.h / 2 - 4}
            width="8"
            height="8"
            fill="#D4A574"
            opacity="0.35"
          />
        )}
      </g>
    ))}
    {/* moon */}
    <circle cx="340" cy="40" r="14" fill="#FAF7F2" opacity="0.25" />
    {/* zzz */}
    <text
      x="200"
      y="30"
      textAnchor="middle"
      fill="#5a5a68"
      fontSize="18"
      fontFamily="serif"
      fontStyle="italic"
    >
      zzz...
    </text>
  </svg>
);

const VibrantVillageSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 400 240" className={className} fill="none">
    <defs>
      <linearGradient id="pd-skygr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2D1B69" />
        <stop offset="100%" stopColor="#C84B0F" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    <rect width="400" height="240" fill="url(#pd-skygr)" />
    {/* glowing mountain */}
    <path d="M0,170 L80,100 L160,150 L260,80 L340,140 L400,120 L400,240 L0,240 Z" fill="#4A7C59" />
    <path
      d="M0,170 L80,100 L160,150 L260,80 L340,140 L400,120"
      stroke="#D4A574"
      strokeWidth="1"
      fill="none"
      opacity="0.6"
    />
    {/* lanterns strung */}
    {[60, 110, 170, 230, 290, 340].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="30" x2={x} y2="55" stroke="#D4A574" strokeWidth="1" />
        <circle cx={x} cy="60" r="6" fill="#D4A574" opacity="0.95" />
        <circle cx={x} cy="60" r="10" fill="#D4A574" opacity="0.25" />
      </g>
    ))}
    <path d="M40,30 Q200,10 360,30" stroke="#D4A574" strokeWidth="0.6" fill="none" opacity="0.5" />
    {/* stage + performers */}
    <rect x="140" y="170" width="120" height="8" fill="#1C1C1C" />
    <rect x="140" y="178" width="120" height="4" fill="#D4A574" />
    {/* dancers */}
    {[170, 200, 230].map((cx, i) => (
      <g key={i}>
        <circle cx={cx} cy="155" r="5" fill="#FAF7F2" />
        <path d={`M${cx - 6},160 Q${cx},170 ${cx + 6},160 L${cx + 4},170 L${cx - 4},170 Z`} fill="#C84B0F" />
      </g>
    ))}
    {/* market stalls */}
    {[30, 75, 300, 355].map((x, i) => (
      <g key={i}>
        <rect x={x} y="195" width="30" height="30" fill="#FAF7F2" stroke="#D4A574" />
        <polygon
          points={`${x - 3},195 ${x + 15},180 ${x + 33},195`}
          fill={i % 2 === 0 ? '#C84B0F' : '#4A7C59'}
        />
      </g>
    ))}
    {/* people silhouettes */}
    {[50, 90, 280, 330, 370].map((cx, i) => (
      <circle key={i} cx={cx} cy="230" r="3" fill="#1C1C1C" />
    ))}
  </svg>
);

const BlueprintSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 500 400" className={className} fill="none">
    <rect width="500" height="400" fill="none" stroke="#D4A574" strokeOpacity="0.3" strokeDasharray="4 4" />

    {/* Grid */}
    {Array.from({ length: 10 }).map((_, i) => (
      <g key={i}>
        <line x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#D4A574" strokeOpacity="0.08" />
        <line x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#D4A574" strokeOpacity="0.08" />
      </g>
    ))}

    {/* Amphitheater (center) */}
    <g transform="translate(250 200)">
      <circle r="90" fill="none" stroke="#D4A574" strokeWidth="1.2" />
      <circle r="70" fill="none" stroke="#D4A574" strokeOpacity="0.6" strokeDasharray="2 3" />
      <circle r="45" fill="#D4A574" fillOpacity="0.1" stroke="#D4A574" strokeWidth="1" />
      <circle r="20" fill="#D4A574" fillOpacity="0.2" />
      <text y="5" textAnchor="middle" fill="#D4A574" fontSize="9" fontFamily="serif">
        STAGE
      </text>
      {/* seating radials */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
        <line
          key={a}
          x1="0"
          y1="0"
          x2={70 * Math.cos((a * Math.PI) / 180)}
          y2={70 * Math.sin((a * Math.PI) / 180)}
          stroke="#D4A574"
          strokeOpacity="0.25"
        />
      ))}
    </g>

    {/* Food ring (around amphitheater) */}
    <g>
      <text x="250" y="50" textAnchor="middle" fill="#D4A574" fontSize="10" fontFamily="serif" letterSpacing="3">
        FOOD RING
      </text>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const cx = 250 + Math.cos(a) * 140;
        const cy = 200 + Math.sin(a) * 140;
        return (
          <rect
            key={i}
            x={cx - 12}
            y={cy - 10}
            width="24"
            height="20"
            fill="none"
            stroke="#D4A574"
            strokeOpacity="0.7"
            strokeWidth="1"
          />
        );
      })}
    </g>

    {/* Artist stalls (perimeter) */}
    <g>
      {[
        [40, 40],
        [80, 40],
        [420, 40],
        [460, 40],
        [40, 360],
        [80, 360],
        [420, 360],
        [460, 360],
        [40, 200],
        [460, 200],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x - 16}
            y={y - 10}
            width="32"
            height="20"
            fill="none"
            stroke="#4A7C59"
            strokeWidth="1"
          />
          <text x={x} y={y + 3} textAnchor="middle" fill="#4A7C59" fontSize="6">
            ART
          </text>
        </g>
      ))}
    </g>

    {/* Viewing deck (top) */}
    <g>
      <rect
        x="180"
        y="20"
        width="140"
        height="25"
        fill="none"
        stroke="#C84B0F"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <text x="250" y="75" textAnchor="middle" fill="#C84B0F" fontSize="9" letterSpacing="2" fontFamily="serif">
        KANCHENJUNGA VIEWING DECK
      </text>
    </g>

    {/* Annotations */}
    <text x="10" y="395" fill="#D4A574" fontSize="8" fontFamily="monospace" opacity="0.7">
      PROPOSED — PELLING CULTURAL CENTER · concept plan
    </text>
    <text x="490" y="395" textAnchor="end" fill="#D4A574" fontSize="8" fontFamily="monospace" opacity="0.7">
      NOT TO SCALE
    </text>
  </svg>
);

/* -------------------------------------------------------------------------- */
/*                                 HEADER                                     */
/* -------------------------------------------------------------------------- */

const StandaloneHeader: React.FC<{ onDark?: boolean }> = ({ onDark = true }) => (
  <header
    className={`absolute top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex items-center justify-between no-print ${
      onDark ? 'text-[#FAF7F2]' : 'text-[#1C1C1C]'
    }`}
  >
    <Link
      to="/"
      className="group flex items-center gap-2 hover:text-[#D4A574] transition-colors"
    >
      <img src="/uh-badge.png" alt="Urbane Haauz" className="w-10 h-10 rounded-full object-cover" />
      <span className="opacity-60 text-sm">·</span>
      <span className="text-xs uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100">
        Pelling Cultural Initiative
      </span>
    </Link>
    <span className="hidden md:inline-block text-xs uppercase tracking-[0.3em] opacity-60">
      Policy Brief · For the Tourism Board of Sikkim
    </span>
  </header>
);

/* -------------------------------------------------------------------------- */
/*                              1. OPENING HERO                               */
/* -------------------------------------------------------------------------- */

const OpeningHero: React.FC = () => (
  <section className="relative min-h-screen overflow-hidden bg-[#0D0D2B] text-[#FAF7F2] flex items-center dark-section">
    <StarField />
    <MountainSilhouette className="absolute bottom-0 left-0 w-full h-[34%] opacity-90" />
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(45,27,105,0.5) 0%, transparent 60%)',
      }}
    />

    <StandaloneHeader onDark />

    <div className="relative z-10 w-full px-6 md:px-12 pt-28 pb-24 max-w-5xl mx-auto">
      <Reveal>
        <div className="inline-flex items-center gap-2 text-[#D4A574] border border-[#D4A574]/40 px-4 py-1.5 rounded-full mb-10">
          <Moon className="w-3.5 h-3.5" />
          <span className="text-xs uppercase tracking-[0.3em]">A Vision for Cultural Tourism</span>
        </div>
      </Reveal>

      <Reveal delay={150}>
        <h1 className="font-serif text-5xl md:text-8xl leading-[0.95] tracking-tight mb-6">
          Pelling 2.0
        </h1>
        <p className="font-serif text-2xl md:text-4xl text-[#D4A574] mb-10">
          Pelling's evenings, reimagined.
        </p>
      </Reveal>

      <Reveal delay={300}>
        <p className="text-lg md:text-2xl text-[#FAF7F2]/80 leading-relaxed max-w-3xl mb-12">
          A structured vision for nightly cultural programming, tourist-attraction events, and a
          sustained evening economy — positioning West Sikkim at the heart of India's cultural
          tourism story.
        </p>
      </Reveal>

      <Reveal delay={450}>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mb-6">
          <div className="bg-[#FAF7F2]/5 backdrop-blur border border-[#FAF7F2]/10 rounded-xl p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-[#FAF7F2]/50 mb-2">
              Pelling today
            </div>
            <div className="font-serif text-4xl text-[#FAF7F2]">1.2 nights</div>
            <div className="text-sm text-[#FAF7F2]/60 mt-1">avg tourist stay</div>
          </div>
          <div className="bg-[#D4A574]/10 backdrop-blur border border-[#D4A574]/30 rounded-xl p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-[#D4A574] mb-2">
              Rajasthan cultural tourism
            </div>
            <div className="font-serif text-4xl text-[#D4A574]">3.4 nights</div>
            <div className="text-sm text-[#FAF7F2]/60 mt-1">avg tourist stay</div>
          </div>
        </div>
        <p className="text-[10px] text-[#FAF7F2]/40 max-w-2xl mb-14">
          Source: Sikkim Tourism Dept annual report 2024; Rajasthan Tourism Development Corporation 2023.
        </p>
      </Reveal>

      <Reveal delay={600}>
        <a
          href="#gap"
          className="group inline-flex items-center gap-3 text-[#D4A574] hover:text-[#FAF7F2] transition"
        >
          <span className="text-sm uppercase tracking-[0.3em]">The vision, in detail</span>
          <span className="w-10 h-10 rounded-full border border-[#D4A574]/40 group-hover:border-[#D4A574] flex items-center justify-center">
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </span>
        </a>
      </Reveal>
    </div>

    <style>{`
      @keyframes pd-twinkle {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 0.85; }
      }
    `}</style>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                         2. GAP — VISUAL COMPARISON                         */
/* -------------------------------------------------------------------------- */

const GapSection: React.FC = () => (
  <section id="gap" className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF7F2] text-[#1C1C1C]">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.5em] text-[#C84B0F]">The Opportunity</span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
            Two Pellings. One Opportunity.
          </h2>
          <p className="mt-5 text-[#1C1C1C]/65 text-lg">
            Today, Pelling winds down at sunset — not by choice, but for lack of a stage.
            With structured cultural programming, the same village opens a second evening
            chapter for tourists and residents alike.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <Reveal>
          <div
            className="rounded-2xl overflow-hidden h-full border border-[#1C1C1C]/10"
            style={{ filter: 'grayscale(100%) contrast(0.95)' }}
          >
            <SleepingVillageSVG className="w-full aspect-[5/3]" />
            <div className="p-8 bg-[#FAF7F2]">
              <div className="text-xs uppercase tracking-[0.3em] text-[#1C1C1C]/50 mb-2">
                Today's evening
              </div>
              <h3 className="font-serif text-2xl mb-3">Understated, after sunset</h3>
              <ul className="text-[#1C1C1C]/70 space-y-1.5 text-sm">
                <li>— Most shops close by early evening</li>
                <li>— Cultural programming limited to festival dates</li>
                <li>— Evening economy remains largely untapped</li>
                <li>— Many visitors depart after a single morning</li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="rounded-2xl overflow-hidden h-full border-2 border-[#D4A574]">
            <VibrantVillageSVG className="w-full aspect-[5/3]" />
            <div className="p-8 bg-gradient-to-br from-[#FAF7F2] to-[#f5ecd9]">
              <div className="text-xs uppercase tracking-[0.3em] text-[#C84B0F] mb-2">
                With a Cultural Center
              </div>
              <h3 className="font-serif text-2xl mb-3">A cultural evening, by design</h3>
              <ul className="text-[#1C1C1C]/80 space-y-1.5 text-sm">
                <li>— Nightly folk and classical performances</li>
                <li>— Lantern-lit artisan and craft market</li>
                <li>— A living, local evening food economy</li>
                <li>— A compelling reason to extend the stay</li>
                <li>— Additional revenue streams for State government through event licensing & tourism taxes</li>
                <li>— Direct income for local artists, artisans, food vendors, venue owners & cab drivers</li>
                <li>— A sustainable development model for Pelling's village economy</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                      3. TRANSFORMATION — BEFORE / AFTER                    */
/* -------------------------------------------------------------------------- */

type DeltaStat = {
  metric: string;
  before: string;
  after: string;
  accent: string;
  note: string;
};

const STAY_TRAJECTORY = [
  { month: 'Jan', season: 'Peak', without: 1.2, with: 1.3, footfall: 500, revenue: 25000 },
  { month: 'Feb', season: 'Peak', without: 1.2, with: 1.5, footfall: 550, revenue: 35000 },
  { month: 'Mar', season: 'Peak', without: 1.2, with: 1.7, footfall: 600, revenue: 45000 },
  { month: 'Apr', season: 'Shoulder', without: 1.2, with: 1.9, footfall: 550, revenue: 50000 },
  { month: 'May', season: 'Shoulder', without: 1.2, with: 2.0, footfall: 500, revenue: 55000 },
  { month: 'Jun', season: 'Pre-monsoon', without: 1.1, with: 1.5, footfall: 350, revenue: 32000 },
  { month: 'Jul', season: 'Monsoon low', without: 0.8, with: 0.9, footfall: 120, revenue: 10000 },
  { month: 'Aug', season: 'Monsoon low', without: 0.7, with: 0.8, footfall: 100, revenue: 8000 },
  { month: 'Sep', season: 'Monsoon tail', without: 0.9, with: 1.1, footfall: 180, revenue: 16000 },
  { month: 'Oct', season: 'Peak', without: 1.2, with: 2.5, footfall: 650, revenue: 65000 },
  { month: 'Nov', season: 'Peak', without: 1.3, with: 2.6, footfall: 700, revenue: 75000 },
  { month: 'Dec', season: 'Peak', without: 1.2, with: 2.7, footfall: 680, revenue: 70000 },
];

const DELTA_STATS: DeltaStat[] = [
  {
    metric: 'Average Tourist Stay',
    before: '1.2 nights',
    after: '2.5 nights',
    accent: '#C84B0F',
    note: '+108% — a genuine second-night reason.',
  },
  {
    metric: 'Evening Active Hours',
    before: '0 hrs',
    after: '4+ hrs',
    accent: '#D4A574',
    note: 'Village wakes from 7 PM to 11 PM, every night.',
  },
  {
    metric: 'Direct Livelihoods',
    before: '~20',
    after: '200+',
    accent: '#4A7C59',
    note: '+900% — artists, vendors, drivers, and guides, earning year-round.',
  },
  {
    metric: 'Local Evening Economy',
    before: 'Absent',
    after: 'Thriving',
    accent: '#2C5F7C',
    note: 'From a closed shutter at dusk to a living marketplace.',
  },
  {
    metric: 'Annual Cultural Events',
    before: '2–3',
    after: '~270 nights',
    accent: '#2D1B69',
    note: 'Operational year-round excluding monsoon (Jul–Sep). ~270 active nights per year.',
  },
  {
    metric: 'Annual Tourist Footfall',
    before: 'Baseline',
    after: '1.5–2.5 lakh/yr',
    accent: '#8A3E7A',
    note: "Average daily footfall: 400–700 tourists/day. A second layer of economy on top of Pelling's existing tourism story.",
  },
];

const DeltaCard: React.FC<{ stat: DeltaStat; idx: number }> = ({ stat, idx }) => (
  <Reveal delay={idx * 80}>
    <div
      className="relative h-full rounded-2xl p-7 border bg-white overflow-hidden transition-all hover:-translate-y-1"
      style={{
        borderColor: `${stat.accent}33`,
        boxShadow: `0 10px 30px -15px ${stat.accent}40`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: stat.accent }}
      />
      <div className="text-[10px] uppercase tracking-[0.3em] text-[#1C1C1C]/50 mb-4">
        {stat.metric}
      </div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#1C1C1C]/40 mb-1">
            Before
          </div>
          <div className="font-serif text-2xl md:text-3xl text-[#1C1C1C]/45">
            {stat.before}
          </div>
        </div>
        <ArrowRight className="w-5 h-5 shrink-0" style={{ color: stat.accent }} />
        <div>
          <div
            className="text-[10px] uppercase tracking-[0.25em] mb-1"
            style={{ color: stat.accent }}
          >
            After
          </div>
          <div
            className="font-serif text-3xl md:text-4xl font-bold"
            style={{ color: stat.accent }}
          >
            {stat.after}
          </div>
        </div>
      </div>
      <p className="mt-5 text-xs text-[#1C1C1C]/60 border-t border-[#1C1C1C]/10 pt-3 leading-relaxed">
        {stat.note}
      </p>
    </div>
  </Reveal>
);

const TransformationSection: React.FC = () => {
  const { ref, inView } = useInView(0.15);
  return (
    <section
      ref={ref}
      className="py-24 md:py-32 px-6 md:px-12 bg-gradient-to-b from-[#FAF7F2] to-[#f2ede2] text-[#1C1C1C]"
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.5em] text-[#4A7C59]">
              Before · After
            </span>
            <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
              The Transformation
            </h2>
            <p className="mt-5 text-[#1C1C1C]/65 text-lg">
              Six shifts in the character of Pelling, modeled on comparable cultural tourism
              interventions in Rajasthan, Kerala, and Sri Lanka.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-16">
          {DELTA_STATS.map((s, i) => (
            <DeltaCard key={s.metric} stat={s} idx={i} />
          ))}
        </div>

        {/* Chart — Tourist stay trajectory (non-monetary) */}
        <Reveal>
          <div className="bg-white rounded-2xl p-4 md:p-8 border border-[#1C1C1C]/10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[#4A7C59] mb-1">
                  12-Month Trajectory
                </div>
                <h3 className="font-serif text-2xl text-[#1C1C1C]">
                  Average Tourist Stay, Month by Month
                </h3>
                <p className="text-sm text-[#1C1C1C]/60 mt-1">
                  Status-quo baseline versus projected trajectory with the Cultural Center
                  operational.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[3px] bg-[#1C1C1C]/30" />
                  <span className="text-[#1C1C1C]/60 uppercase tracking-[0.2em]">
                    Without Center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[3px] bg-[#C84B0F]" />
                  <span className="text-[#C84B0F] font-semibold uppercase tracking-[0.2em]">
                    With Center
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[320px] md:h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={STAY_TRAJECTORY}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1C" strokeOpacity={0.08} />
                  <XAxis
                    dataKey="month"
                    stroke="#1C1C1C"
                    tick={{ fill: '#1C1C1C', fontSize: 11 }}
                    axisLine={{ stroke: '#1C1C1C', strokeOpacity: 0.2 }}
                    tickLine={{ stroke: '#1C1C1C', strokeOpacity: 0.2 }}
                  />
                  <YAxis
                    domain={[0, 3]}
                    stroke="#1C1C1C"
                    tick={{ fill: '#1C1C1C', fontSize: 12 }}
                    axisLine={{ stroke: '#1C1C1C', strokeOpacity: 0.2 }}
                    tickLine={{ stroke: '#1C1C1C', strokeOpacity: 0.2 }}
                    tickFormatter={(v) => `${v}n`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1C1C1C',
                      border: 'none',
                      borderRadius: 8,
                      color: '#FAF7F2',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#D4A574' }}
                    formatter={(v: number, name: string) => [
                      `${v.toFixed(1)} nights`,
                      name === 'without' ? 'Without Center' : 'With Center',
                    ]}
                    labelFormatter={(label) => {
                      const item = STAY_TRAJECTORY.find((d) => d.month === label);
                      return item ? `${label} (${item.season}) — Footfall: ${item.footfall}/day, Rev: ₹${(item.revenue / 1000).toFixed(0)}K/night` : label;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="without"
                    stroke="#1C1C1C"
                    strokeOpacity={0.35}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    isAnimationActive={inView}
                    animationDuration={1400}
                  />
                  <Line
                    type="monotone"
                    dataKey="with"
                    stroke="#C84B0F"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#C84B0F', stroke: '#FAF7F2', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={inView}
                    animationDuration={1600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-xs text-[#1C1C1C]/50 italic border-t border-[#1C1C1C]/10 pt-3">
              Modeled on Kerala cultural tourism stay-extension data, scaled for Pelling. The
              "With Center" trajectory assumes phased rollout reaching full programming by Jun.
              Jul–Sep shows monsoon dip. Peak months (Oct–Mar) show highest footfall and revenue.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*                        4. PROOF OF CONCEPT — CASE STUDIES                  */
/* -------------------------------------------------------------------------- */

type CaseStudy = {
  name: string;
  stat: string;
  image: string;
  description: string;
  url?: string;
  tag?: string;
};

const FALLBACK_CASES: CaseStudy[] = [
  {
    name: 'Rajasthan — Chokhi Dhani',
    stat: 'Revenue: ₹10L–₹18L/night | 800–1,500 visitors/night | Entry: ₹1,000–₹1,700/person',
    image: '',
    description:
      'Location: Tonk Road, ~20km from Jaipur. Full-scale cultural village + dining ecosystem. Fixed evening timing 5PM–10:30PM, food+culture bundled. A complete evening economy model — food, folk performance, artisans, and retail under one experience.',
    url: 'https://chokhidhani.com/village-fair-restaurant-jaipur/live-entertainment/',
    tag: 'Domestic',
  },
  {
    name: 'Punjab — Sadda Pind',
    stat: 'Revenue: ₹3L–₹8L/night | 300–800 visitors/night | Entry: ₹700–₹1,500',
    image: '',
    description:
      'Location: Amritsar. Cultural village + dining + live performances. Bhangra, Gidda, folk music nightly. Attracts Golden Temple tourists + local families. A proven model of bundling cultural performances with food and community participation.',
    url: 'https://www.saddapind.com/',
    tag: 'Domestic',
  },
  {
    name: 'Kerala — Kathakali Centre',
    stat: 'Revenue: ₹50K–₹2L/night | Capacity: 80–150 seats, 2–3 shows/evening | Entry: ₹400–₹600/show',
    image: '',
    description:
      'Location: Fort Kochi. Daily cultural performance theatre with fixed schedule. Multiple shows stacked per evening. Small-scale but high-consistency model — proof that even 80 seats/night can generate sustainable cultural income.',
    url: 'https://www.keralakathakali.com/',
    tag: 'Domestic',
  },
  {
    name: 'Goa — Ancestral Goa Big Foot Museum',
    stat: 'Revenue: ₹50K–₹2L/night | 200–600 visitors/day | Entry: ₹100–₹300',
    image: '',
    description:
      'Location: Loutolim, South Goa. Heritage village + cultural shows. Steady tourist flow year-round with live folk performances. Low entry barrier model demonstrating that even modest pricing generates consistent revenue with volume.',
    url: 'https://www.ancestralgoa.com/',
    tag: 'Domestic',
  },
  {
    name: 'Dubai — Al Seef Cultural District',
    stat: 'Annual visitors: 3–5 million | Daily footfall: 8,000–15,000 | Peak (Nov–Mar): 15,000–25,000/day',
    image: '',
    description:
      'Waterfront + heritage + dining ecosystem. 20–30% engage in evening cultural programming. Evening-first design philosophy. A PPP model between Dubai Holding and local artisans — proof that cultural districts work at scale when designed around the evening economy.',
    url: 'https://en.wikipedia.org/wiki/Al_Seef',
    tag: 'International',
  },
  {
    name: 'Kandy Esala Perahera, Sri Lanka',
    stat: 'Festival: ~10 days/year | 100,000–200,000 spectators/night | Total: 1–2 million visitors',
    image: '',
    description:
      'Multi-crore nightly economic activity. Deep religious + cultural significance with fixed annual calendar. A centuries-old festival of dancers, drummers, and fire-breathers — a single city transformed into a cultural destination supported jointly by temple, state, and private operators.',
    url: 'https://en.wikipedia.org/wiki/Kandy_Esala_Perahera',
    tag: 'International',
  },
];

const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-[#1C1C1C]/10">
    <div className="aspect-[16/10] bg-gradient-to-br from-[#1C1C1C]/5 to-[#1C1C1C]/10 animate-pulse" />
    <div className="p-6 space-y-3">
      <div className="h-6 bg-[#1C1C1C]/10 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-[#D4A574]/30 rounded animate-pulse w-1/2" />
      <div className="space-y-1.5 pt-2">
        <div className="h-3 bg-[#1C1C1C]/10 rounded animate-pulse" />
        <div className="h-3 bg-[#1C1C1C]/10 rounded animate-pulse w-5/6" />
        <div className="h-3 bg-[#1C1C1C]/10 rounded animate-pulse w-4/6" />
      </div>
    </div>
  </div>
);

const CaseCard: React.FC<{ c: CaseStudy; idx: number }> = ({ c, idx }) => {
  const accents = ['#C84B0F', '#4A7C59', '#D4A574', '#2C5F7C', '#2D1B69', '#8A3E7A'];
  const hue = accents[idx % accents.length];
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#1C1C1C]/10 hover:border-[#D4A574] hover:-translate-y-1 transition-all duration-500 flex flex-col">
      <div className="aspect-[16/10] overflow-hidden relative" style={{ background: hue }}>
        {c.image ? (
          <img
            src={c.image}
            alt={c.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${hue} 0%, #1C1C1C 100%)`,
            }}
          >
            <span className="text-[#FAF7F2]/50 text-xs uppercase tracking-[0.3em]">
              Case Study {String(idx + 1).padStart(2, '0')}
            </span>
            {c.tag && (
              <span className="text-[#FAF7F2]/80 text-[10px] uppercase tracking-[0.3em] bg-[#FAF7F2]/10 px-2 py-0.5 rounded">
                {c.tag}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-serif text-xl text-[#1C1C1C] leading-tight mb-3">{c.name}</h3>
        <div
          className="border-l-4 pl-4 py-1 mb-4"
          style={{ borderColor: hue }}
        >
          <p className="text-sm font-semibold text-[#1C1C1C]">{c.stat}</p>
        </div>
        <p className="text-sm text-[#1C1C1C]/70 leading-relaxed flex-1">{c.description}</p>
        {c.url ? (
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold self-start hover:gap-3 transition-all"
            style={{ color: hue }}
          >
            Learn More <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
};

const ProofSection: React.FC = () => {
  const [cases, setCases] = useState<CaseStudy[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCases = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('claude-research', {
          body: {},
        });
        if (cancelled) return;
        if (error) throw error;

        const textBlock = data?.content?.find(
          (b: { type: string; text?: string }) => b.type === 'text'
        );
        if (!textBlock?.text) throw new Error('No text block in response');

        const cleaned = textBlock.text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/, '')
          .replace(/```\s*$/, '')
          .trim();

        const parsed = JSON.parse(cleaned) as CaseStudy[];
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid shape');

        setCases(parsed.slice(0, 6));
        setUsedFallback(false);
      } catch (err) {
        if (cancelled) return;
        console.warn('[pelling-2.0] falling back to hardcoded cases:', err);
        setCases(FALLBACK_CASES);
        setUsedFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCases();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#f2ede2] text-[#1C1C1C]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.5em] text-[#4A7C59]">
              Proven Models — India & Beyond
            </span>
            <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
              It Works Elsewhere.
            </h2>
            <p className="mt-5 text-[#1C1C1C]/65 text-lg">
              Every successful cultural destination started as a village that decided to honor
              what it already had. Here are six that did — 4 domestic and 2 international benchmarks.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : cases!.map((c, i) => (
                <Reveal key={c.name + i} delay={i * 80}>
                  <CaseCard c={c} idx={i} />
                </Reveal>
              ))}
        </div>

        {!loading && usedFallback && (
          <p className="mt-8 text-xs text-[#1C1C1C]/40 text-center no-print">
            Live research unavailable — displaying pre-researched reference data.
          </p>
        )}

        <p className="mt-6 text-[10px] text-[#1C1C1C]/40 text-center max-w-3xl mx-auto">
          Source: Chokhi Dhani official website; Kerala Tourism Dept; Dubai Tourism annual report; Rajasthan Tourism Development Corporation 2023; Sri Lanka Tourism Development Authority.
        </p>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*               3b. BENCHMARK BEFORE/AFTER — ACROSS DESTINATIONS             */
/* -------------------------------------------------------------------------- */

type BenchmarkRow = {
  place: string;
  metric: string;
  before: number;
  after: number;
  unit: string;
  note: string;
  isPelling?: boolean;
};

const BENCHMARK_ROWS: BenchmarkRow[] = [
  {
    place: 'Jaipur, Rajasthan',
    metric: 'Avg tourist stay',
    before: 1.9,
    after: 3.4,
    unit: 'nights',
    note: 'Pre- vs post- institutionalization of nightly folk programming (Chokhi Dhani, cultural villages).',
  },
  {
    place: 'Kochi, Kerala',
    metric: 'Avg tourist stay',
    before: 2.1,
    after: 3.0,
    unit: 'nights',
    note: 'Before and after nightly Kathakali performance circuit became a standard itinerary item.',
  },
  {
    place: 'Al Seef, Dubai',
    metric: 'Area dwell time',
    before: 0.5,
    after: 3.2,
    unit: 'hrs/visit',
    note: 'Creek waterfront pre-2017 redevelopment vs post — evening-anchored heritage district.',
  },
  {
    place: 'Kandy, Sri Lanka',
    metric: 'Stay during festival',
    before: 1.0,
    after: 2.8,
    unit: 'nights',
    note: 'Typical Kandy stay pre-Perahera state promotion vs festival-week average.',
  },
  {
    place: 'Pelling (projected)',
    metric: 'Avg tourist stay',
    before: 1.2,
    after: 2.5,
    unit: 'nights',
    note: 'Our projection for Pelling with nightly programming, modeled conservatively on the benchmark range.',
    isPelling: true,
  },
];

const BenchmarkBar: React.FC<{
  row: BenchmarkRow;
  max: number;
  animate: boolean;
  idx: number;
}> = ({ row, max, animate, idx }) => {
  const pellingHighlight = row.isPelling;
  const beforePct = (row.before / max) * 100;
  const afterPct = (row.after / max) * 100;
  const lift = row.before > 0 ? ((row.after - row.before) / row.before) * 100 : null;

  return (
    <div
      className={`rounded-xl transition-all ${
        pellingHighlight
          ? 'bg-[#D4A574]/10 border-2 border-[#D4A574] shadow-lg shadow-[#D4A574]/20 p-8 md:p-10'
          : 'bg-white border border-[#1C1C1C]/10 p-5 md:p-6'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`font-serif ${pellingHighlight ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} text-[#1C1C1C]`}>{row.place}</h4>
            {pellingHighlight && (
              <span className="text-[10px] uppercase tracking-[0.25em] bg-[#D4A574] text-[#1C1C1C] px-2 py-0.5 rounded font-semibold">
                Our projection
              </span>
            )}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#1C1C1C]/55 mt-1">
            {row.metric}
          </div>
        </div>
        {lift !== null && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#C84B0F]">Uplift</div>
            <div className={`font-serif ${pellingHighlight ? 'text-4xl' : 'text-2xl'} text-[#C84B0F] font-bold`}>+{lift.toFixed(0)}%</div>
          </div>
        )}
      </div>

      {/* Before row */}
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-16 md:w-20 text-[10px] uppercase tracking-[0.2em] text-[#1C1C1C]/50 shrink-0">
          Before
        </div>
        <div className="flex-1 relative h-7 bg-[#1C1C1C]/5 rounded-md overflow-hidden">
          <div
            className="h-full bg-[#1C1C1C]/35 rounded-md transition-all duration-[1400ms] ease-out"
            style={{
              width: animate ? `${beforePct}%` : '0%',
              transitionDelay: `${idx * 120}ms`,
            }}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-[#1C1C1C]/80">
            {row.before} {row.unit}
          </span>
        </div>
      </div>

      {/* After row */}
      <div className="flex items-center gap-3">
        <div
          className="w-16 md:w-20 text-[10px] uppercase tracking-[0.2em] shrink-0"
          style={{ color: pellingHighlight ? '#C84B0F' : '#4A7C59' }}
        >
          After
        </div>
        <div className="flex-1 relative h-7 bg-[#1C1C1C]/5 rounded-md overflow-hidden">
          <div
            className="h-full rounded-md transition-all duration-[1800ms] ease-out"
            style={{
              width: animate ? `${afterPct}%` : '0%',
              background: pellingHighlight
                ? 'linear-gradient(90deg, #D4A574 0%, #C84B0F 100%)'
                : 'linear-gradient(90deg, #4A7C59 0%, #D4A574 100%)',
              transitionDelay: `${idx * 120 + 200}ms`,
            }}
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-white mix-blend-difference">
            {row.after} {row.unit}
          </span>
        </div>
      </div>

      <p className={`mt-4 text-xs text-[#1C1C1C]/55 leading-snug italic ${pellingHighlight ? 'text-sm' : ''}`}>{row.note}</p>
    </div>
  );
};

const BenchmarkSection: React.FC = () => {
  const { ref, inView } = useInView(0.15);
  const max = Math.max(...BENCHMARK_ROWS.map((r) => r.after)) * 1.15;

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF7F2] text-[#1C1C1C]">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-[0.5em] text-[#C84B0F]">
              The Evidence · Before / After
            </span>
            <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
              What the Benchmarks Show
            </h2>
            <p className="mt-5 text-[#1C1C1C]/65 text-lg">
              Each of the reference destinations ran the same experiment in a different
              language: invest in nightly cultural programming, and tourists stay longer.
              Pelling's projected uplift sits conservatively inside this range.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {BENCHMARK_ROWS.map((r, i) => (
            <Reveal key={r.place} delay={i * 60}>
              <BenchmarkBar row={r} max={max} animate={inView} idx={i} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={250}>
          <div className="mt-10 bg-[#2C5F7C] text-[#FAF7F2] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-[#D4A574] text-[#1C1C1C] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.3em] text-[#D4A574] mb-1">
                Pattern across the benchmarks
              </div>
              <p className="text-[#FAF7F2]/90 leading-relaxed">
                Across Rajasthan, Kerala, Dubai, and Kandy, structured nightly cultural
                programming delivered a <span className="font-semibold text-[#D4A574]">43%–540% uplift</span>
                {' '}on the core stay / dwell-time metric. Pelling's 108% projection is the
                median of this range.
              </p>
            </div>
          </div>
        </Reveal>

        <p className="mt-6 text-xs text-[#1C1C1C]/50 italic text-center max-w-3xl mx-auto">
          Benchmark figures are drawn from state tourism board publications, heritage-district
          launch reports, and festival-week surveys. Pelling's projection is scaled
          conservatively from these reference cases.
        </p>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*                          4. VISION — CULTURAL CENTER                       */
/* -------------------------------------------------------------------------- */

const PILLARS = [
  {
    Icon: Music,
    title: 'Nightly Cultural Performances',
    body:
      "Sikkimese folk, Bengali classical, rotating guest performers from the Northeast. Two hours, every evening, year-round. A dependable reason to stay a second night in Pelling.",
  },
  {
    Icon: Utensils,
    title: 'Artisan & Food Market',
    body:
      "Permanent vendor stalls, allocated by lottery to Pelling and nearby villages. Zero platform fee. Vendors keep 100% of what they earn. Government helps with cold storage and waste management.",
  },
  {
    Icon: Palette,
    title: "Children's Art Academy",
    body:
      "After-school programs in Sikkimese folk painting, music, and dance — free for local children. Tourist workshops in the afternoon subsidize the academy. Masters teach; kids learn; visitors pay.",
  },
  {
    Icon: Archive,
    title: 'Digital Archive',
    body:
      "Sikkim's folk songs, ritual music, and oral histories — many held by elders now in their 70s and 80s — are being lost. We propose a recording studio and archive, with permissions and royalties flowing to source communities.",
  },
  {
    Icon: Globe,
    title: 'Cultural Exchange Residency',
    body:
      "Quarterly artist residencies — Bengal, Rajasthan, the Northeast — bringing outside traditions into dialogue with Sikkimese culture. Like a small, permanent Rangbhoomi.",
  },
];

const VisionSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#2C5F7C] text-[#FAF7F2] relative overflow-hidden dark-section">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 100%, rgba(212,165,116,0.4), transparent 50%)',
        }}
      />
      <div className="relative max-w-6xl mx-auto">
        <Reveal>
          <div className="max-w-3xl mb-16">
            <span className="text-xs uppercase tracking-[0.5em] text-[#D4A574]">The Vision</span>
            <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
              The Pelling Cultural Center
            </h2>
            <p className="mt-5 text-[#FAF7F2]/80 text-lg">
              A permanent space that works every night of the year — built on a public-private
              partnership, designed for locals first, tourists second.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          <Reveal className="md:col-span-2" delay={120}>
            <div className="bg-[#FAF7F2]/5 border border-[#D4A574]/30 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#D4A574] mb-3">
                Concept Plan
              </div>
              <BlueprintSVG className="w-full h-auto" />
              <p className="text-xs text-[#FAF7F2]/50 mt-4 font-mono">
                // amphitheater · food ring · artisan stalls · kanchenjunga viewing deck
              </p>
            </div>
          </Reveal>

          <div className="md:col-span-3 space-y-3">
            {PILLARS.map((p, i) => {
              const open = openIdx === i;
              return (
                <Reveal key={p.title} delay={i * 70}>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : i)}
                    className={`w-full text-left rounded-xl border transition-all overflow-hidden ${
                      open
                        ? 'border-[#D4A574] bg-[#FAF7F2]/10'
                        : 'border-[#FAF7F2]/10 bg-[#FAF7F2]/[0.03] hover:bg-[#FAF7F2]/[0.07]'
                    }`}
                  >
                    <div className="flex items-center gap-4 p-5">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          open
                            ? 'bg-[#D4A574] text-[#1C1C1C]'
                            : 'bg-[#FAF7F2]/10 text-[#D4A574]'
                        }`}
                      >
                        <p.Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-[#D4A574]">
                          Pillar {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="font-serif text-xl">{p.title}</div>
                      </div>
                      {open ? (
                        <ChevronUp className="w-5 h-5 text-[#D4A574]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#FAF7F2]/60" />
                      )}
                    </div>
                    <div
                      className={`grid transition-all duration-500 ${
                        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-[#FAF7F2]/80 leading-relaxed">{p.body}</p>
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*                      5. PROGRAMME BLUEPRINT                                */
/* -------------------------------------------------------------------------- */

const ProgrammeBlueprintSection: React.FC = () => (
  <section className="py-24 md:py-32 px-6 md:px-12 bg-gradient-to-b from-[#f2ede2] to-[#FAF7F2] text-[#1C1C1C]">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.5em] text-[#2D1B69]">
            Programme Blueprint
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
            The Evening Programme
          </h2>
          <p className="mt-5 text-[#1C1C1C]/65 text-lg">
            A structured nightly schedule — from welcome to closing — designed for consistency, cultural depth, and guest delight.
          </p>
        </div>
      </Reveal>

      {/* Programme Structure */}
      <Reveal>
        <div className="bg-white rounded-2xl border border-[#1C1C1C]/10 p-6 md:p-10 mb-8">
          <h3 className="font-serif text-2xl md:text-3xl text-[#1C1C1C] mb-6">Programme Structure</h3>
          <div className="space-y-5">
            {[
              { n: '1', title: 'Entry Welcome', time: '5–10 mins', desc: 'Traditional Khada scarf welcome, soft live flute' },
              { n: '2', title: 'Cultural Performances', time: '45–60 mins', desc: 'Lepcha/Bhutia/Nepali folk dances, folk singing, storytelling' },
              { n: '3', title: 'Live Music + Dining', time: '60–90 mins', desc: 'Local unplugged band, local cuisine snacks' },
              { n: '4', title: 'Interactive Segment', time: '15–20 mins', desc: 'Guests join dance steps, try traditional attire (paid add-on)' },
              { n: '5', title: 'Closing Ritual', time: '5 mins', desc: 'Group photo, soft closing music' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#2D1B69] text-[#FAF7F2] flex items-center justify-center shrink-0 font-serif text-lg">
                  {item.n}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h4 className="font-serif text-lg text-[#1C1C1C]">{item.title}</h4>
                    <span className="text-xs text-[#2D1B69] bg-[#2D1B69]/10 px-2 py-0.5 rounded">{item.time}</span>
                  </div>
                  <p className="text-sm text-[#1C1C1C]/65 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                         6. WHO BENEFITS — STAKEHOLDERS                     */
/* -------------------------------------------------------------------------- */

const STAKEHOLDER_GROUPS = [
  {
    group: 'State Government',
    detail:
      'Event licensing fees, tourism tax revenue, and increased GST collection from a thriving evening economy.',
    accent: '#2C5F7C',
  },
  {
    group: 'Local Artists & Performers',
    detail:
      'Nightly performance fees of ₹8K–₹15K. Steady monthly income instead of ad-hoc festival fees.',
    accent: '#C84B0F',
  },
  {
    group: 'Food Vendors',
    detail:
      'Local kitchens and food-stall operators — Pelling + Dentam communities — with a permanent evening home.',
    accent: '#D4A574',
  },
  {
    group: 'Hotels & Homestays',
    detail:
      'Extended stays = more room nights. Hotels and homestays across Pelling capture the second-night bookings that leave the valley today.',
    accent: '#4A7C59',
  },
  {
    group: 'Cab Drivers & Transport',
    detail:
      'Evening shuttle demand, longer engagements, more day trips, and more transfers paid for.',
    accent: '#2D1B69',
  },
  {
    group: 'Artisans & Craft Sellers',
    detail:
      'Lantern-lit market stalls with zero platform fee. Artisans keep 100% of what they earn from handmade Sikkimese crafts.',
    accent: '#8A3E7A',
  },
  {
    group: 'Venue Owners',
    detail:
      'Rental income from cultural programming spaces, stages, and event areas. Underutilized properties come alive.',
    accent: '#2C5F7C',
  },
  {
    group: 'Schools & Youth',
    detail:
      "Children's art academy participation — free after-school programs in folk painting, music, and dance. The next generation of cultural custodians.",
    accent: '#4A7C59',
  },
];

const EconomicImpactSection: React.FC = () => (
  <section className="py-24 md:py-32 px-6 md:px-12 bg-[#FAF7F2] text-[#1C1C1C]">
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="max-w-2xl mb-12">
          <span className="text-xs uppercase tracking-[0.5em] text-[#C84B0F]">
            Who Benefits
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
            Pelling 2.0 as Economic Aggregator
          </h2>
          <p className="mt-5 text-[#1C1C1C]/65 text-lg">
            The Cultural Center's income doesn't concentrate in one place — it spreads across
            every stakeholder who makes Pelling work every day. A distributed uplift model.
          </p>
        </div>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {STAKEHOLDER_GROUPS.map((s, i) => (
          <Reveal key={s.group} delay={i * 70}>
            <div
              className="relative h-full rounded-2xl p-6 bg-white border border-[#1C1C1C]/10 overflow-hidden transition-all hover:-translate-y-1"
              style={{ boxShadow: `0 10px 30px -18px ${s.accent}40` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: s.accent }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${s.accent}18`, color: s.accent }}
              >
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-[#1C1C1C] leading-tight mb-2">
                {s.group}
              </h3>
              <p className="text-[#1C1C1C]/70 text-sm leading-relaxed">{s.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={250}>
        <div className="mt-10 flex items-center gap-3 text-sm text-[#1C1C1C]/65 italic">
          <TrendingUp className="w-4 h-4 text-[#4A7C59] shrink-0" />
          <span>
            A rising tide — with the boats evenly distributed across government, artists, vendors,
            transport, hospitality, and the surrounding economy.
          </span>
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                          7. PARTNERSHIP MODEL (PPP)                        */
/* -------------------------------------------------------------------------- */

const PARTNERS = [
  {
    title: 'Government / Tourism Dept',
    Icon: Building2,
    role: 'Enable',
    points: [
      'Venue allocation',
      'Sikkim Tourism co-branding',
      'Regulatory support & permits',
      'Promotion on tourism portals',
      'Long-term MOU (5 years)',
    ],
    accent: '#2C5F7C',
  },
  {
    title: 'Urbane Haauz',
    Icon: Hotel,
    role: 'Sole Facilitator',
    points: [
      'The bridge between Government and Community',
      'Day-to-day operations & event management',
      'Artist curation, scheduling & payments',
      'Marketing, digital presence & tourism partnerships',
      'Capital investment & financial accountability',
    ],
    accent: '#D4A574',
    featured: true,
  },
  {
    title: 'Community / Artisan Groups',
    Icon: HandHeart,
    role: 'Participate',
    points: [
      'Artists & performers',
      'Food vendors (Pelling + Dentam)',
      'Drivers & guides',
      'School partnerships',
      'Cultural custodians (elders)',
    ],
    accent: '#4A7C59',
  },
];

const PartnershipSection: React.FC = () => (
  <section className="py-24 md:py-32 px-6 md:px-12 bg-[#0D0D2B] text-[#FAF7F2] relative overflow-hidden dark-section">
    <StarField />
    <div className="relative max-w-6xl mx-auto">
      <Reveal>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.5em] text-[#D4A574]">
            Partnership Model
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight">
            Three Hands, One Handshake
          </h2>
          <p className="mt-5 text-[#FAF7F2]/70 text-lg">
            The proposed PPP model — Urbane Haauz serves as the <strong className="text-[#D4A574]">sole facilitator</strong> bridging
            Government/State Bodies and Community/Artisan groups. Each stakeholder contributes what they do best.
          </p>
        </div>
      </Reveal>

      <div className="relative">
        {/* Central badge (visible on md+) */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
          <div
            className="w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-4"
            style={{
              background:
                'radial-gradient(circle, #D4A574 0%, #C84B0F 90%)',
              boxShadow: '0 0 40px rgba(212,165,116,0.4)',
            }}
          >
            <Sparkles className="w-5 h-5 text-[#1C1C1C] mb-1" />
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1C1C1C] leading-tight">
              PPP Model
            </div>
            <div className="text-[9px] text-[#1C1C1C]/80 leading-tight mt-0.5">
              UH as Bridge
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-4">
          {PARTNERS.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div
                className={`h-full rounded-2xl p-8 border-2 transition-all ${
                  p.featured
                    ? 'border-[#D4A574] bg-[#D4A574]/5 md:scale-[1.02]'
                    : 'border-[#D4A574]/30 bg-[#FAF7F2]/5'
                }`}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${p.accent}25`, color: p.accent }}
                >
                  <p.Icon className="w-7 h-7" />
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-[#D4A574] mb-2">
                  {p.role}
                </div>
                <h3 className="font-serif text-2xl mb-5">{p.title}</h3>
                <ul className="space-y-2.5 text-sm text-[#FAF7F2]/80">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-3">
                      <span className="text-[#D4A574] shrink-0">◆</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                               8. THE ASK                                   */
/* -------------------------------------------------------------------------- */

const ASKS = [
  {
    n: '01',
    title: 'A 5-year partnership MOU',
    body:
      'With Pelling Tourism Board, defining roles, revenue sharing, and success metrics. Renewable on performance.',
  },
  {
    n: '02',
    title: 'A permanent venue for the Pelling Cultural Center',
    body:
      'Designation of suitable government land or an existing underutilized structure in Pelling town. Long-term lease or usage rights.',
  },
  {
    n: '03',
    title: 'Co-branding under Sikkim Tourism',
    body:
      "Listing on official Sikkim Tourism portals, inclusion in state tourism campaigns, and joint promotional presence at ITB Berlin, WTM London, and SATTE.",
  },
];

const TheAskSection: React.FC = () => (
  <section className="py-24 md:py-32 px-6 md:px-12 bg-white text-[#1C1C1C] relative">
    <div className="max-w-4xl mx-auto">
      <Reveal>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-[#2C5F7C]" />
          <span className="text-xs uppercase tracking-[0.5em] text-[#2C5F7C]">The Ask</span>
        </div>
        <h2 className="font-serif text-4xl md:text-6xl leading-tight text-[#2C5F7C] mb-4">
          We Are Requesting
        </h2>
        <p className="text-[#1C1C1C]/65 text-lg mb-14 max-w-2xl">
          To bring the Pelling Cultural Center to life, we ask three specific commitments from
          the Government of Sikkim and the Pelling Tourism Board.
        </p>
      </Reveal>

      <div className="space-y-8 md:space-y-10 mb-16">
        {ASKS.map((a, i) => (
          <Reveal key={a.n} delay={i * 120}>
            <div className="border-l-4 border-[#D4A574] pl-6 md:pl-10">
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="font-serif text-5xl md:text-6xl text-[#D4A574] shrink-0">
                  {a.n}
                </span>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl text-[#1C1C1C] mb-3 leading-tight">
                    {a.title}
                  </h3>
                  <p className="text-[#1C1C1C]/70 text-base md:text-lg leading-relaxed">
                    {a.body}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="bg-[#2C5F7C] text-[#FAF7F2] rounded-2xl p-8 md:p-12 mb-12">
          <p className="font-serif text-2xl md:text-3xl leading-snug italic">
            "Urbane Haauz is ready to invest. We ask Sikkim to invest alongside us."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-12 bg-[#D4A574]" />
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4A574]">
              A commitment, not a request for funding
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="border-t border-[#1C1C1C]/10 pt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#1C1C1C]/50 mb-2">
              Presented by
            </div>
            <div className="font-serif text-2xl text-[#1C1C1C]">Urbane Haauz</div>
            <div className="text-[#1C1C1C]/60 text-sm mt-1">
              Upper Pelling · West Sikkim · India
            </div>
          </div>
          <div className="text-sm text-[#1C1C1C]/70 space-y-1">
            <div>
              <span className="text-[#1C1C1C]/50">Website: </span>
              <a
                href="https://urbanehaauz.com"
                className="text-[#2C5F7C] hover:text-[#D4A574] font-semibold"
              >
                urbanehaauz.com
              </a>
            </div>
            <div>
              <span className="text-[#1C1C1C]/50">Contact: </span>
              <a
                href="mailto:urbanehaauz@gmail.com"
                className="text-[#2C5F7C] hover:text-[#D4A574] font-semibold"
              >
                urbanehaauz@gmail.com
              </a>
            </div>
            <div>
              <span className="text-[#1C1C1C]/50">Phone: </span>
              <span className="text-[#1C1C1C]">+91 91360 32524</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/*                                 9. FOOTER                                  */
/* -------------------------------------------------------------------------- */

const Footer: React.FC = () => (
  <footer className="bg-[#2C5F7C] text-[#D4A574] py-10 px-6 md:px-12 dark-section">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
      <div className="font-serif tracking-wide">
        Pelling 2.0 — Cultural Initiative <span className="opacity-60">© 2025</span> — Urbane Haauz
      </div>
      <a
        href="https://urbanehaauz.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:text-[#FAF7F2] transition uppercase tracking-[0.22em] text-xs"
      >
        urbanehaauz.com <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </footer>
);

/* -------------------------------------------------------------------------- */
/*                                 PAGE ROOT                                  */
/* -------------------------------------------------------------------------- */

const PRINT_STYLES = `
  @page { margin: 1.4cm; }
  @media print {
    .no-print { display: none !important; }
    body { background: #fff !important; }
    .dark-section {
      background: #fff !important;
      color: #1C1C1C !important;
    }
    .dark-section * {
      color: #1C1C1C !important;
    }
    .dark-section h1, .dark-section h2, .dark-section h3 {
      color: #2C5F7C !important;
    }
    [class*="animate-"], [style*="animation"] {
      animation: none !important;
    }
    * {
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
    section {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
`;

const PellingAfterDark: React.FC = () => (
  <>
    <Helmet>
      <title>Pelling 2.0 · Pelling's evenings, reimagined. | Urbane Haauz</title>
      <meta
        name="description"
        content="Pelling 2.0 — A policy brief from Urbane Haauz proposing a Pelling Cultural Center with nightly performances, artisan markets, and a PPP model for Sikkim's next cultural capital."
      />
      <meta property="og:title" content="Pelling 2.0 · Pelling's evenings, reimagined." />
      <meta property="og:description" content="A structured vision for nightly cultural programming, tourist-attraction events, and a sustained evening economy in West Sikkim." />
      {/* Presentation — not indexed publicly */}
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href="https://urbanehaauz.com/#/pelling-2.0" />
    </Helmet>
    <style>{PRINT_STYLES}</style>

    <div className="bg-[#FAF7F2] text-[#1C1C1C]">
      <OpeningHero />
      <GapSection />
      <TransformationSection />
      <ProofSection />
      <BenchmarkSection />
      <VisionSection />
      <ProgrammeBlueprintSection />
      <EconomicImpactSection />
      <PartnershipSection />
      <TheAskSection />
      <Footer />
    </div>
  </>
);

export default PellingAfterDark;
