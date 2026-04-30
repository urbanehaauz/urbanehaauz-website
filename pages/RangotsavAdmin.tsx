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

type DaySelection = 'day_1' | 'day_2' | 'both';

interface InventorySummary {
  total_capacity_day_1: number;
  total_capacity_day_2: number;
  sold_day_1_only: number;
  sold_day_2_only: number;
  sold_both: number;
  occupied_day_1: number;
  occupied_day_2: number;
  sold_online: number;
  sold_offline: number;
  sold_total_admits: number;
  pending_day_1: number;
  pending_day_2: number;
  revenue_collected: number;
  checked_in_day_1: number;
  checked_in_day_2: number;
  checked_in_total: number;
  checked_in_today: number;
}

interface TicketRow {
  id: string;
  ticket_code: string;
  purchase_group_id: string;
  day_selection: DaySelection;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  source: 'online' | 'offline';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string | null;
  checked_in_day_1: number;
  checked_in_day_2: number;
  checked_in_at: string | null;
  notes: string | null;
  created_at: string;
}

const DAY_LABELS: Record<DaySelection, { short: string; full: string; chipClass: string }> = {
  day_1: { short: 'Day 1',     full: 'Day 1 · 25 May', chipClass: 'bg-rose-100 text-rose-800' },
  day_2: { short: 'Day 2',     full: 'Day 2 · 26 May', chipClass: 'bg-indigo-100 text-indigo-800' },
  both:  { short: 'Both Days', full: 'Both · 25–26 May', chipClass: 'bg-emerald-100 text-emerald-800' },
};

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
  const [bothDaysPrice, setBothDaysPrice] = useState<number | null>(null);
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

  // Live updates: any insert/update/delete on rangotsav_tickets triggers a
  // refresh so check-ins by another staff member or new sales appear without
  // anyone hitting the Refresh button.
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('rangotsav_tickets_admin_dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rangotsav_tickets' },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, refresh]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      // Sweep stale pendings before reading so the inventory summary and
      // recent-sales table reflect current truth. Non-fatal on failure.
      try {
        await supabase.rpc('expire_stale_pending_rangotsav_tickets');
      } catch (e) {
        console.error('expire_stale_pending_rangotsav_tickets failed:', e);
      }

      const [{ data: summaryData }, { data: recentData }, { data: priceData }] = await Promise.all([
        supabase.from('rangotsav_inventory_summary').select('*').single(),
        supabase
          .from('rangotsav_tickets')
          .select(
            'id, ticket_code, purchase_group_id, day_selection, buyer_name, buyer_email, buyer_phone, quantity, unit_price, total_amount, source, payment_status, payment_method, checked_in_day_1, checked_in_day_2, checked_in_at, notes, created_at',
          )
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('settings').select('key, value').in('key', ['rangotsav_ticket_price', 'rangotsav_both_days_price']),
      ]);
      if (cancelled) return;
      if (summaryData) {
        setSummary({
          total_capacity_day_1: Number(summaryData.total_capacity_day_1 ?? 300),
          total_capacity_day_2: Number(summaryData.total_capacity_day_2 ?? 300),
          sold_day_1_only: Number(summaryData.sold_day_1_only ?? 0),
          sold_day_2_only: Number(summaryData.sold_day_2_only ?? 0),
          sold_both: Number(summaryData.sold_both ?? 0),
          occupied_day_1: Number(summaryData.occupied_day_1 ?? 0),
          occupied_day_2: Number(summaryData.occupied_day_2 ?? 0),
          sold_online: Number(summaryData.sold_online ?? 0),
          sold_offline: Number(summaryData.sold_offline ?? 0),
          sold_total_admits: Number(summaryData.sold_total_admits ?? 0),
          pending_day_1: Number(summaryData.pending_day_1 ?? 0),
          pending_day_2: Number(summaryData.pending_day_2 ?? 0),
          revenue_collected: Number(summaryData.revenue_collected ?? 0),
          checked_in_day_1: Number(summaryData.checked_in_day_1 ?? 0),
          checked_in_day_2: Number(summaryData.checked_in_day_2 ?? 0),
          checked_in_total: Number(summaryData.checked_in_total ?? 0),
          checked_in_today: Number(summaryData.checked_in_today ?? 0),
        });
      }
      if (recentData) setRecent(recentData as TicketRow[]);
      if (priceData) {
        const map = Object.fromEntries(priceData.map((r: any) => [r.key, r.value]));
        const p = Number(map['rangotsav_ticket_price']);
        const b = Number(map['rangotsav_both_days_price']);
        if (Number.isFinite(p) && p > 0) setUnitPrice(p);
        if (Number.isFinite(b) && b > 0) {
          setBothDaysPrice(b);
        } else if (Number.isFinite(p) && p > 0) {
          setBothDaysPrice(p * 2);
        }
      }
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
              Inventory · offline sales · per-day check-in. 25–26 May, 2026 · Pelling.
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
            bothDaysPrice={bothDaysPrice}
            soldByUserId={user?.id ?? null}
            onSold={refresh}
            remainingDay1={summary ? Math.max(summary.total_capacity_day_1 - summary.occupied_day_1 - summary.pending_day_1, 0) : null}
            remainingDay2={summary ? Math.max(summary.total_capacity_day_2 - summary.occupied_day_2 - summary.pending_day_2, 0) : null}
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
  const remainingDay1 = summary
    ? Math.max(summary.total_capacity_day_1 - summary.occupied_day_1 - summary.pending_day_1, 0)
    : 0;
  const remainingDay2 = summary
    ? Math.max(summary.total_capacity_day_2 - summary.occupied_day_2 - summary.pending_day_2, 0)
    : 0;
  const pctDay1 = summary && summary.total_capacity_day_1 > 0
    ? Math.min(100, Math.round((summary.occupied_day_1 / summary.total_capacity_day_1) * 100))
    : 0;
  const pctDay2 = summary && summary.total_capacity_day_2 > 0
    ? Math.min(100, Math.round((summary.occupied_day_2 / summary.total_capacity_day_2) * 100))
    : 0;

  // Total unique passes sold (rows of paid status). A 'both' row counts once here.
  const passesSold = summary
    ? summary.sold_day_1_only + summary.sold_day_2_only + summary.sold_both
    : 0;

  // Helpers to render the per-day check-in counts on a row, accounting for day_selection.
  const renderCheckIn = (r: TicketRow) => {
    if (r.payment_status !== 'paid') return <span className="text-gray-400">—</span>;
    if (r.day_selection === 'day_1') {
      return r.checked_in_day_1 >= r.quantity
        ? <span className="text-green-700 font-semibold">{r.checked_in_day_1}/{r.quantity} ✓</span>
        : <span className="text-amber-700 font-semibold">{r.checked_in_day_1}/{r.quantity}</span>;
    }
    if (r.day_selection === 'day_2') {
      return r.checked_in_day_2 >= r.quantity
        ? <span className="text-green-700 font-semibold">{r.checked_in_day_2}/{r.quantity} ✓</span>
        : <span className="text-amber-700 font-semibold">{r.checked_in_day_2}/{r.quantity}</span>;
    }
    // both
    const max = r.quantity;
    return (
      <div className="text-xs">
        <div className={r.checked_in_day_1 >= max ? 'text-green-700 font-semibold' : 'text-amber-700'}>
          D1: {r.checked_in_day_1}/{max}
        </div>
        <div className={r.checked_in_day_2 >= max ? 'text-green-700 font-semibold' : 'text-amber-700'}>
          D2: {r.checked_in_day_2}/{max}
        </div>
      </div>
    );
  };

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

      {/* Per-day occupancy KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Day 1 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs uppercase tracking-wide text-rose-700 font-semibold">Day 1 · 25 May</span>
            <span className="text-xs text-gray-500">{pctDay1}%</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary?.occupied_day_1 ?? '—'}
            <span className="text-base text-gray-400 font-normal"> / {summary?.total_capacity_day_1 ?? 300}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {remainingDay1} remaining · {summary?.pending_day_1 ?? 0} pending
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all ${remainingDay1 < 30 ? 'bg-red-500' : 'bg-rose-500'}`}
              style={{ width: `${pctDay1}%` }}
            />
          </div>
        </div>

        {/* Day 2 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs uppercase tracking-wide text-indigo-700 font-semibold">Day 2 · 26 May</span>
            <span className="text-xs text-gray-500">{pctDay2}%</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {summary?.occupied_day_2 ?? '—'}
            <span className="text-base text-gray-400 font-normal"> / {summary?.total_capacity_day_2 ?? 300}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {remainingDay2} remaining · {summary?.pending_day_2 ?? 0} pending
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all ${remainingDay2 < 30 ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${pctDay2}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pass-mix breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Day 1 only"
          value={summary?.sold_day_1_only ?? '—'}
          tone="neutral"
          subtitle="passes sold"
        />
        <StatCard
          label="Day 2 only"
          value={summary?.sold_day_2_only ?? '—'}
          tone="neutral"
          subtitle="passes sold"
        />
        <StatCard
          label="Both Days"
          value={summary?.sold_both ?? '—'}
          tone="green"
          subtitle="passes sold"
        />
        <StatCard
          label="Revenue"
          value={summary ? formatINR(summary.revenue_collected) : '—'}
          tone="green"
          subtitle="paid only"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Sold Online"
          value={summary?.sold_online ?? '—'}
          tone="neutral"
        />
        <StatCard
          label="Sold Offline"
          value={summary?.sold_offline ?? '—'}
          tone="amber"
        />
        <StatCard
          label="Checked In Today"
          value={summary?.checked_in_today ?? '—'}
          tone="green"
          subtitle="across both days (IST)"
        />
        <StatCard
          label="Checked In · Total"
          value={summary ? `${summary.checked_in_total}/${summary.sold_total_admits}` : '—'}
          tone="neutral"
          subtitle={`D1: ${summary?.checked_in_day_1 ?? 0} · D2: ${summary?.checked_in_day_2 ?? 0}`}
        />
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Recent ticket activity</h3>
          <span className="text-xs text-gray-500">Last 50 · {passesSold} passes sold total</span>
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
                  <th className="px-4 py-3 text-left">Day</th>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Checked-in</th>
                  <th className="px-4 py-3 text-left">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{r.ticket_code}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${DAY_LABELS[r.day_selection].chipClass}`}>
                        {DAY_LABELS[r.day_selection].short}
                      </span>
                    </td>
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
                    <td className="px-4 py-3 text-xs">{renderCheckIn(r)}</td>
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
  bothDaysPrice: number | null;
  soldByUserId: string | null;
  remainingDay1: number | null;
  remainingDay2: number | null;
  onSold: () => void;
}> = ({ unitPrice, bothDaysPrice, soldByUserId, remainingDay1, remainingDay2, onSold }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cart, setCart] = useState<{ day_1: number; day_2: number; both: number }>({ day_1: 0, day_2: 0, both: 0 });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi_offline' | 'card_offline'>('cash');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    codes?: Array<{ code: string; day: DaySelection; quantity: number }>;
    message?: string;
  } | null>(null);

  const totalQty = cart.day_1 + cart.day_2 + cart.both;
  const total = useMemo(() => {
    if (!unitPrice) return 0;
    const bundle = bothDaysPrice ?? unitPrice * 2;
    return cart.day_1 * unitPrice + cart.day_2 * unitPrice + cart.both * bundle;
  }, [cart, unitPrice, bothDaysPrice]);

  const capFor = (key: keyof typeof cart) => {
    const headroomTotal = 10 - (totalQty - cart[key]);
    let dayHeadroom = 10;
    if (remainingDay1 !== null && remainingDay2 !== null) {
      if (key === 'day_1') {
        dayHeadroom = remainingDay1 - cart.both;
      } else if (key === 'day_2') {
        dayHeadroom = remainingDay2 - cart.both;
      } else {
        dayHeadroom = Math.min(remainingDay1 - cart.day_1, remainingDay2 - cart.day_2);
      }
    }
    return Math.max(0, Math.min(headroomTotal, dayHeadroom));
  };

  const dec = (key: keyof typeof cart) => setCart((c) => ({ ...c, [key]: Math.max(0, c[key] - 1) }));
  const inc = (key: keyof typeof cart) => setCart((c) => ({ ...c, [key]: Math.min(capFor(key), c[key] + 1) }));

  const reset = () => {
    setName(''); setEmail(''); setPhone('');
    setCart({ day_1: 0, day_2: 0, both: 0 });
    setPaymentMethod('cash'); setNotes(''); setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitPrice) {
      setResult({ ok: false, message: 'Ticket price is unavailable.' });
      return;
    }
    if (totalQty < 1) {
      setResult({ ok: false, message: 'Add at least one pass.' });
      return;
    }
    const nameCheck = validateName(name, 'Name');
    if (!nameCheck.isValid) return setResult({ ok: false, message: nameCheck.error });
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return setResult({ ok: false, message: emailCheck.error });
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid || !phoneCheck.sanitizedValue)
      return setResult({ ok: false, message: phoneCheck.error || 'Phone is required' });

    const items: { day_selection: DaySelection; quantity: number }[] = [];
    if (cart.day_1 > 0) items.push({ day_selection: 'day_1', quantity: cart.day_1 });
    if (cart.day_2 > 0) items.push({ day_selection: 'day_2', quantity: cart.day_2 });
    if (cart.both > 0)  items.push({ day_selection: 'both',  quantity: cart.both  });

    setSubmitting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('reserve_rangotsav_tickets', {
        p_items: items,
        p_buyer_name: nameCheck.sanitizedValue,
        p_buyer_email: emailCheck.sanitizedValue,
        p_buyer_phone: phoneCheck.sanitizedValue,
        p_unit_price: unitPrice,
        p_both_days_price: bothDaysPrice ?? unitPrice * 2,
        p_source: 'offline',
        p_payment_method: paymentMethod,
        p_sold_by: soldByUserId,
        p_notes: notes.trim() || null,
      });

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [data];
      if (!rows.length || !rows[0]?.ticket_code) throw new Error('Reservation returned no rows');

      // Fire-and-forget confirmation email (don't block UX on it)
      try {
        const { sendRangotsavTicketConfirmation } = await import('../lib/email/emailService');
        sendRangotsavTicketConfirmation({
          buyerName: nameCheck.sanitizedValue!,
          buyerEmail: emailCheck.sanitizedValue!,
          items: rows.map((r: any) => ({
            ticketCode: r.ticket_code,
            daySelection: r.day_selection as DaySelection,
            quantity: Number(r.quantity),
            unitPrice: Number(r.unit_price),
            totalAmount: Number(r.total_amount),
          })),
          totalAmount: total,
        }).catch((e) => console.error('Offline ticket email failed:', e));
      } catch (e) {
        console.error('Failed to import emailService:', e);
      }

      setResult({
        ok: true,
        codes: rows.map((r: any) => ({
          code: r.ticket_code,
          day: r.day_selection as DaySelection,
          quantity: Number(r.quantity),
        })),
        message: 'Tickets created.',
      });
      onSold();
    } catch (err: any) {
      const msg = err?.message?.includes('SOLD_OUT_DAY_1')
        ? 'Day 1 is sold out.'
        : err?.message?.includes('SOLD_OUT_DAY_2')
        ? 'Day 2 is sold out.'
        : err?.message || 'Failed to create ticket.';
      setResult({ ok: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepperRow = (key: keyof typeof cart) => {
    const cap = capFor(key);
    const value = cart[key];
    const price = !unitPrice ? 0 : key === 'both' ? (bothDaysPrice ?? unitPrice * 2) : unitPrice;
    const dayLabel = DAY_LABELS[key];
    const dayRem = key === 'day_1' ? remainingDay1
                 : key === 'day_2' ? remainingDay2
                 : remainingDay1 !== null && remainingDay2 !== null ? Math.min(remainingDay1, remainingDay2) : null;

    return (
      <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-200 last:border-b-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-gray-900">{dayLabel.short}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">{dayLabel.full.replace(`${dayLabel.short} · `, '')}</span>
          </div>
          <div className="text-xs text-gray-500">
            {formatINR(price)} per pass {dayRem !== null && <span className="ml-1 text-amber-700">· {dayRem} left</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => dec(key)}
            disabled={submitting || value <= 0}
            className="w-9 h-9 rounded-full border border-gray-300 hover:border-urbane-gold disabled:opacity-30"
          >−</button>
          <span className="w-7 text-center font-semibold text-gray-900">{value}</span>
          <button
            type="button"
            onClick={() => inc(key)}
            disabled={submitting || value >= cap}
            className="w-9 h-9 rounded-full border border-gray-300 hover:border-urbane-gold disabled:opacity-30"
          >+</button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-200">
      {result?.ok && result.codes ? (
        <div className="text-center py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-green-700 font-semibold mb-3">
            {result.codes.length === 1 ? 'Ticket Created' : `${result.codes.length} Tickets Created`}
          </p>
          <div className="space-y-3 mb-6 max-w-md mx-auto">
            {result.codes.map((c) => (
              <div key={c.code} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="text-left">
                  <p className="font-mono text-base text-gray-900 tracking-[0.15em]">{c.code}</p>
                  <p className="text-xs text-gray-500">{DAY_LABELS[c.day].full} · {c.quantity} {c.quantity > 1 ? 'admits' : 'admit'}</p>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${DAY_LABELS[c.day].chipClass}`}>
                  {DAY_LABELS[c.day].short}
                </span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Confirmation email sent to the buyer.
          </p>
          <button
            onClick={reset}
            className="bg-urbane-darkGreen text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90"
          >
            Sell another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Sell tickets offline
            </h3>
            <p className="text-sm text-gray-500">
              Walk-in / phone / cash sale. {unitPrice ? `${formatINR(unitPrice)} per day · ${formatINR(bothDaysPrice ?? unitPrice * 2)} for both days.` : ''}
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
            <label className="block text-xs uppercase tracking-wide text-gray-600 font-semibold mb-2">
              Pick day(s) — max 10 passes total
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-5">
              {renderStepperRow('day_1')}
              {renderStepperRow('day_2')}
              {renderStepperRow('both')}
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
            disabled={submitting || !unitPrice || totalQty < 1}
            className="w-full bg-urbane-gold hover:bg-opacity-90 disabled:opacity-50 text-white font-bold px-6 py-3.5 rounded-lg uppercase tracking-wide transition"
          >
            {submitting ? 'Creating tickets…' : totalQty < 1 ? 'Add at least one pass' : 'Create offline ticket(s)'}
          </button>
        </form>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Check-in                                    */
/* -------------------------------------------------------------------------- */

type ActiveDay = 'day_1' | 'day_2';
const ACTIVE_DAY_KEY = 'rangotsav_active_checkin_day';

// Default the active day toggle to today's date if it matches the festival,
// else fall back to whatever localStorage has, else Day 1.
function defaultActiveDay(): ActiveDay {
  if (typeof window !== 'undefined') {
    try {
      const istNow = new Date();
      // Compare against IST date (festival is in IST). Crude check: festival days are May 25 + 26 2026.
      const istDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(istNow);
      if (istDateStr === '2026-05-25') return 'day_1';
      if (istDateStr === '2026-05-26') return 'day_2';

      const saved = window.localStorage.getItem(ACTIVE_DAY_KEY);
      if (saved === 'day_1' || saved === 'day_2') return saved;
    } catch {
      // ignore
    }
  }
  return 'day_1';
}

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
  const [activeDay, setActiveDay] = useState<ActiveDay>(defaultActiveDay);
  const scannerRef = useRef<any>(null);
  const scannerRegionId = 'rangotsav-qr-region';

  // Persist the toggle so a shift swap remembers between page loads
  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVE_DAY_KEY, activeDay);
    } catch {
      // ignore
    }
  }, [activeDay]);

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

  // Whether this ticket is valid for the currently-active door day
  const isValidForActiveDay = (t: TicketRow): boolean => {
    if (t.day_selection === 'both') return true;
    return t.day_selection === activeDay;
  };

  // Per-active-day check-in count + cap for this ticket
  const activeDayCheckedIn = ticket
    ? activeDay === 'day_1' ? ticket.checked_in_day_1 : ticket.checked_in_day_2
    : 0;
  const remainingAdmits = ticket ? Math.max(ticket.quantity - activeDayCheckedIn, 0) : 0;

  const checkInOne = async (n: number) => {
    if (!ticket) return;
    if (ticket.payment_status !== 'paid') {
      setError('Ticket payment is not confirmed. Cannot check in.');
      return;
    }
    if (!isValidForActiveDay(ticket)) {
      setError(`This pass is not valid for ${DAY_LABELS[activeDay].short}.`);
      return;
    }
    if (n < 1 || n > remainingAdmits) return;

    setError(null);
    setInfo(null);

    const newCount = activeDayCheckedIn + n;
    const updates: Partial<TicketRow> = {
      checked_in_at: ticket.checked_in_at ?? new Date().toISOString(),
    };
    if (activeDay === 'day_1') {
      updates.checked_in_day_1 = newCount;
    } else {
      updates.checked_in_day_2 = newCount;
    }

    const { data, error: err } = await supabase
      .from('rangotsav_tickets')
      .update(updates)
      .eq('id', ticket.id)
      .select()
      .single();

    if (err) {
      setError(err.message);
      return;
    }
    setTicket(data as TicketRow);
    setInfo(
      `${n} ${n === 1 ? 'guest' : 'guests'} checked in for ${DAY_LABELS[activeDay].short}. ${ticket.quantity - newCount} remaining on this pass for today.`,
    );
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

      {/* Active day toggle — every check-in is logged against this day */}
      <div className="mb-5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
          Today's door — set this once per shift
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['day_1', 'day_2'] as ActiveDay[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDay(d)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition border-2 ${
                activeDay === d
                  ? d === 'day_1'
                    ? 'bg-rose-100 border-rose-500 text-rose-900'
                    : 'bg-indigo-100 border-indigo-500 text-indigo-900'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {DAY_LABELS[d].full}
            </button>
          ))}
        </div>
      </div>

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
          activeDay={activeDay}
          isValidForActiveDay={isValidForActiveDay(ticket)}
          activeDayCheckedIn={activeDayCheckedIn}
          remainingAdmits={remainingAdmits}
          onCheckIn={checkInOne}
        />
      )}
    </div>
  );
};

