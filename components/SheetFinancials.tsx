import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Wallet, BedDouble, Utensils, Car, AlertCircle, Users, Moon, Smartphone, Banknote, Clock, Percent, Target, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Tab = { name: string; values: string[][] };
type SheetPayload = { sheetId: string; fetchedAt: string; tabs: Tab[] };

// Parse a currency / number cell like " 50,000.00 " or "₹1,200" into a number.
// Strict: rejects text, but evaluates plus-separated sums like "4300+1000" = 5300.
// Also collapses Indian-format digit grouping ("1,04,17,500" → 10417500).
const parseNum = (raw: unknown): number => {
  if (raw === null || raw === undefined) return 0;
  let s = String(raw).replace(/[₹\s]/g, '').trim();
  if (!s || s === '-' || s === '.') return 0;
  s = s.replace(/,/g, '');
  if (s.includes('+')) {
    const parts = s.split('+').map(p => p.trim()).filter(Boolean);
    let sum = 0;
    for (const p of parts) {
      if (!/^-?\d+(?:\.\d+)?$/.test(p)) return 0;
      sum += Number(p);
    }
    return sum;
  }
  return /^-?\d+(?:\.\d+)?$/.test(s) ? Number(s) : 0;
};

const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

// Sum a column (by index) across all rows except the first `skipHeaderRows`.
const sumCol = (tab: Tab | undefined, colIdx: number, skipHeaderRows = 1): number => {
  if (!tab) return 0;
  let total = 0;
  for (let i = skipHeaderRows; i < tab.values.length; i++) {
    total += parseNum(tab.values[i]?.[colIdx]);
  }
  return total;
};

// Sum column `amountCol`, but only for rows where column `requireCol` is non-empty.
// Used to avoid counting orphan subtotal/summary cells that live further down the sheet.
const sumColRequiring = (
  tab: Tab | undefined,
  amountCol: number,
  requireCol: number,
  skipHeaderRows = 1
): number => {
  if (!tab) return 0;
  let total = 0;
  for (let i = skipHeaderRows; i < tab.values.length; i++) {
    const gate = tab.values[i]?.[requireCol];
    if (!gate || !String(gate).trim()) continue;
    total += parseNum(tab.values[i]?.[amountCol]);
  }
  return total;
};

const findTab = (tabs: Tab[], name: string): Tab | undefined =>
  tabs.find(t => t.name.trim().toLowerCase() === name.trim().toLowerCase());

// Parse a "Total Pax" cell like "4+2", "6+3", or "7" into a total head count.
const parsePax = (raw: unknown): number => {
  if (!raw) return 0;
  const parts = String(raw).split(/[+,\/-]/).map(p => parseInt(p.trim(), 10)).filter(n => Number.isFinite(n) && n > 0);
  return parts.reduce((a, b) => a + b, 0);
};

interface Props {
  // When true, render nothing (lets parent conditionally mount).
  hidden?: boolean;
}

