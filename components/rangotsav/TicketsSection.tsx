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

const PassVisual: React.FC = () => (
  <div className="relative">
    {/* Soft gold glow behind the pass */}
    <div
      aria-hidden
      className="absolute -inset-6 rounded-[28px] blur-3xl opacity-40 pointer-events-none"
      style={{
        background:
          'radial-gradient(circle at 50% 40%, rgba(212,165,116,0.45), transparent 70%)',
      }}
    />

    <div
      className="relative bg-gradient-to-br from-[#FAF7F2] via-[#f5ecd9] to-[#ead8b6] text-[#1C1C1C] rounded-2xl border-2 border-[#D4A574] shadow-2xl shadow-black/30 overflow-hidden"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.74 0 0 0 0 0.62 0 0 0 0 0.38 0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        backgroundBlendMode: 'multiply',
      }}
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

      {/* Perforation row with notches */}
      <div className="relative h-6">
        <div className="absolute inset-x-9 top-1/2 -translate-y-1/2 border-t-[1.5px] border-dashed border-[#A67833]/50" />
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1C1C1C]" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1C1C1C]" />
      </div>

      {/* Body — pass details */}
      <div className="px-9 pt-7 pb-9">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.42em] uppercase text-[#8B6F47] font-semibold mb-1">
            Festival Pass
          </p>
          <p className="font-serif text-[68px] md:text-[80px] leading-none text-[#1C1C1C]">
            ₹100
          </p>
          <p className="text-[#8B6F47] text-xs italic mt-1.5">per person · all-inclusive</p>
        </div>

        <ul className="space-y-2.5 text-[14px] text-[#1C1C1C]/85 max-w-xs mx-auto">
          {[
            'Both festival days · 25–26 May 2026',
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
          <span>Capacity · 300</span>
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
    <div className="w-12 h-12 rounded-full bg-[#D4A574]/15 border border-[#D4A574]/30 mx-auto flex items-center justify-center mb-4 text-[#D4A574]">
      {icon}
    </div>
    <p className="font-serif text-lg text-[#FAF7F2] mb-1.5">{title}</p>
    <p className="text-[#FAF7F2]/55 text-sm leading-relaxed">{body}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              SECTION                                       */
/* -------------------------------------------------------------------------- */

const TicketsSection: React.FC = () => (
  <section
    id="tickets"
    className="relative py-28 md:py-36 px-6 md:px-12 bg-[#141414] text-[#FAF7F2] overflow-hidden"
  >
    {/* warm radial spotlight */}
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.18), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(200,75,15,0.10), transparent 60%)',
      }}
    />

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <Reveal>
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="h-px w-10 bg-[#D4A574]/60" />
            <span className="text-[11px] uppercase tracking-[0.45em] text-[#D4A574] font-semibold">
              Entry · 25–26 May 2026
            </span>
            <span className="h-px w-10 bg-[#D4A574]/60" />
          </div>
          <h2 className="font-serif text-4xl md:text-6xl leading-tight">
            Get your festival pass
          </h2>
          <p className="mt-6 text-[#FAF7F2]/65 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            One pass, two days. Both festival days, every performance, the art exhibition,
            and access to the food stalls — all from <span className="text-[#D4A574] font-semibold">₹100 per person</span>.
          </p>
        </div>
      </Reveal>

      {/* Pass + Buy form */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        <Reveal>
          <PassVisual />
        </Reveal>

        <Reveal delay={150}>
          <div className="bg-[#FAF7F2]/[0.04] border border-[#D4A574]/25 rounded-2xl p-7 md:p-9 backdrop-blur-sm">
            <TicketBuyForm />
          </div>
        </Reveal>
      </div>

      {/* Trust signals */}
      <Reveal delay={300}>
        <div className="mt-20 md:mt-24">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#D4A574]/70">
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
        <p className="mt-14 text-center text-[#FAF7F2]/35 text-xs tracking-wide max-w-xl mx-auto leading-relaxed">
          Capacity is capped at 300 across online and offline sales combined.
          Passes are non-transferable and refunds are not available once issued.
          Children under 5 enter free with a paying adult.
        </p>
      </Reveal>
    </div>
  </section>
);

export default TicketsSection;
