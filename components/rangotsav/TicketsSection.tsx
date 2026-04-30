import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Shield, Mail, Ticket } from 'lucide-react';
import TicketBuyForm from './TicketBuyForm';

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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
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
/*                            VISUAL PASS (LEFT)                              */
/* -------------------------------------------------------------------------- */

// SECTION_BG must match the parent <section> bg so the perforation notches
// read as cutouts rather than dots.
const SECTION_BG = '#FAF7F2';

const PassVisual: React.FC = () => (
  <div className="relative">
    {/* Soft gold glow behind the pass — stronger now since the section is light */}
    <div
      aria-hidden
      className="absolute -inset-8 rounded-[28px] blur-3xl opacity-60 pointer-events-none"
      style={{
        background:
          'radial-gradient(circle at 50% 40%, rgba(212,165,116,0.35), transparent 70%)',
      }}
    />

    <div
      className="relative bg-gradient-to-br from-[#fffaf0] via-[#f7ead0] to-[#e8d4a4] text-[#1C1C1C] rounded-2xl border border-[#D4A574]/70 shadow-[0_30px_60px_-15px_rgba(139,111,71,0.45)] overflow-hidden"
    >
      {/* Top stub — title block */}
      <div className="px-9 pt-10 pb-7 text-center">
        <p className="text-[10px] tracking-[0.45em] uppercase text-[#A67833] font-bold mb-3">
          Urbane Haauz · Pelling
        </p>
        <h3 className="font-serif text-5xl md:text-6xl text-[#1C1C1C] leading-none">
          Rangotsav
        </h3>
        <p className="mt-3 text-[#A67833] text-[10px] uppercase tracking-[0.4em]">
          — The Tale Of Two States —
        </p>

        <div className="mt-7 flex items-center justify-center gap-5 text-[#1C1C1C]/75 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#A67833]" />
            <span className="uppercase tracking-[0.18em]">25–26 May 2026</span>
          </span>
          <span className="w-px h-3 bg-[#A67833]/40" />
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#A67833]" />
            <span className="uppercase tracking-[0.18em]">Pelling, Sikkim</span>
          </span>
        </div>
      </div>

      {/* Perforation row with notches — notches match the section bg */}
      <div className="relative h-6">
        <div className="absolute inset-x-9 top-1/2 -translate-y-1/2 border-t-[1.5px] border-dashed border-[#A67833]/50" />
        <div
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
          style={{ backgroundColor: SECTION_BG }}
        />
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full"
          style={{ backgroundColor: SECTION_BG }}
        />
      </div>

      {/* Body — pass details */}
      <div className="px-9 pt-7 pb-9">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.42em] uppercase text-[#8B6F47] font-semibold mb-1">
            Festival Pass
          </p>
          <p className="font-serif text-[58px] md:text-[68px] leading-none text-[#1C1C1C]">
            ₹100<span className="text-[#8B6F47] text-3xl md:text-4xl font-light"> /day</span>
          </p>
          <p className="text-[#8B6F47] text-xs italic mt-1.5">₹175 for both days · all-inclusive</p>
        </div>

        <ul className="space-y-2.5 text-[14px] text-[#1C1C1C]/85 max-w-xs mx-auto">
          {[
            'Pick Day 1, Day 2, or both',
            'All live performances',
            'Art exhibition & installations',
            'Food stalls (purchase separately)',
            'QR-coded digital entry',
          ].map((line) => (
            <li key={line} className="flex items-start gap-3">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-[#D4A574]/30 text-[#A67833] flex items-center justify-center text-[10px] font-bold shrink-0">
                ✓
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 pt-5 border-t border-dashed border-[#A67833]/35 flex items-center justify-between text-[10px] tracking-[0.28em] uppercase text-[#8B6F47] font-semibold">
          <span>300 / day</span>
          <span>Pass № pending</span>
        </div>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                            TRUST SIGNALS                                   */
/* -------------------------------------------------------------------------- */

const TrustItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  body: string;
}> = ({ icon, title, body }) => (
  <div className="text-center px-5">
    <div className="w-12 h-12 rounded-full bg-[#D4A574]/20 border border-[#D4A574]/40 mx-auto flex items-center justify-center mb-4 text-[#A67833]">
      {icon}
    </div>
    <p className="font-serif text-lg text-[#1C1C1C] mb-1.5">{title}</p>
    <p className="text-[#1C1C1C]/65 text-sm leading-relaxed">{body}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              SECTION                                       */
/* -------------------------------------------------------------------------- */

const TicketsSection: React.FC = () => (
  <section
    id="tickets"
    className="relative py-28 md:py-36 px-6 md:px-12 bg-[#FAF7F2] text-[#1C1C1C] overflow-hidden"
  >
    {/* Warm radial highlight + subtle bottom orange tint */}
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.22), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(200,75,15,0.06), transparent 60%)',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <Reveal>
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="h-px w-10 bg-[#A67833]/50" />
            <span className="text-[11px] uppercase tracking-[0.45em] text-[#A67833] font-semibold">
              Entry · 25–26 May 2026
            </span>
            <span className="h-px w-10 bg-[#A67833]/50" />
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-tight text-[#1C1C1C]">
            Get your festival pass
          </h2>
          <p className="mt-6 text-[#1C1C1C]/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Pick a day or do both. Every performance, the art exhibition, and access to the food
            stalls — from <span className="text-[#A67833] font-semibold">₹100 per day</span>
            <span className="text-[#1C1C1C]/55"> · ₹175 for both days</span>.
          </p>
        </div>
      </Reveal>

      {/* Pass + Buy form */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <Reveal>
          <PassVisual />
        </Reveal>

        <Reveal delay={150}>
          <div className="bg-white border border-[#1C1C1C]/8 rounded-2xl p-7 md:p-9 shadow-[0_20px_50px_-20px_rgba(28,28,28,0.18)]">
            <TicketBuyForm />
          </div>
        </Reveal>
      </div>

      {/* Trust signals */}
      <Reveal delay={300}>
        <div className="mt-20 md:mt-24">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#A67833]/80 font-semibold">
              How it works
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-4xl mx-auto">
            <TrustItem
              icon={<Shield className="w-5 h-5" />}
              title="Secure payment"
              body="Pay via UPI, cards, net banking or wallets through Razorpay. We never see your card details."
            />
            <TrustItem
              icon={<Mail className="w-5 h-5" />}
              title="Instant email + QR"
              body="Confirmation lands in your inbox immediately, with a QR code and a unique pass number."
            />
            <TrustItem
              icon={<Ticket className="w-5 h-5" />}
              title="Door entry"
              body="Show the QR or pass code at the gate on festival day. No printing required."
            />
          </div>
        </div>
      </Reveal>

      {/* Fine print */}
      <Reveal delay={400}>
        <p className="mt-14 text-center text-[#1C1C1C]/45 text-xs tracking-wide max-w-xl mx-auto leading-relaxed">
          Capacity is capped at 300 per day across online and offline sales combined.
          Passes are non-transferable and refunds are not available once issued.
          Children under 5 enter free with a paying adult.
        </p>
      </Reveal>
    </div>
  </section>
);

export default TicketsSection;
