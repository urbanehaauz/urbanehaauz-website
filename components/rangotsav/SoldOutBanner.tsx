import React from 'react';

const SoldOutBanner: React.FC<{ onNotifyClick?: () => void }> = ({ onNotifyClick }) => (
  <div className="text-center bg-[#C84B0F]/15 border border-[#C84B0F]/60 rounded-2xl px-6 py-8">
    <p className="text-[#D4A574] text-xs uppercase tracking-[0.3em] font-semibold mb-3">
      Sold Out
    </p>
    <h4 className="font-serif text-2xl text-[#FAF7F2] mb-3">
      All 300 passes are gone.
    </h4>
    <p className="text-[#FAF7F2]/70 text-sm mb-5 max-w-md mx-auto leading-relaxed">
      Thank you for the love. If we open a small wait-list or release returns, we'll write to you first.
    </p>
    {onNotifyClick && (
      <button
        type="button"
        onClick={onNotifyClick}
        className="bg-[#D4A574] hover:bg-[#e6bd8e] text-[#1C1C1C] font-semibold px-6 py-3 rounded-full uppercase tracking-[0.15em] text-xs transition"
      >
        Join the wait-list
      </button>
    )}
  </div>
);

export default SoldOutBanner;