const SheetFinancials: React.FC<Props> = ({ hidden }) => {
  const [data, setData] = useState<SheetPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authIssue, setAuthIssue] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAuthIssue(false);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke('read-financial-sheet');
      if (fnErr) {
        // Extract HTTP status + server-side message from the FunctionsHttpError
        const ctxResp = (fnErr as any)?.context?.response;
        const status: number | undefined = ctxResp?.status;
        let serverMsg = (fnErr as Error).message;
        try {
          const body = await ctxResp?.json?.();
          if (body?.error) serverMsg = body.error;
        } catch { /* body may already be consumed */ }

        if (status === 401) {
          setAuthIssue(true);
          throw new Error('Your admin session has expired or is invalid. Please sign in again.');
        }
        if (status === 403) {
          setAuthIssue(true);
          throw new Error('This account is not authorized as an admin.');
        }
        throw new Error(serverMsg || (fnErr as Error).message);
      }
      if (res?.error) throw new Error(res.error);
      setData(res as SheetPayload);
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to load sheet');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReauth = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }, []);

  useEffect(() => {
    if (!hidden) load();
  }, [hidden, load]);

  const metrics = useMemo(() => {
    const empty = {
      totalInvestment: 0, totalExpenses: 0, netBalance: 0,
      roomRevenue: 0, driverRevenue: 0, restaurantRevenue: 0, totalRevenue: 0,
      roomCount: 0, driverCount: 0, restaurantCount: 0,
      totalNights: 0, totalRoomsSold: 0, totalGuests: 0,
      upiCollected: 0, cashCollected: 0, dueAmount: 0,
      avgBookingValue: 0, avgRestaurantBill: 0, avgDriverBookingValue: 0,
      revenuePerNight: 0, expenseRatio: 0, restaurantAttach: 0,
      roiProgress: 0, burnRate: 0,
    };
    if (!data) return empty;

    const balance = findTab(data.tabs, 'BalanceSheet');
    const roomBookings = findTab(data.tabs, 'Room bookings');
    const driver = findTab(data.tabs, 'Driver Room Bookings');
    const restaurant = findTab(data.tabs, 'Restaurant Billing');
    const ops = findTab(data.tabs, 'UH Ops Expenses');

    const totalInvestment = sumColRequiring(balance, 2, 1, 2);
    const balanceExpenses = sumColRequiring(balance, 10, 9, 2);
    const opsExpenses = sumCol(ops, 1, 1);
    const totalExpenses = balanceExpenses + opsExpenses;

    // Room bookings aggregations (gate on col 0 Check-in Date being set to skip blank rows)
    let roomRevenue = 0, totalNights = 0, totalRoomsSold = 0, totalGuests = 0;
    let upiCollected = 0, cashCollected = 0, dueAmount = 0, roomCount = 0;
    if (roomBookings) {
      for (let i = 1; i < roomBookings.values.length; i++) {
        const row = roomBookings.values[i] ?? [];
        const gate = row[0];
        if (!gate || !String(gate).trim()) continue;
        const amt = parseNum(row[8]);
        if (amt > 0) roomCount += 1;
        roomRevenue += amt;
        totalNights += parseNum(row[2]);
        totalRoomsSold += parseNum(row[3]);
        totalGuests += parsePax(row[1]);
        upiCollected += parseNum(row[11]);
        cashCollected += parseNum(row[12]);
        dueAmount += parseNum(row[10]);
      }
    }

    // Driver bookings (col 4 = Total Daily Sales)
    let driverRevenue = 0, driverCount = 0;
    if (driver) {
      for (let i = 1; i < driver.values.length; i++) {
        const row = driver.values[i] ?? [];
        if (!row[0] || !String(row[0]).trim()) continue;
        const amt = parseNum(row[4]);
        driverRevenue += amt;
        if (amt > 0) driverCount += 1;
        upiCollected += parseNum(row[8]);
        cashCollected += parseNum(row[9]);
      }
    }

    // Restaurant (col 5 = Final amount)
    let restaurantRevenue = 0, restaurantCount = 0;
    if (restaurant) {
      for (let i = 1; i < restaurant.values.length; i++) {
        const row = restaurant.values[i] ?? [];
        if (!row[0] || !String(row[0]).trim()) continue;
        const amt = parseNum(row[5]);
        restaurantRevenue += amt;
        if (amt > 0) restaurantCount += 1;
        upiCollected += parseNum(row[7]);
        cashCollected += parseNum(row[8]);
      }
    }

    const totalRevenue = roomRevenue + driverRevenue + restaurantRevenue;
    const netBalance = totalInvestment + totalRevenue - totalExpenses;

    // Analytics
    const avgBookingValue = roomCount > 0 ? roomRevenue / roomCount : 0;
    const avgRestaurantBill = restaurantCount > 0 ? restaurantRevenue / restaurantCount : 0;
    const avgDriverBookingValue = driverCount > 0 ? driverRevenue / driverCount : 0;
    const revenuePerNight = totalNights > 0 ? roomRevenue / totalNights : 0;
    const expenseRatio = totalInvestment + totalRevenue > 0
      ? (totalExpenses / (totalInvestment + totalRevenue)) * 100
      : 0;
    // Restaurant attach: how much of room-booking customers also spent on restaurant
    // (using the "Restaurant sales" col 7 inside Room bookings tab)
    const restaurantFromRoomBookings = sumCol(roomBookings, 7, 1);
    const restaurantAttach = roomCount > 0 ? restaurantFromRoomBookings / roomCount : 0;
    // Recovery / ROI: how much of investment has been earned back via revenue
    const roiProgress = totalInvestment > 0 ? (totalRevenue / totalInvestment) * 100 : 0;

    return {
      totalInvestment, totalExpenses, netBalance,
      roomRevenue, driverRevenue, restaurantRevenue, totalRevenue,
      roomCount, driverCount, restaurantCount,
      totalNights, totalRoomsSold, totalGuests,
      upiCollected, cashCollected, dueAmount,
      avgBookingValue, avgRestaurantBill, avgDriverBookingValue,
      revenuePerNight, expenseRatio, restaurantAttach,
      roiProgress, burnRate: 0,
    };
  }, [data]);

  if (hidden) return null;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header with refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-warm-ivory text-opacity-70 text-sm">
            Live data from Google Sheet · read-only mirror
          </p>
          {data?.fetchedAt && (
            <p className="text-warm-ivory text-opacity-50 text-xs mt-1">
              Last refreshed: {new Date(data.fetchedAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="bg-copper hover:bg-opacity-90 disabled:opacity-50 text-warm-ivory px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Loading…' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="glassmorphism-strong rounded-lg p-6 border border-red-500/40">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-300 font-semibold">
                {authIssue ? 'Sign-in required' : 'Unable to load sheet data'}
              </p>
              <p className="text-warm-ivory text-opacity-70 text-sm mt-1">{error}</p>
              {authIssue ? (
                <button
                  onClick={handleReauth}
                  className="mt-3 bg-copper hover:bg-opacity-90 text-warm-ivory px-4 py-2 rounded-lg font-medium text-sm"
                >
                  Sign in again
                </button>
              ) : (
                <p className="text-warm-ivory text-opacity-50 text-xs mt-2">
                  Verify the Edge Function is deployed, secrets are set, and the sheet is shared with the service account.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && !data && (
        <div className="glassmorphism-strong rounded-lg p-12 text-center">
          <RefreshCw className="mx-auto text-gold animate-spin mb-4" size={32} />
          <p className="text-warm-ivory text-opacity-70">Fetching sheet data…</p>
        </div>
      )}

      {data && (
        <>
          {/* Top-line KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard label="Total Investment" value={fmt(metrics.totalInvestment)} icon={<Wallet size={28} />} tone="gold" />
            <KpiCard label="Total Expenses" value={fmt(metrics.totalExpenses)} icon={<TrendingDown size={28} />} tone="red" />
            <KpiCard
              label="Net Balance"
              value={fmt(metrics.netBalance)}
              icon={metrics.netBalance >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
              tone={metrics.netBalance >= 0 ? 'green' : 'red'}
            />
            <KpiCard label="Total Revenue" value={fmt(metrics.totalRevenue)} icon={<TrendingUp size={28} />} tone="green" />
          </div>

          {/* Revenue breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard
              label="Room Bookings Revenue"
              value={fmt(metrics.roomRevenue)}
              sub={`${metrics.roomCount} bookings · avg ${fmt(metrics.avgBookingValue)}`}
              icon={<BedDouble size={28} />}
              tone="gold"
            />
            <KpiCard
              label="Driver Room Revenue"
              value={fmt(metrics.driverRevenue)}
              sub={`${metrics.driverCount} bookings · avg ${fmt(metrics.avgDriverBookingValue)}`}
              icon={<Car size={28} />}
              tone="gold"
            />
            <KpiCard
              label="Restaurant Revenue"
              value={fmt(metrics.restaurantRevenue)}
              sub={`${metrics.restaurantCount} bills · avg ${fmt(metrics.avgRestaurantBill)}`}
              icon={<Utensils size={28} />}
              tone="gold"
            />
          </div>

          {/* Operational metrics */}
          <div>
            <h2 className="text-xl font-serif text-gold mb-4 flex items-center space-x-2">
              <Activity size={20} />
              <span>Operations</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <KpiCard label="Guests Served" value={metrics.totalGuests.toLocaleString('en-IN')} icon={<Users size={24} />} tone="gold" sub="Total head count" />
              <KpiCard label="Room-Nights" value={metrics.totalNights.toLocaleString('en-IN')} icon={<Moon size={24} />} tone="gold" sub={`${metrics.totalRoomsSold} rooms sold`} />
              <KpiCard label="Revenue / Night" value={fmt(metrics.revenuePerNight)} icon={<BedDouble size={24} />} tone="gold" sub="Per room-night" />
              <KpiCard label="F&B Attach" value={fmt(metrics.restaurantAttach)} icon={<Utensils size={24} />} tone="gold" sub="Restaurant per booking" />
            </div>
          </div>

          {/* Payment & collections */}
          <div>
            <h2 className="text-xl font-serif text-gold mb-4 flex items-center space-x-2">
              <Banknote size={20} />
              <span>Collections</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <KpiCard label="UPI Collected" value={fmt(metrics.upiCollected)} icon={<Smartphone size={24} />} tone="gold" sub="Digital payments" />
              <KpiCard label="Cash Collected" value={fmt(metrics.cashCollected)} icon={<Banknote size={24} />} tone="gold" sub="Physical cash" />
              <KpiCard label="Due / Outstanding" value={fmt(metrics.dueAmount)} icon={<Clock size={24} />} tone={metrics.dueAmount > 0 ? 'red' : 'green'} sub="Unsettled balance" />
              <KpiCard label="Expense Ratio" value={`${metrics.expenseRatio.toFixed(1)}%`} icon={<Percent size={24} />} tone={metrics.expenseRatio > 80 ? 'red' : 'gold'} sub="Of capital + revenue" />
            </div>
          </div>

          {/* Recovery / ROI */}
          <div className="glassmorphism-strong rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target size={20} className="text-gold" />
                <h2 className="text-xl font-serif text-gold">Investment Recovery</h2>
              </div>
              <span className="text-sm text-warm-ivory text-opacity-60">
                {fmt(metrics.totalRevenue)} / {fmt(metrics.totalInvestment)}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-urbane-gold via-amber-400 to-green-400 transition-all duration-700"
                style={{ width: `${Math.min(100, metrics.roiProgress).toFixed(1)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-warm-ivory text-opacity-60">
              <span>{metrics.roiProgress.toFixed(1)}% of investment recovered through revenue</span>
              <span>{metrics.roiProgress >= 100 ? 'Recovered ✓' : `${fmt(Math.max(0, metrics.totalInvestment - metrics.totalRevenue))} to go`}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---------- Subcomponent ----------

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone: 'gold' | 'green' | 'red';
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, icon, tone }) => {
  const color =
    tone === 'green' ? 'text-green-400' : tone === 'red' ? 'text-red-400' : 'text-gold';
  return (
    <div className="glassmorphism-strong rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-warm-ivory text-opacity-70 text-sm mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color} truncate`}>{value}</p>
          {sub && <p className="text-warm-ivory text-opacity-50 text-xs mt-1">{sub}</p>}
        </div>
        <div className={color}>{icon}</div>
      </div>
    </div>
  );
};

export default SheetFinancials;
