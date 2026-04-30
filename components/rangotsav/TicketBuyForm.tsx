import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateEmail, validateName, validatePhone } from '../../lib/security/validation';
import TicketSuccess, { type TicketSuccessItem } from './TicketSuccess';
import SoldOutBanner from './SoldOutBanner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const MAX_TOTAL_QTY = 10;

type Stage = 'form' | 'paying' | 'verifying' | 'success' | 'soldout';
type DaySelection = 'day_1' | 'day_2' | 'both';

interface OrderItem {
  ticket_id: string;
  ticket_code: string;
  day_selection: DaySelection;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

interface CartCounts {
  day_1: number;
  day_2: number;
  both: number;
}

interface RemainingPerDay {
  day_1: number;
  day_2: number;
}

const dayLabels: Record<DaySelection, { title: string; sub: string }> = {
  day_1: { title: 'Day 1 only', sub: 'Sat · 25 May' },
  day_2: { title: 'Day 2 only', sub: 'Sun · 26 May' },
  both:  { title: 'Both Days',  sub: '25 + 26 May' },
};

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const TicketBuyForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cart, setCart] = useState<CartCounts>({ day_1: 0, day_2: 0, both: 0 });

  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<RemainingPerDay | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [error, setError] = useState<string | null>(null);
  const [successItems, setSuccessItems] = useState<TicketSuccessItem[] | null>(null);
  const [successTotal, setSuccessTotal] = useState<number>(0);

  // Load price + per-day remaining capacity on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: priceData }, { data: remainingData, error: rpcErr }] = await Promise.all([
          supabase
            .from('settings')
            .select('value')
            .eq('key', 'rangotsav_ticket_price')
            .single(),
          supabase.rpc('rangotsav_tickets_remaining'),
        ]);

        if (cancelled) return;

        if (priceData?.value) {
          const p = Number(priceData.value);
          if (Number.isFinite(p) && p > 0) setUnitPrice(p);
        }

        if (!rpcErr) {
          const row = Array.isArray(remainingData) ? remainingData[0] : remainingData;
          const day1 = Number(row?.day_1_remaining ?? 0);
          const day2 = Number(row?.day_2_remaining ?? 0);
          setRemaining({ day_1: day1, day_2: day2 });
          if (day1 <= 0 && day2 <= 0) setStage('soldout');
        }
      } catch (e) {
        console.error('Failed to load ticket pricing/availability:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived: how many of each day this cart consumes (a 'both' eats from both buckets).
  const consumedDay1 = cart.day_1 + cart.both;
  const consumedDay2 = cart.day_2 + cart.both;

  const totalQty = cart.day_1 + cart.day_2 + cart.both;
  const totalAmount = useMemo(() => {
    if (!unitPrice) return 0;
    return cart.day_1 * unitPrice + cart.day_2 * unitPrice + cart.both * unitPrice * 2;
  }, [cart, unitPrice]);

  // Per-row caps: respect total cart cap of 10 AND per-day remaining
  const capFor = (key: keyof CartCounts) => {
    if (!remaining) return MAX_TOTAL_QTY;
    const headroomTotal = MAX_TOTAL_QTY - (totalQty - cart[key]);
    let dayHeadroom = MAX_TOTAL_QTY;
    if (key === 'day_1') {
      // can grow until day_1_remaining is exhausted (consumedDay1 currently includes cart.day_1; subtract that to get base load)
      const baseDay1 = consumedDay1 - cart.day_1;
      dayHeadroom = remaining.day_1 - baseDay1;
    } else if (key === 'day_2') {
      const baseDay2 = consumedDay2 - cart.day_2;
      dayHeadroom = remaining.day_2 - baseDay2;
    } else {
      // both: limited by min(day_1_remaining - cart.day_1, day_2_remaining - cart.day_2)
      dayHeadroom = Math.min(
        remaining.day_1 - cart.day_1,
        remaining.day_2 - cart.day_2,
      );
    }
    return Math.max(0, Math.min(headroomTotal, dayHeadroom));
  };

  const dec = (key: keyof CartCounts) => setCart((c) => ({ ...c, [key]: Math.max(0, c[key] - 1) }));
  const inc = (key: keyof CartCounts) => setCart((c) => ({ ...c, [key]: Math.min(capFor(key), c[key] + 1) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!RAZORPAY_KEY) {
      setError('Online payments are temporarily unavailable. Please contact us on WhatsApp.');
      return;
    }
    if (!unitPrice) {
      setError('Ticket pricing is unavailable right now. Please refresh and try again.');
      return;
    }
    if (totalQty < 1) {
      setError('Add at least one pass to continue.');
      return;
    }
    if (totalQty > MAX_TOTAL_QTY) {
      setError(`Max ${MAX_TOTAL_QTY} passes per checkout.`);
      return;
    }

    const nameCheck = validateName(name, 'Name');
    if (!nameCheck.isValid) {
      setError(nameCheck.error || 'Invalid name');
      return;
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Invalid email');
      return;
    }
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid || !phoneCheck.sanitizedValue) {
      setError(phoneCheck.error || 'Phone is required');
      return;
    }

    if (remaining) {
      if (consumedDay1 > remaining.day_1) {
        setError(`Only ${remaining.day_1} Day 1 pass${remaining.day_1 === 1 ? '' : 'es'} remaining.`);
        return;
      }
      if (consumedDay2 > remaining.day_2) {
        setError(`Only ${remaining.day_2} Day 2 pass${remaining.day_2 === 1 ? '' : 'es'} remaining.`);
        return;
      }
    }

    const cleanName = nameCheck.sanitizedValue!;
    const cleanEmail = emailCheck.sanitizedValue!;
    const cleanPhone = phoneCheck.sanitizedValue!;

    // Build the items array — only include rows with quantity > 0
    const items: { day_selection: DaySelection; quantity: number }[] = [];
    if (cart.day_1 > 0) items.push({ day_selection: 'day_1', quantity: cart.day_1 });
    if (cart.day_2 > 0) items.push({ day_selection: 'day_2', quantity: cart.day_2 });
    if (cart.both > 0)  items.push({ day_selection: 'both',  quantity: cart.both  });

    setStage('paying');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please try again.');
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-rangotsav-order',
        {
          body: {
            items,
            buyerName: cleanName,
            buyerEmail: cleanEmail,
            buyerPhone: cleanPhone,
          },
        },
      );

      if (orderError || !orderData?.order_id || !orderData?.purchase_group_id || !Array.isArray(orderData?.items)) {
        const errCode = orderData?.error;
        if (errCode === 'SOLD_OUT_DAY_1' || errCode === 'SOLD_OUT_DAY_2') {
          setStage('form');
          setError(
            errCode === 'SOLD_OUT_DAY_1'
              ? 'Day 1 just sold out while you were filling the form. Try Day 2 or Both Days.'
              : 'Day 2 just sold out while you were filling the form. Try Day 1 or Both Days.',
          );
          // Refresh remaining counts
          const { data: r } = await supabase.rpc('rangotsav_tickets_remaining');
          const row = Array.isArray(r) ? r[0] : r;
          if (row) {
            const d1 = Number(row.day_1_remaining ?? 0);
            const d2 = Number(row.day_2_remaining ?? 0);
            setRemaining({ day_1: d1, day_2: d2 });
            if (d1 <= 0 && d2 <= 0) setStage('soldout');
          }
        } else {
          setStage('form');
          setError(errCode || orderError?.message || 'Failed to create payment order.');
        }
        return;
      }

      const orderId: string = orderData.order_id;
      const groupId: string = orderData.purchase_group_id;
      const orderItems: OrderItem[] = orderData.items;
      const amount: number = Number(orderData.amount);

      // Closes-modal / payment-fail cleanup: flip ALL sibling rows in the group
      // to 'failed' immediately so they stop counting against inventory. The
      // server-side RPC verifies (group_id, order_id) match before flipping.
      const markAbandoned = async () => {
        try {
          await supabase.rpc('mark_rangotsav_purchase_group_failed', {
            p_group_id: groupId,
            p_order_id: orderId,
          });
        } catch (e) {
          console.error('mark_rangotsav_purchase_group_failed failed:', e);
        }
      };

      const passSummary = orderItems
        .map((i) => `${i.quantity}× ${dayLabels[i.day_selection].title}`)
        .join(', ');

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Urbane Haauz · Rangotsav 2026',
        description: passSummary,
        image: '/logo-uh.png',
        order_id: orderId,
        handler: async (response: any) => {
          setStage('verifying');
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'verify-rangotsav-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  purchase_group_id: groupId,
                },
              },
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || verifyError?.message || 'Payment verification failed');
            }

            const successItemsList: TicketSuccessItem[] = orderItems.map((i) => ({
              ticketCode: i.ticket_code,
              daySelection: i.day_selection,
              quantity: i.quantity,
              unitPrice: i.unit_price,
              totalAmount: i.total_amount,
            }));

            // Fire-and-forget confirmation email — don't block the success screen on it
            try {
              const { sendRangotsavTicketConfirmation } = await import('../../lib/email/emailService');
              sendRangotsavTicketConfirmation({
                buyerName: cleanName,
                buyerEmail: cleanEmail,
                items: successItemsList,
                totalAmount: amount,
              }).catch((err) => console.error('Ticket email send failed:', err));
            } catch (err) {
              console.error('Ticket email import failed:', err);
            }

            setSuccessItems(successItemsList);
            setSuccessTotal(amount);
            setStage('success');
          } catch (verifyErr: any) {
            console.error('Payment verification error:', verifyErr);
            setStage('form');
            setError(
              verifyErr?.message ||
                'Payment received but we could not verify it. Our team will reach out — please save your payment ID.',
            );
          }
        },
        prefill: {
          name: cleanName,
          email: cleanEmail,
          contact: cleanPhone,
        },
        notes: {
          kind: 'rangotsav',
          purchase_group_id: groupId,
          item_count: String(orderItems.length),
        },
        theme: { color: '#D4A574' },
        modal: {
          ondismiss: () => {
            markAbandoned();
            setStage('form');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Rangotsav payment failed:', response.error);
        markAbandoned();
        setStage('form');
        setError(response?.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      console.error('Rangotsav buy flow error:', err);
      setStage('form');
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  if (stage === 'soldout') {
    return <SoldOutBanner />;
  }

  if (stage === 'success' && successItems) {
    return (
      <TicketSuccess
        buyerName={name.trim()}
        items={successItems}
        totalAmount={successTotal}
      />
    );
  }

  const isBusy = stage === 'paying' || stage === 'verifying';

  // Light-themed input styling — sits on the white card from TicketsSection
  const inputBase =
    'w-full bg-[#FAF7F2] text-[#1C1C1C] border border-[#1C1C1C]/15 rounded-xl px-5 py-3.5 placeholder:text-[#1C1C1C]/35 focus:border-[#A67833] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A574]/30 disabled:opacity-50 transition';
  const labelBase =
    'block text-[#A67833] text-[11px] uppercase tracking-[0.22em] mb-2 font-bold';

  const dayPriceFor = (key: keyof CartCounts) =>
    !unitPrice ? 0 : key === 'both' ? unitPrice * 2 : unitPrice;

  const renderStepper = (key: keyof CartCounts) => {
    const cap = capFor(key);
    const value = cart[key];
    const price = dayPriceFor(key);
    const dayRemaining =
      remaining
        ? key === 'both'
          ? Math.min(remaining.day_1 - cart.day_1, remaining.day_2 - cart.day_2)
          : key === 'day_1'
            ? remaining.day_1 - (consumedDay1 - cart.day_1)
            : remaining.day_2 - (consumedDay2 - cart.day_2)
        : null;
    const lowStock = dayRemaining !== null && dayRemaining > 0 && dayRemaining < 25;
    const dayLabel = dayLabels[key];

    return (
      <div className="flex items-center justify-between gap-3 py-3 border-b border-[#1C1C1C]/10 last:border-b-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[#1C1C1C] font-serif text-base">{dayLabel.title}</span>
            <span className="text-[#1C1C1C]/50 text-xs uppercase tracking-[0.15em]">{dayLabel.sub}</span>
          </div>
          <div className="text-[#1C1C1C]/70 text-sm mt-0.5">
            ₹{price.toLocaleString('en-IN')} <span className="text-[#1C1C1C]/45 text-xs">per pass</span>
            {lowStock && (
              <span className="block text-[#C84B0F] mt-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold">
                Only {dayRemaining} left
              </span>
            )}
            {cap === 0 && value === 0 && (
              <span className="block text-[#1C1C1C]/45 mt-0.5 text-[10px] uppercase tracking-[0.18em] font-semibold">
                Sold out
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => dec(key)}
            disabled={isBusy || value <= 0}
            aria-label={`Decrease ${dayLabel.title}`}
            className="w-9 h-9 rounded-full border border-[#1C1C1C]/15 text-[#1C1C1C] hover:border-[#A67833] hover:text-[#A67833] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            −
          </button>
          <span aria-live="polite" className="text-[#1C1C1C] text-xl font-serif w-7 text-center">
            {value}
          </span>
          <button
            type="button"
            onClick={() => inc(key)}
            disabled={isBusy || value >= cap}
            aria-label={`Increase ${dayLabel.title}`}
            className="w-9 h-9 rounded-full border border-[#1C1C1C]/15 text-[#1C1C1C] hover:border-[#A67833] hover:text-[#A67833] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h4 className="font-serif text-2xl text-[#1C1C1C] mb-2">Buy your Rangotsav pass</h4>
        <p className="text-[#1C1C1C]/60 text-sm">
          {unitPrice ? (
            <>
              ₹{unitPrice.toLocaleString('en-IN')} per day · ₹{(unitPrice * 2).toLocaleString('en-IN')} for both days · 25–26 May 2026 · Pelling
            </>
          ) : (
            'Loading pricing…'
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelBase}>Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pass holder name (matches your ID)"
            disabled={isBusy}
            className={inputBase}
          />
        </div>

        <div>
          <label className={labelBase}>Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isBusy}
            className={inputBase}
          />
        </div>

        <div>
          <label className={labelBase}>Phone Number *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 ..."
            disabled={isBusy}
            className={inputBase}
          />
        </div>

        <div>
          <label className={labelBase}>Pick your day(s) — max {MAX_TOTAL_QTY} passes total</label>
          <div className="bg-[#FAF7F2] border border-[#1C1C1C]/10 rounded-xl px-5">
            {renderStepper('day_1')}
            {renderStepper('day_2')}
            {renderStepper('both')}
          </div>
        </div>

        {unitPrice && (
          <div className="border-t border-[#1C1C1C]/10 pt-5 flex items-baseline justify-between">
            <span className="text-[#1C1C1C]/60 text-sm uppercase tracking-[0.15em] font-semibold">Total</span>
            <span className="text-[#1C1C1C] text-3xl font-serif">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-[#C84B0F]/10 border border-[#C84B0F]/40 rounded-xl px-4 py-3 text-sm text-[#8a2f06]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy || !unitPrice || totalQty < 1}
          className="w-full bg-gradient-to-r from-[#D4A574] to-[#c8985b] hover:from-[#e6bd8e] hover:to-[#d4a574] disabled:opacity-60 disabled:cursor-not-allowed text-[#1C1C1C] font-bold px-8 py-4 rounded-full uppercase tracking-[0.18em] text-sm transition shadow-lg shadow-[#D4A574]/30 hover:shadow-xl hover:shadow-[#D4A574]/40"
        >
          {stage === 'paying'
            ? 'Opening Payment…'
            : stage === 'verifying'
            ? 'Confirming…'
            : totalQty < 1
            ? 'Add at least one pass'
            : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
        </button>

        <p className="text-[#1C1C1C]/50 text-[11px] text-center tracking-wide">
          Secure payment via Razorpay · UPI / Cards / Net Banking. Email + WhatsApp confirmation. No physical tickets.
        </p>
      </form>
    </div>
  );
};

export default TicketBuyForm;
