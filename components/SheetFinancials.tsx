import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Wallet, BedDouble, Utensils, Car, Package, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Tab = { name: string; values: string[][] };
type SheetPayload = { sheetId: string; fetchedAt: string; tabs: Tab[] };

// Parse a currency / number cell like " 50,000.00 " or "₹1,200" into a number.
const parseNum = (raw: unknown): number => {
  if (raw === null || raw === undefined) return 0;
  const s = String(raw).replace(/[₹,\s]/g, '').replace(/[^0-9.\-]/g, '');
  if (!s || s === '-' || s === '.') return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
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

interface Props {
  // When true, render nothing (lets parent conditionally mount).
  hidden?: boolean;
}

const SheetFinancials: React.FC<Props> = ({ hidden }) => {
  const [data, setData] = useState<SheetPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openTab, setOpenTab] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke('read-financial-sheet');
      if (fnErr) throw fnErr;
      if (res?.error) throw new Error(res.error);
      setData(res as SheetPayload);
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to load sheet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hidden) load();
  }, [hidden, load]);

  const metrics = useMemo(() => {
    if (!data) {
      return {
        totalInvestment: 0,
        totalExpenses: 0,
        netBalance: 0,
        roomRevenue: 0,
        driverRevenue: 0,
        restaurantRevenue: 0,
        totalRevenue: 0,
        roomCount: 0,
        driverCount: 0,
        restaurantCount: 0,
      };
    }
    const balance = findTab(data.tabs, 'BalanceSheet');
    const roomBookings = findTab(data.tabs, 'Room bookings');
    const driver = findTab(data.tabs, 'Driver Room Bookings');
    const restaurant = findTab(data.tabs, 'Restaurant Billing');
    const ops = findTab(data.tabs, 'UH Ops Expenses');

    // BalanceSheet has two header rows (title row + column headers), so skip 2.
    // Columns (0-indexed): A=0 Investment Date, B=1 Name, C=2 Amount,
    //                      I=8 Expense blank, J=9 Description, K=10 Amount
    // Gate on Name (col B) being set for investments and Description (col J) for
    // expenses so orphan subtotal cells further down the sheet don't double-count.
    const totalInvestment = sumColRequiring(balance, 2, 1, 2);
    const balanceExpenses = sumColRequiring(balance, 10, 9, 2);
    const opsExpenses = sumCol(ops, 1, 1);
    const totalExpenses = balanceExpenses + opsExpenses;
    const netBalance = totalInvestment - totalExpenses;

    // Room bookings: col I=8 "Total sales"
    const roomRevenue = sumCol(roomBookings, 8, 1);
    // Driver: col E=4 "Total Daily Sales"
    const driverRevenue = sumCol(driver, 4, 1);
    // Restaurant: col F=5 "Final amount"
    const restaurantRevenue = sumCol(restaurant, 5, 1);
    const totalRevenue = roomRevenue + driverRevenue + restaurantRevenue;

    return {
      totalInvestment,
      totalExpenses,
      netBalance,
      roomRevenue,
      driverRevenue,
      restaurantRevenue,
      totalRevenue,
      roomCount: Math.max(0, (roomBookings?.values.length ?? 0) - 1),
      driverCount: Math.max(0, (driver?.values.length ?? 0) - 1),
      restaurantCount: Math.max(0, (restaurant?.values.length ?? 0) - 1),
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
            <div>
              <p className="text-red-300 font-semibold">Unable to load sheet data</p>
              <p className="text-warm-ivory text-opacity-70 text-sm mt-1">{error}</p>
              <p className="text-warm-ivory text-opacity-50 text-xs mt-2">
                Verify the Edge Function is deployed, secrets are set, and the sheet is shared with the service account.
              </p>
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
              sub={`${metrics.roomCount} bookings`}
              icon={<BedDouble size={28} />}
              tone="gold"
            />
            <KpiCard
              label="Driver Room Revenue"
              value={fmt(metrics.driverRevenue)}
              sub={`${metrics.driverCount} bookings`}
              icon={<Car size={28} />}
              tone="gold"
            />
            <KpiCard
              label="Restaurant Revenue"
              value={fmt(metrics.restaurantRevenue)}
              sub={`${metrics.restaurantCount} bills`}
              icon={<Utensils size={28} />}
              tone="gold"
            />
          </div>

          {/* Tab browser */}
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-gold flex items-center space-x-2">
              <Package size={22} />
              <span>Sheet Tabs</span>
            </h2>
            {data.tabs.map(tab => {
              const isOpen = openTab === tab.name;
              const nonEmptyRows = tab.values.filter(r => r.some(c => (c ?? '').toString().trim() !== ''));

              // Single total per tab: sum of one meaningful "primary" column.
              // Mapping is explicit per tab to avoid cluttered multi-column sums
              // (e.g., Notes/Bifurcation columns contain concatenated numbers).
              const PRIMARY_COL: Record<string, { col: number; label: string; skipHeaderRows?: number; requireCol?: number }> = {
                'balancesheet':         { col: 2,  label: 'Total Investment', skipHeaderRows: 2, requireCol: 1 },
                'provision':            { col: 6,  label: 'Total Value' },
                'room bookings':        { col: 8,  label: 'Total Sales' },
                'driver room bookings': { col: 4,  label: 'Total Sales' },
                'restaurant billing':   { col: 5,  label: 'Total Final Amount' },
                'uh ops expenses':      { col: 1,  label: 'Total Amount' },
              };
              const primary = PRIMARY_COL[tab.name.trim().toLowerCase()];
              let primaryTotal = 0;
              if (primary) {
                const skip = primary.skipHeaderRows ?? 1;
                for (let i = skip; i < tab.values.length; i++) {
                  const row = tab.values[i] ?? [];
                  if (primary.requireCol !== undefined) {
                    const gate = row[primary.requireCol];
                    if (!gate || !String(gate).trim()) continue;
                  }
                  primaryTotal += parseNum(row[primary.col]);
                }
              }

              return (
                <div key={tab.name} className="glassmorphism-strong rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenTab(isOpen ? null : tab.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {isOpen ? <ChevronDown className="text-gold" size={18} /> : <ChevronRight className="text-gold" size={18} />}
                      <span className="font-semibold text-warm-ivory">{tab.name.trim()}</span>
                      <span className="text-xs text-warm-ivory text-opacity-50">
                        {Math.max(0, nonEmptyRows.length)} rows
                      </span>
                    </div>
                    {/* Single primary total when collapsed */}
                    {!isOpen && primary && (
                      <div className="hidden md:flex flex-col items-end text-right mr-2">
                        <div className="text-warm-ivory text-opacity-50 text-[10px] uppercase tracking-wider">{primary.label}</div>
                        <div className="text-gold font-bold text-sm">{fmt(primaryTotal)}</div>
                      </div>
                    )}
                  </button>
                  {isOpen && (
                    <div className="overflow-x-auto border-t border-white/10 max-h-[500px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <tbody>
                          {nonEmptyRows.map((row, ri) => (
                            <tr key={ri} className={ri === 0 ? 'bg-white/5 sticky top-0' : 'border-t border-white/5'}>
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className={`px-3 py-2 whitespace-nowrap ${
                                    ri === 0 ? 'font-bold text-gold uppercase tracking-wide' : 'text-warm-ivory text-opacity-80'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                        {primary && (
                          <tfoot className="sticky bottom-0 bg-urbane-darkGreen/95 backdrop-blur-sm">
                            <tr className="border-t-2 border-gold">
                              <td colSpan={Math.max(1, primary.col)} className="px-3 py-3 font-bold text-warm-ivory text-opacity-60 text-[11px] uppercase tracking-wider">
                                {primary.label}
                              </td>
                              <td className="px-3 py-3 font-bold text-gold text-sm whitespace-nowrap">{fmt(primaryTotal)}</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
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
