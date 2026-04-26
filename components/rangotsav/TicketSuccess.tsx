import React from 'react';

interface TicketSuccessProps {
  ticketCode: string;
  buyerName: string;
  quantity: number;
  totalAmount: number;
}

const TicketSuccess: React.FC<TicketSuccessProps> = ({
  ticketCode,
  buyerName,
  quantity,
  totalAmount,
}) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(
    ticketCode,
  )}`;

  const waMessage = encodeURIComponent(
    `My Rangotsav 2026 Pass — Code: ${ticketCode} (${quantity} ${quantity > 1 ? 'admits' : 'admit'}). Pelling, 25–26 May 2026.`,
  );

  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Rangotsav 2026 — Urbane Haauz, Pelling') +
    '&dates=20260525T043000Z/20260526T163000Z' +
    '&details=' + encodeURIComponent(
      `Your ticket code: ${ticketCode}. Show this code (or QR) at the entrance.`,
    ) +
    '&location=' + encodeURIComponent('Urbane Haauz, SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113');

  return (
    <div className="bg-[#D4A574]/[0.05] border border-[#D4A574]/30 rounded-2xl p-8 text-center">
      <p className="text-[#7FB88F] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
        Pass Confirmed
      </p>
      <h4 className="font-serif text-2xl md:text-3xl text-[#FAF7F2] mb-1">
        You're in, {buyerName}.
      </h4>
      <p className="text-[#FAF7F2]/60 text-sm mb-6">
        A copy is on the way to your inbox. Save this page or screenshot it.
      </p>

      <div className="inline-block bg-[#FAF7F2] rounded-xl p-3 mb-4">
        <img
          src={qrUrl}
          alt={`QR for Rangotsav pass ${ticketCode}`}
          width={200}
          height={200}
          className="block w-[200px] h-[200px]"
        />
      </div>

      <p className="font-mono text-[#FAF7F2] text-xl tracking-[0.2em] mb-1 break-all">
        {ticketCode}
      </p>
      <p className="text-[#D4A574] text-[10px] uppercase tracking-[0.3em] mb-6">
        Your unique pass code
      </p>

      <div className="border-t border-[#D4A574]/20 pt-5 mb-6 max-w-sm mx-auto">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#FAF7F2]/55 uppercase tracking-[0.15em] text-xs">Pass holder</span>
          <span className="text-[#FAF7F2]">{buyerName}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#FAF7F2]/55 uppercase tracking-[0.15em] text-xs">Admits</span>
          <span className="text-[#FAF7F2]">{quantity} {quantity > 1 ? 'persons' : 'person'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#FAF7F2]/55 uppercase tracking-[0.15em] text-xs">Paid</span>
          <span className="text-[#FAF7F2]">₹{totalAmount.toLocaleString('en-IN')}</span>
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
        Show this code (or the QR) at the gate on 25–26 May 2026. Carry a government photo ID
        matching the pass holder name.
      </p>
    </div>
  );
};

export default TicketSuccess;
