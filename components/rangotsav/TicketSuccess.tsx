import React from 'react';

export type DaySelection = 'day_1' | 'day_2' | 'both';

export interface TicketSuccessItem {
  ticketCode: string;
  daySelection: DaySelection;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface TicketSuccessProps {
  buyerName: string;
  items: TicketSuccessItem[];
  totalAmount: number;
}

const dayCopy: Record<DaySelection, { title: string; sub: string }> = {
  day_1: { title: 'Day 1', sub: 'Sat · 25 May' },
  day_2: { title: 'Day 2', sub: 'Sun · 26 May' },
  both:  { title: 'Both Days', sub: '25 + 26 May' },
};

const TicketSuccess: React.FC<TicketSuccessProps> = ({ buyerName, items, totalAmount }) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://urbanehaauz.com';
  const isMulti = items.length > 1;

  const waLines = items
    .map(
      (i) =>
        `${i.ticketCode} — ${dayCopy[i.daySelection].title} (${i.quantity} ${i.quantity > 1 ? 'admits' : 'admit'})`,
    )
    .join('\n');
  const waMessage = encodeURIComponent(
    `My Rangotsav 2026 Pass${isMulti ? 'es' : ''}:\n${waLines}\nPelling, 25–26 May 2026.`,
  );

  const codeList = items.map((i) => i.ticketCode).join(', ');
  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Rangotsav 2026 — Urbane Haauz, Pelling') +
    '&dates=20260525T043000Z/20260526T163000Z' +
    '&details=' + encodeURIComponent(
      `Your ticket code${isMulti ? 's' : ''}: ${codeList}. Show the QR (or code) at the entrance.`,
    ) +
    '&location=' + encodeURIComponent('Urbane Haauz, SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113');

  return (
    <div className="bg-[#D4A574]/[0.05] border border-[#D4A574]/30 rounded-2xl p-6 md:p-8 text-center">
      <p className="text-[#7FB88F] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
        {isMulti ? 'Passes Confirmed' : 'Pass Confirmed'}
      </p>
      <h4 className="font-serif text-2xl md:text-3xl text-[#FAF7F2] mb-1">
        You're in, {buyerName}.
      </h4>
      <p className="text-[#FAF7F2]/60 text-sm mb-6">
        {isMulti
          ? 'Each pass below is valid only for the day(s) shown. A copy is on the way to your inbox — screenshot this page just in case.'
          : 'A copy is on the way to your inbox. Save this page or screenshot it.'}
      </p>

      <div className={`grid ${items.length > 1 ? 'md:grid-cols-2' : ''} gap-4 mb-6`}>
        {items.map((item) => {
          const checkInUrl = `${origin}/admin/rangotsav?code=${encodeURIComponent(item.ticketCode)}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(checkInUrl)}`;
          const day = dayCopy[item.daySelection];

          return (
            <div
              key={item.ticketCode}
              className="bg-[#FAF7F2]/[0.04] border border-[#D4A574]/25 rounded-xl px-5 py-6"
            >
              <p className="text-[#D4A574] text-[10px] uppercase tracking-[0.32em] font-semibold mb-1">
                {day.title}
              </p>
              <p className="text-[#FAF7F2]/55 text-[10px] uppercase tracking-[0.25em] mb-4">
                {day.sub}
              </p>

              <div className="inline-block bg-[#FAF7F2] rounded-xl p-3 mb-4">
                <img
                  src={qrUrl}
                  alt={`QR for Rangotsav pass ${item.ticketCode}`}
                  width={180}
                  height={180}
                  className="block w-[180px] h-[180px]"
                />
              </div>

              <p className="font-mono text-[#FAF7F2] text-lg tracking-[0.2em] mb-1 break-all">
                {item.ticketCode}
              </p>
              <p className="text-[#FAF7F2]/55 text-[10px] uppercase tracking-[0.22em] mb-3">
                {item.quantity} {item.quantity > 1 ? 'admits' : 'admit'} · ₹{item.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#D4A574]/20 pt-5 mb-6 max-w-sm mx-auto">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#FAF7F2]/55 uppercase tracking-[0.15em] text-xs">Pass holder</span>
          <span className="text-[#FAF7F2]">{buyerName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#FAF7F2]/55 uppercase tracking-[0.15em] text-xs">Total Paid</span>
          <span className="text-[#FAF7F2] font-semibold">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <a
          href={`https://wa.me/?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#1fb955] text-white font-semibold px-5 py-2.5 rounded-full uppercase tracking-[0.15em] text-xs transition"
        >
          Save to WhatsApp
        </a>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[#D4A574]/40 text-[#D4A574] hover:bg-[#D4A574]/10 font-semibold px-5 py-2.5 rounded-full uppercase tracking-[0.15em] text-xs transition"
        >
          Add to Calendar
        </a>
      </div>

      <p className="text-[#FAF7F2]/50 text-xs leading-relaxed max-w-md mx-auto">
        Show {isMulti ? 'each pass' : 'this code (or the QR)'} at the gate on the day(s) printed above.
        Carry a government photo ID matching the pass holder name.
      </p>
    </div>
  );
};

export default TicketSuccess;
