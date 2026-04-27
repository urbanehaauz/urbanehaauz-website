import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { validateEmail, validateName, validatePhone } from '../../lib/security/validation';
import TicketSuccess from './TicketSuccess';
import SoldOutBanner from './SoldOutBanner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

type Stage = 'form' | 'paying' | 'verifying' | 'success' | 'soldout';

interface SuccessData {
  ticketCode: string;
  buyerName: string;
  quantity: number;
  totalAmount: number;
}

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
  const [quantity, setQuantity] = useState(1);

  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Load price + remaining capacity on mount
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

        if (!rpcErr && typeof remainingData === 'number') {
          setRemaining(remainingData);
          if (remainingData <= 0) setStage('soldout');
        }
      } catch (e) {
        console.error('Failed to load ticket pricing/availability:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalAmount = unitPrice ? unitPrice * quantity : 0;
  const maxQty = Math.min(10, remaining ?? 10);

  const decQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incQty = () => setQuantity((q) => Math.min(maxQty, q + 1));

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
    if (quantity < 1 || quantity > 10) {
      setError('Choose between 1 and 10 passes.');
      return;
    }
    if (remaining !== null && quantity > remaining) {
      setError(`Only ${remaining} passes remaining.`);
      return;
    }

    const cleanName = nameCheck.sanitizedValue!;
    const cleanEmail = emailCheck.sanitizedValue!;
    const cleanPhone = phoneCheck.sanitizedValue!;

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
            quantity,
            buyerName: cleanName,
            buyerEmail: cleanEmail,
            buyerPhone: cleanPhone,
          },
        },
      );

      if (orderError || !orderData?.order_id || !orderData?.ticket_id) {
        const msg =
          orderData?.error === 'SOLD_OUT'
            ? 'Sorry — Rangotsav just sold out while you were filling the form.'
            : (orderData?.error || orderError?.message || 'Failed to create payment order.');
        if (orderData?.error === 'SOLD_OUT') {
          setStage('soldout');
          setRemaining(0);
        } else {
          setStage('form');
          setError(msg);
        }
        return;
      }

      const ticketId: string = orderData.ticket_id;
      const ticketCode: string = orderData.ticket_code;
      const amount: number = Number(orderData.amount);
      const orderId: string = orderData.order_id;

      // Marks this buyer's pending row as failed when they close the
      // Razorpay modal or the payment errors. Server-side RPC verifies the
      // order_id matches before flipping status, so other people's rows
      // can't be touched. Non-fatal — the periodic 15-min sweep is the
      // backstop.
      const markAbandoned = async () => {
        try {
          await supabase.rpc('mark_rangotsav_ticket_failed', {
            p_ticket_id: ticketId,
            p_order_id: orderId,
          });
        } catch (e) {
          console.error('mark_rangotsav_ticket_failed failed:', e);
        }
      };

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Urbane Haauz · Rangotsav 2026',
        description: `Rangotsav Pass × ${quantity}`,
        image: '/logo-uh.png',
        order_id: orderData.order_id,
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
                  ticket_id: ticketId,
                },
              },
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyData?.error || verifyError?.message || 'Payment verification failed');
            }

            // Fire-and-forget confirmation email — don't block the success screen on it
            try {
              const { sendRangotsavTicketConfirmation } = await import('../../lib/email/emailService');
              sendRangotsavTicketConfirmation({
                ticketCode,
                buyerName: cleanName,
                buyerEmail: cleanEmail,
                quantity,
                unitPrice: unitPrice!,
                totalAmount: amount,
              }).catch((err) => console.error('Ticket email send failed:', err));
            } catch (err) {
              console.error('Ticket email import failed:', err);
            }

            setSuccessData({
              ticketCode,
              buyerName: cleanName,
              quantity,
              totalAmount: amount,
            });
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
          ticket_id: ticketId,
          ticket_code: ticketCode,
        },
        theme: { color: '#D4A574' },
        modal: {
          ondismiss: () => {
            // User closed Razorpay modal without paying — flip the row to
            // 'failed' immediately so it disappears from admin "pending"
            // counts and the dashboard. The 15-min sweep is the backstop.
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

  if (stage === 'success' && successData) {
    return <TicketSuccess {...successData} />;
  }

  const isBusy = stage === 'paying' || stage === 'verifying';

  return (
    <div>
      <div className="text-center mb-6">
        <h4 className="font-serif text-2xl text-[#FAF7F2] mb-2">Buy your Rangotsav pass</h4>
        <p className="text-[#FAF7F2]/60 text-sm">
          {unitPrice ? (
            <>
              ₹{unitPrice.toLocaleString('en-IN')} per person · 25–26 May 2026 · Pelling
              {remaining !== null && remaining < 50 && remaining > 0 && (
                <span className="block text-[#C84B0F] mt-1 text-xs uppercase tracking-[0.2em]">
                  Only {remaining} {remaining === 1 ? 'pass' : 'passes'} left
                </span>
              )}
            </>
          ) : (
            'Loading pricing…'
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[#D4A574] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pass holder name (matches your ID)"
            disabled={isBusy}
            style={{ backgroundColor: '#2a2a2a', color: '#FAF7F2' }}
            className="w-full border border-[#FAF7F2]/20 rounded-xl px-6 py-3.5 placeholder:text-[#FAF7F2]/40 focus:border-[#D4A574] focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[#D4A574] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isBusy}
            style={{ backgroundColor: '#2a2a2a', color: '#FAF7F2' }}
            className="w-full border border-[#FAF7F2]/20 rounded-xl px-6 py-3.5 placeholder:text-[#FAF7F2]/40 focus:border-[#D4A574] focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[#D4A574] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 ..."
            disabled={isBusy}
            style={{ backgroundColor: '#2a2a2a', color: '#FAF7F2' }}
            className="w-full border border-[#FAF7F2]/20 rounded-xl px-6 py-3.5 placeholder:text-[#FAF7F2]/40 focus:border-[#D4A574] focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[#D4A574] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">
            Number of passes
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={decQty}
              disabled={isBusy || quantity <= 1}
              aria-label="Decrease quantity"
              className="w-11 h-11 rounded-full border border-[#FAF7F2]/20 text-[#FAF7F2] hover:border-[#D4A574] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              −
            </button>
            <span
              aria-live="polite"
              className="text-[#FAF7F2] text-2xl font-serif w-10 text-center"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={incQty}
              disabled={isBusy || quantity >= maxQty}
              aria-label="Increase quantity"
              className="w-11 h-11 rounded-full border border-[#FAF7F2]/20 text-[#FAF7F2] hover:border-[#D4A574] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              +
            </button>
            <span className="text-[#FAF7F2]/45 text-xs uppercase tracking-[0.15em] ml-2">
              Max 10 per buy
            </span>
          </div>
        </div>

        {unitPrice && (
          <div className="border-t border-[#D4A574]/15 pt-5 flex items-baseline justify-between">
            <span className="text-[#FAF7F2]/60 text-sm uppercase tracking-[0.15em]">Total</span>
            <span className="text-[#FAF7F2] text-3xl font-serif">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-[#C84B0F]/15 border border-[#C84B0F]/50 rounded-xl px-4 py-3 text-sm text-[#FAF7F2]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy || !unitPrice}
          className="w-full bg-[#D4A574] hover:bg-[#e6bd8e] disabled:opacity-60 disabled:cursor-not-allowed text-[#1C1C1C] font-bold px-8 py-4 rounded-full uppercase tracking-[0.18em] text-sm transition"
        >
          {stage === 'paying'
            ? 'Opening Payment…'
            : stage === 'verifying'
            ? 'Confirming…'
            : unitPrice
            ? `Pay ₹${totalAmount.toLocaleString('en-IN')}`
            : 'Loading…'}
        </button>

        <p className="text-[#FAF7F2]/45 text-[11px] text-center tracking-wide">
          Secure payment via Razorpay · UPI / Cards / Net Banking. Email + WhatsApp confirmation. No physical tickets.
        </p>
      </form>
    </div>
  );
};

export default TicketBuyForm;