const TicketDetail: React.FC<{
  ticket: TicketRow;
  activeDay: ActiveDay;
  isValidForActiveDay: boolean;
  activeDayCheckedIn: number;
  remainingAdmits: number;
  onCheckIn: (n: number) => void;
}> = ({ ticket, activeDay, isValidForActiveDay, activeDayCheckedIn, remainingAdmits, onCheckIn }) => {
  const stepOptions = useMemo(() => {
    const opts = [];
    for (let i = 1; i <= Math.min(remainingAdmits, 10); i++) opts.push(i);
    return opts;
  }, [remainingAdmits]);

  const isPaid = ticket.payment_status === 'paid';
  const fullyCheckedIn = remainingAdmits === 0;
  const dayLabel = DAY_LABELS[ticket.day_selection];

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="min-w-0">
          <p className="font-mono text-lg text-gray-900 tracking-[0.15em] break-all">{ticket.ticket_code}</p>
          <p className="text-sm text-gray-500">{ticket.buyer_name} · {ticket.buyer_phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            isPaid ? 'bg-green-100 text-green-800' :
            ticket.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {ticket.payment_status.toUpperCase()}
          </span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${dayLabel.chipClass}`}>
            {dayLabel.full}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-5">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
          <div className="text-gray-900 break-all">{ticket.buyer_email}</div>
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
          <div className="text-xs text-gray-500 uppercase tracking-wide">Quantity</div>
          <div className="text-gray-900">{ticket.quantity} {ticket.quantity > 1 ? 'admits' : 'admit'}</div>
        </div>
      </div>

      {/* Per-day check-in counters — always shown for context */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {(ticket.day_selection === 'day_1' || ticket.day_selection === 'both') && (
          <div className={`rounded-lg px-4 py-3 border ${activeDay === 'day_1' ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Day 1 · 25 May</div>
            <div className="text-lg font-bold text-gray-900">
              {ticket.checked_in_day_1} / {ticket.quantity}
              {ticket.checked_in_day_1 >= ticket.quantity && <span className="text-green-700 ml-2">✓</span>}
            </div>
          </div>
        )}
        {(ticket.day_selection === 'day_2' || ticket.day_selection === 'both') && (
          <div className={`rounded-lg px-4 py-3 border ${activeDay === 'day_2' ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Day 2 · 26 May</div>
            <div className="text-lg font-bold text-gray-900">
              {ticket.checked_in_day_2} / {ticket.quantity}
              {ticket.checked_in_day_2 >= ticket.quantity && <span className="text-green-700 ml-2">✓</span>}
            </div>
          </div>
        )}
      </div>

      {!isPaid && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg px-4 py-3 text-sm">
          Payment not confirmed. Do not allow entry until payment is verified.
        </div>
      )}

      {isPaid && !isValidForActiveDay && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-lg px-4 py-3 text-sm">
          This pass is valid only for <strong>{dayLabel.full}</strong>, but the door is set to{' '}
          <strong>{DAY_LABELS[activeDay].full}</strong>. Switch the door toggle above, or politely refuse entry.
        </div>
      )}

      {isPaid && isValidForActiveDay && fullyCheckedIn && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg px-4 py-3 text-sm">
          All {ticket.quantity} {ticket.quantity > 1 ? 'guests' : 'guest'} on this pass already entered for{' '}
          {DAY_LABELS[activeDay].short} ({activeDayCheckedIn}/{ticket.quantity}).
        </div>
      )}

      {isPaid && isValidForActiveDay && !fullyCheckedIn && (
        <div>
          <p className="text-sm text-gray-700 mb-3">
            Admitting for <strong>{DAY_LABELS[activeDay].short}</strong>. Mark how many of the{' '}
            {remainingAdmits} remaining {remainingAdmits === 1 ? 'guest' : 'guests'} are entering now:
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
