import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { validateEmail, validateName, validatePhone } from '../lib/security/validation';

type AdminTab = 'inventory' | 'sell' | 'checkin';

const TICKET_CODE_RE = /^RANG-2026-[A-Z0-9]+$/i;

// Accepts either a bare ticket code (RANG-2026-XXX) or a deep-link URL with
// ?code=RANG-2026-XXX (what the email/on-screen QR encodes). Returns the
// normalized uppercase code, or null if nothing valid is found.
function extractTicketCode(scanned: string): string | null {
  const trimmed = scanned.trim();
  if (TICKET_CODE_RE.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  try {
    const url = new URL(trimmed);
    const code = url.searchParams.get('code');
    if (code && TICKET_CODE_RE.test(code)) {
      return code.toUpperCase();
    }
  } catch {
    // not a URL; fall through
  }
  return null;
}

interface InventorySummary {
  total_capacity: number;
  sold_online: number;
  sold_offline: number;
  sold_total: number;
  pending_held: number;
  revenue_collected: number;
}

interface TicketRow {
  id: string;
  ticket_code: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  source: 'online' | 'offline';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  checked_in_count: number;
  checked_in_at: string | null;
  notes: string | null;
  created_at: string;
}

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const RangotsavAdmin: React.FC = () => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Pull ?code= once on mount so a QR deep-link lands us in the check-in tab
  // with the lookup pre-filled. Read synchronously so we don't get a flash
  // of the inventory tab before the redirect.
  const initialCode = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('code');
    return raw ? extractTicketCode(raw) : null;
  }, []);

  const [tab, setTab] = useState<AdminTab>(initialCode ? 'checkin' : 'inventory');

  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [recent, setRecent] = useState<TicketRow[]>([]);
  const [unitPrice, setUnitPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth gate (mirrors AdminDashboard.tsx pattern)
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [authLoading, isAdmin, navigate]);

  // Once auth is settled and we honoured the deep link, strip ?code= from the
  // URL so a manual refresh doesn't re-trigger the lookup or accidentally
  // expose the code in browser history when the page is shared.
  useEffect(() => {
    if (initialCode && typeof window !== 'undefined' && isAdmin) {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.toString());
    }
  }, [initialCode, isAdmin]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [{ data: summaryData }, { data: recentData }, { data: priceData }] = await Promise.all([
        supabase.from('rangotsav_inventory_summary').select('*').single(),
        supabase
          .from('rangotsav_tickets')
          .select(
            'id, ticket_code, buyer_name, buyer_email, buyer_phone, quantity, unit_price, total_amount, source, payment_status, payment_method, checked_in_count, checked_in_at, notes, created_at',
          )
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('settings').select('value').eq('key', 'rangotsav_ticket_price').single(),
      ]);
      if (cancelled) return;
      if (summaryData) {
        setSummary({
          total_capacity: Number(summaryData.total_capacity ?? 300),
          sold_online: Number(summaryData.sold_online ?? 0),
          sold_offline: Number(summaryData.sold_offline ?? 0),
          sold_total: Number(summaryData.sold_total ?? 0),
          pending_held: Number(summaryData.pending_held ?? 0),
          revenue_collected: Number(summaryData.revenue_collected ?? 0),
        });
      }
      if (recentData) setRecent(recentData as TicketRow[]);
      if (priceData?.value) setUnitPrice(Number(priceData.value));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, refreshKey]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-urbane-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-urbane-gold font-semibold mb-1">
              Rangotsav 2026
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
              Ticket Operations
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Inventory · offline sales · door check-in. 25–26 May, 2026 · Pelling.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to dashboard
          </button>
        </header>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {(
            [
              ['inventory', 'Inventory'],
              ['sell', 'Sell Offline'],
              ['checkin', 'Check-in'],
            ] as Array<[AdminTab, string]>
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-5 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
                tab === k
                  ? 'border-urbane-gold text-urbane-darkGreen'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'inventory' && (
          <InventoryTab
            summary={summary}
            recent={recent}
            loading={loading}
            onRefresh={refresh}
          />
        )}
        {tab === 'sell' && (
          <SellOfflineTab
            unitPrice={unitPrice}
            soldByUserId={user?.id ?? null}
            onSold={refresh}
            remaining={summary ? summary.total_capacity - summary.sold_total - summary.pending_held : null}
          />
        )}
        {tab === 'checkin' && <CheckInTab onRefresh={refresh} initialCode={initialCode} />}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 Inventory                                  */
/* -------------------------------------------------------------------------- */

const InventoryTab: React.FC<{
  summary: InventorySummary | null;
  recent: TicketRow[];
  loading: boolean;
  onRefresh: () => void;
}> = ({ summary, recent, loading, onRefresh }) => {
  const remaining = summary ? Math.max(summary.total_capacity - summary.sold_total - summary.pending_held, 0) : 0;
  const pct = summary && summary.total_capacity > 0
    ? Math.min(100, Math.round((summary.sold_total / summary.total_capacity) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="text-sm text-urbane-darkGreen hover:underline"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Capacity"
          value={summary?.total_capacity ?? '—'}
          tone="neutral"
        />
        <StatCard
          label="Sold Online"
          value={summary?.sold_online ?? '—'}
          tone="green"
        />
        <StatCard
          label="Sold Offline"
          value={summary?.sold_offline ?? '—'}
          tone="amber"
        />
        <StatCard
          label="Remaining"
          value={summary ? remaining : '—'}
          tone={remaining < 30 ? 'red' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Pending (15-min hold)"
          value={summary?.pending_held ?? '—'}
          tone="neutral"
          subtitle="Razorpay orders mid-flight"
        />
        <StatCard
          label="Revenue Collected"
          value={summary ? formatINR(summary.revenue_collected) : '—'}
          tone="green"
          subtitle="Paid tickets only"
        />
      </div>

      {/* Sold-progress bar */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {summary?.sold_total ?? 0} / {summary?.total_capacity ?? 300} sold
          </span>
          <span className="text-xs text-gray-500">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-urbane-gold to-urbane-darkGreen transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Recent ticket activity</h3>
          <span className="text-xs text-gray-500">Last 50</span>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No tickets sold yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{r.ticket_code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.buyer_name}</div>
                      <div className="text-xs text-gray-500">{r.buyer_email}</div>
                    </td>
                    <td className="px-4 py-3">{r.quantity}</td>
                    <td className="px-4 py-3">{formatINR(Number(r.total_amount))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        r.source === 'offline' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        r.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        r.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        r.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {r.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number | string;
  subtitle?: string;
  tone: 'neutral' | 'green' | 'amber' | 'red';
}> = ({ label, value, subtitle, tone }) => {
  const toneClass = {
    neutral: 'text-gray-900',
    green: 'text-green-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  }[tone];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
        {label}
      </div>
      <div className={`text-3xl font-bold ${toneClass}`}>{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Sell Offline                                  */
/* -------------------------------------------------------------------------- */

const SellOfflineTab: React.FC<{
  unitPrice: number | null;
  soldByUserId: string | null;
  remaining: number | null;
  onSold: () => void;
}> = ({ unitPrice, soldByUserId, remaining, onSold }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi_offline' | 'card_offline'>('cash');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    code?: string;
    message?: string;
  } | null>(null);

  const total = unitPrice ? unitPrice * quantity : 0;
  const maxQty = Math.min(10, remaining ?? 10);

  const reset = () => {
    setName(''); setEmail(''); setPhone(''); setQuantity(1);
    setPaymentMethod('cash'); setNotes(''); setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitPrice) {
      setResult({ ok: false, message: 'Ticket price is unavailable.' });
      return;
    }
    const nameCheck = validateName(name, 'Name');
    if (!nameCheck.isValid) return setResult({ ok: false, message: nameCheck.error });
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return setResult({ ok: false, message: emailCheck.error });
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid || !phoneCheck.sanitizedValue)
      return setResult({ ok: false, message: phoneCheck.error || 'Phone is required' });

    setSubmitting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('reserve_rangotsav_tickets', {
        p_quantity: quantity,
        p_buyer_name: nameCheck.sanitizedValue,
        p_buyer_email: emailCheck.sanitizedValue,
        p_buyer_phone: phoneCheck.sanitizedValue,
        p_unit_price: unitPrice,
        p_source: 'offline',
        p_payment_method: paymentMethod,
        p_sold_by: soldByUserId,
        p_notes: notes.trim() || null,
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.ticket_code) throw new Error('Reservation returned no ticket code');

      // Fire-and-forget confirmation email (don't block UX on it)
      try {
        const { sendRangotsavTicketConfirmation } = await import('../lib/email/emailService');
        sendRangotsavTicketConfirmation({
          ticketCode: row.ticket_code,
          buyerName: nameCheck.sanitizedValue!,
          buyerEmail: emailCheck.sanitizedValue!,
          quantity,
          unitPrice,
          totalAmount: total,
        }).catch((e) => console.error('Offline ticket email failed:', e));
      } catch (e) {
        console.error('Failed to import emailService:', e);
      }

      setResult({ ok: true, code: row.ticket_code, message: 'Ticket created.' });
      onSold();
    } catch (err: any) {
      const msg = err?.message?.includes('SOLD_OUT')
        ? 'Sold out — no inventory remaining.'
        : err?.message || 'Failed to create ticket.';
      setResult({ ok: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
      {result?.ok && result.code ? (
        <div className="text-center py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-green-700 font-semibold mb-2">
            Ticket Created
          </p>
          <p className="font-mono text-3xl text-gray-900 tracking-[0.18em] mb-2">{result.code}</p>
          <p className="text-gray-500 text-sm mb-6">
            Confirmation email sent to the buyer.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={reset}
              className="bg-urbane-darkGreen text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90"
            >
              Sell another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Sell ticket offline
            </h3>
            <p className="text-sm text-gray-500">
              Walk-in / phone / cash sale. {unitPrice ? `Price: ${formatINR(unitPrice)} per person.` : ''}
              {remaining !== null && (
                <span className="ml-2 text-amber-700">{remaining} remaining</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">
                Buyer Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-urbane-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">
                Email *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-urbane-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">
                Phone *
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 ..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-urbane-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-urbane-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['cash', 'Cash'],
                  ['upi_offline', 'UPI (in-person)'],
                  ['card_offline', 'Card (POS)'],
                ] as Array<[typeof paymentMethod, string]>
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPaymentMethod(val)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    paymentMethod === val
                      ? 'bg-urbane-darkGreen text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-600 font-semibold mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Sold at front desk, etc."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-urbane-gold focus:outline-none resize-none"
            />
          </div>

          {unitPrice && (
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-baseline border border-gray-200">
              <span className="text-sm text-gray-600 uppercase tracking-wide">Total</span>
              <span className="text-2xl font-bold text-urbane-darkGreen">{formatINR(total)}</span>
            </div>
          )}

          {result && !result.ok && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
              {result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !unitPrice}
            className="w-full bg-urbane-gold hover:bg-opacity-90 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-lg uppercase tracking-wide transition"
          >
            {submitting ? 'Creating ticket…' : 'Create offline ticket'}
          </button>
        </form>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Check-in                                    */
/* -------------------------------------------------------------------------- */

const CheckInTab: React.FC<{ onRefresh: () => void; initialCode: string | null }> = ({
  onRefresh,
  initialCode,
}) => {
  const [code, setCode] = useState(initialCode ?? '');
  const [ticket, setTicket] = useState<TicketRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const scannerRegionId = 'rangotsav-qr-region';

  // Look up a code without requiring a form submit (used by deep link + scanner).
  const lookupCode = useCallback(async (raw: string) => {
    const normalized = raw.trim().toUpperCase();
    if (!normalized) return;
    setError(null);
    setInfo(null);
    setTicket(null);
    setLoading(true);
    const { data, error: err } = await supabase
      .from('rangotsav_tickets')
      .select('*')
      .eq('ticket_code', normalized)
      .maybeSingle();
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (!data) {
      setError(`Ticket not found: ${normalized}`);
      return;
    }
    setTicket(data as TicketRow);
  }, []);

  // Auto-look up if we landed here via a QR deep-link with ?code=.
  useEffect(() => {
    if (initialCode) {
      lookupCode(initialCode);
    }
  }, [initialCode, lookupCode]);

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    lookupCode(code);
  };

  const remainingAdmits = ticket ? ticket.quantity - ticket.checked_in_count : 0;

  const checkInOne = async (n: number) => {
    if (!ticket) return;
    if (ticket.payment_status !== 'paid') {
      setError('Ticket payment is not confirmed. Cannot check in.');
      return;
    }
    if (n < 1 || n > remainingAdmits) return;

    setError(null);
    setInfo(null);

    const newCount = ticket.checked_in_count + n;
    const { data, error: err } = await supabase
      .from('rangotsav_tickets')
      .update({
        checked_in_count: newCount,
        checked_in_at: ticket.checked_in_at ?? new Date().toISOString(),
      })
      .eq('id', ticket.id)
      .select()
      .single();

    if (err) {
      setError(err.message);
      return;
    }
    setTicket(data as TicketRow);
    setInfo(`${n} ${n === 1 ? 'guest' : 'guests'} checked in. ${ticket.quantity - newCount} remaining.`);
    onRefresh();
  };

  // Scanner lifecycle. We dynamic-import html5-qrcode so it's only pulled into
  // the bundle when an admin actually opens the scanner. On a successful scan
  // we extract the ticket code, stop the camera, and trigger the lookup.
  const stopScanner = useCallback(async () => {
    const inst = scannerRef.current;
    scannerRef.current = null;
    setScannerActive(false);
    if (!inst) return;
    try {
      if (inst.isScanning) {
        await inst.stop();
      }
      await inst.clear();
    } catch (err) {
      console.error('Failed to stop QR scanner:', err);
    }
  }, []);

  useEffect(() => {
    if (!scannerActive) return;
    let cancelled = false;
    setScannerError(null);

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const inst = new Html5Qrcode(scannerRegionId, /* verbose */ false);
        scannerRef.current = inst;

        await inst.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            const extracted = extractTicketCode(decodedText);
            if (!extracted) {
              // Wrong QR — keep scanning, just flash a hint
              setScannerError('Not a Rangotsav pass — try again.');
              return;
            }
            setCode(extracted);
            setScannerError(null);
            await stopScanner();
            await lookupCode(extracted);
          },
          () => {
            // Per-frame "no QR found" — ignore (very chatty)
          },
        );
      } catch (err: any) {
        console.error('QR scanner failed to start:', err);
        if (!cancelled) {
          setScannerError(
            err?.message?.includes('Permission')
              ? 'Camera permission denied. Allow camera access and try again.'
              : 'Could not start the camera. Check permissions and try again.',
          );
          setScannerActive(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      // Best-effort cleanup if the tab/component unmounts mid-scan.
      const inst = scannerRef.current;
      scannerRef.current = null;
      if (inst) {
        Promise.resolve(inst.isScanning ? inst.stop() : null)
          .then(() => inst.clear?.())
          .catch(() => {});
      }
    };
  }, [scannerActive, lookupCode, stopScanner]);

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="font-serif text-xl font-bold text-gray-900">Door check-in</h3>
        {!scannerActive ? (
          <button
            type="button"
            onClick={() => setScannerActive(true)}
            className="bg-urbane-gold text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 inline-flex items-center gap-2 shrink-0"
            aria-label="Open camera QR scanner"
          >
            📷 Scan QR
          </button>
        ) : (
          <button
            type="button"
            onClick={() => stopScanner()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 inline-flex items-center gap-2 shrink-0"
          >
            ✕ Stop scanner
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Scan a guest's QR with the camera, or paste / type the code (e.g.{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">RANG-2026-A4F2K9</code>).
      </p>

      {scannerActive && (
        <div className="mb-5 rounded-xl border border-gray-200 overflow-hidden bg-black">
          <div id={scannerRegionId} className="w-full max-w-md mx-auto" />
          <p className="text-center text-xs text-gray-400 py-2 bg-gray-900">
            Hold the QR steady inside the frame
          </p>
        </div>
      )}
      {scannerError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-3 text-sm mb-4">
          {scannerError}
        </div>
      )}

      <form onSubmit={lookup} className="flex gap-2 mb-6">
        <input
          autoFocus={!initialCode}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="RANG-2026-…"
          className="flex-1 font-mono border border-gray-300 rounded-lg px-4 py-3 focus:border-urbane-gold focus:outline-none uppercase tracking-wider"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-urbane-darkGreen text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}
      {info && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm mb-4">
          {info}
        </div>
      )}

      {ticket && (
        <TicketDetail
          ticket={ticket}
          remainingAdmits={remainingAdmits}
          onCheckIn={checkInOne}
        />
      )}
    </div>
  );
};

const TicketDetail: React.FC<{
  ticket: TicketRow;
  remainingAdmits: number;
  onCheckIn: (n: number) => void;
}> = ({ ticket, remainingAdmits, onCheckIn }) => {
  const stepOptions = useMemo(() => {
    const opts = [];
    for (let i = 1; i <= Math.min(remainingAdmits, 10); i++) opts.push(i);
    return opts;
  }, [remainingAdmits]);

  const isPaid = ticket.payment_status === 'paid';
  const fullyCheckedIn = remainingAdmits === 0;

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-mono text-lg text-gray-900 tracking-[0.15em]">{ticket.ticket_code}</p>
          <p className="text-sm text-gray-500">{ticket.buyer_name} · {ticket.buyer_phone}</p>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          isPaid ? 'bg-green-100 text-green-800' :
          ticket.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {ticket.payment_status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-5">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
          <div className="text-gray-900">{ticket.buyer_email}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Source</div>
          <div className="text-gray-900 capitalize">{ticket.source}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
          <div className="text-gray-900">{formatINR(Number(ticket.total_amount))}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Admits</div>
          <div className="text-gray-900">
            <strong>{ticket.checked_in_count}</strong> / {ticket.quantity} entered
          </div>
        </div>
      </div>

      {!isPaid && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg px-4 py-3 text-sm">
          Payment not confirmed. Do not allow entry until payment is verified.
        </div>
      )}

      {isPaid && fullyCheckedIn && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg px-4 py-3 text-sm">
          All {ticket.quantity} guests on this pass have already entered.
        </div>
      )}

      {isPaid && !fullyCheckedIn && (
        <div>
          <p className="text-sm text-gray-700 mb-3">
            Mark how many of the {remainingAdmits} remaining {remainingAdmits === 1 ? 'guest' : 'guests'} are entering now:
          </p>
          <div className="flex flex-wrap gap-2">
            {stepOptions.map((n) => (
              <button
                key={n}
                onClick={() => onCheckIn(n)}
                className="bg-urbane-gold hover:bg-opacity-90 text-white font-bold px-5 py-2.5 rounded-lg"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RangotsavAdmin;
