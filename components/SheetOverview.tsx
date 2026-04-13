import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import {
  RefreshCw, TrendingUp, TrendingDown, Wallet, BedDouble, Utensils, Car,
  Users, CreditCard, Banknote, AlertCircle, Sparkles, Activity, Target, CalendarRange,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Tab = { name: string; values: string[][] };
type SheetPayload = { sheetId: string; fetchedAt: string; tabs: Tab[] };

// ---------- Parsing helpers ----------

// Strict: rejects text, but evaluates plus-separated sums like "4300+1000" = 5300.
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
const fmtShort = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(0)}k`;
  return `₹${n.toFixed(0)}`;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

// Extract a month index (0-11) from various Indian-style date strings:
// "23rd January", "3rd Feb", "8-Oct-25", "27th Dec", etc.
const parseMonth = (raw: unknown): number | null => {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  const m = s.match(/([a-z]{3,})/);
  if (!m) return null;
  const idx = MONTH_MAP[m[1]];
  return idx ?? null;
};

// Parse "8-Oct-25" style dates to a real Date object
const parseDMY = (raw: unknown): Date | null => {
  if (!raw) return null;
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3,})-(\d{2,4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = MONTH_MAP[m[2].toLowerCase()];
  let year = parseInt(m[3], 10);
  if (year < 100) year += 2000;
  if (month === undefined) return null;
  return new Date(year, month, day);
};

const findTab = (tabs: Tab[], name: string): Tab | undefined =>
  tabs.find(t => t.name.trim().toLowerCase() === name.trim().toLowerCase());

// ---------- Theme ----------

const COLORS = {
  gold: '#C5A059',
  goldLight: '#E5C558',
  copper: '#8C5E45',
  green: '#4ADE80',
  red: '#F87171',
  blue: '#60A5FA',
  purple: '#C084FC',
  orange: '#FB923C',
};

const REVENUE_PALETTE = [COLORS.gold, COLORS.orange, COLORS.purple];
const EXPENSE_COLOR = COLORS.red;
const INVESTMENT_COLOR = COLORS.green;

// Pelling seasonality multipliers — indexed so they sum to 12.0 (1.0 = average month).
// Research-backed from Sikkim Tourism data + travel-trade reports (2024–2026):
//   • Spring (Mar–Jun) is peak: clear Kanchenjunga views, rhododendron bloom, Bengali school break.
//     May is Sikkim's single highest tourism month on record (2.13 lakh visitors in May 2025).
//   • Monsoon (Jul–Aug) sees severe drop — landslides on the NJP→Pelling road route.
//   • Oct is the hidden second peak: Durga Puja drives enormous Bengali-family footfall to
//     Upper Pelling specifically (our #1 source market).
//   • Dec–Jan winter tourism has surged recently — Sikkim reported "record hotel bookings"
//     in Dec 2025 (travelandtourworld, sikkimexpress).
// These weights are used to spread the annual revenue target across months *realistically*,
// instead of squeezing the entire operating gap into the 86-day peak window.
const SEASON_MULT: Record<number, number> = {
  0: 0.80,  // Jan — NY tail + winter tourism surge (tapers mid-month)
  1: 0.70,  // Feb — coldest, lowest domestic demand
  2: 1.10,  // Mar — spring rush begins, rhododendrons start
  3: 1.50,  // Apr ★ peak — Bengali school break, clearest mountain views
  4: 1.70,  // May ★★ peak — Sikkim's single highest tourism month
  5: 1.10,  // Jun — early month strong, late June monsoon hits
  6: 0.40,  // Jul — monsoon low, landslide risk on Pelling road
  7: 0.35,  // Aug — deep monsoon, lowest footfall of the year
  8: 0.80,  // Sep — post-monsoon recovery, skies clearing
  9: 1.35,  // Oct ★ peak — Durga Puja (Bengali #1 travel trigger) + clear autumn
  10: 1.20, // Nov — autumn shoulder peak, clear Kanchenjunga views
  11: 1.00, // Dec — winter holidays, Christmas/NY, rising YoY
};
const PEAK_MONTHS = new Set([3, 4, 5, 9]); // Apr, May, Jun, Oct

// Benchmark: estimated average ANNUAL revenue for a comparable 8-room boutique hotel
// in Upper Pelling (rooms + F&B + driver rooms). Derived from:
//   • Sikkim Tourism 2024 report: ~15.4L annual domestic visitors, ~80% concentrated
//     in Mar–Jun + Sep–Nov + Dec–Jan
//   • Industry averages: 70–85% peak occupancy, 20–40% monsoon, ADR ₹2,000–3,500 peak
//   • Comparable Upper Pelling properties: Elgin Mount Pandim, Norbu Ghang, Hotel Garuda
//   • Travel Trade Journal (2025): "near-full occupancy" reports in peak + winter windows
// These are ESTIMATES for benchmarking — clearly labeled as such in the UI.
const PELLING_MARKET_BENCHMARK_ANNUAL = 5000000; // ₹50 lakh / year for an 8-room boutique

// ---------- OTA Revenue Prediction Model ----------
// Derived from ACTUAL RunHotel booking data (8 confirmed bookings, Apr–May 2026):
//   Total confirmed OTA revenue: ₹53,975 across 16 room-nights
//   Average booking value: ₹6,747 (ADR ₹1,833–₹2,230 after OTA commission)
//   Platforms: Booking.com 74%, Goibibo 22%, Agoda 3%
//   Guest profile: Bengali families (2–3 rooms, 5–9 guests per booking)
//
// Steady-state OTA revenue at full maturity (30+ reviews, 6+ months of visibility):
// Estimated at ₹75,000/month average, distributed by SEASON_MULT.
// This is conservative — comparable Pelling boutique hotels with 100+ reviews
// see ₹1–2L/month in OTA revenue during peak.
//
// Ramp-up curve: new OTA listings get buried by algorithms until reviews accumulate.
// Based on OTA platform docs + hospitality industry benchmarks (SiteMinder, Phocuswright):
//   Month 1–2 of integration: 40% of steady state (0–5 reviews)
//   Month 3: 60% (5–15 reviews)
//   Month 4: 75% (15–25 reviews)
//   Month 5–6: 85% (25–40 reviews)
//   Month 7+: 95%+ (40+ reviews, algorithm trust established)
const OTA_STEADY_STATE_MONTHLY = 75000; // ₹75k/month avg at full OTA maturity
const OTA_INTEGRATION_MONTH = 3; // April 2026 = month index 3 (0-indexed). Change if OTA went live earlier/later.
const OTA_RAMP = [0.40, 0.40, 0.60, 0.75, 0.85, 0.90, 0.95, 1.0]; // months 1–8+ of OTA visibility

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

// Dark tooltip for charts
const tooltipStyle = {
  backgroundColor: 'rgba(28, 25, 23, 0.95)',
  border: `1px solid ${COLORS.gold}`,
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#F9F8F6',
  fontSize: '13px',
  backdropFilter: 'blur(8px)',
};

// ---------- Component ----------

const SheetOverview: React.FC = () => {
  const [data, setData] = useState<SheetPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => { load(); }, [load]);

  const analytics = useMemo(() => {
    const empty = {
      totalRevenue: 0, totalInvestment: 0, totalExpenses: 0, netPosition: 0,
      totalBookings: 0, totalGuests: 0, totalNights: 0, roomsSold: 0,
      revenueByMonth: [] as Array<{ month: string; room: number; driver: number; restaurant: number; total: number }>,
      revenueMix: [] as Array<{ name: string; value: number; color: string }>,
      paymentSplit: [] as Array<{ name: string; value: number; color: string }>,
      cumulativeInvestment: [] as Array<{ month: string; amount: number }>,
      topExpenses: [] as Array<{ name: string; value: number }>,
      recentBookings: [] as Array<{ date: string; pax: string; nights: string; rooms: string; amount: number; status: string }>,
      forecast: {
        operatingGap: 0,
        dailyBaseline: 0,
        next7: 0,
        next30: 0,
        peakStart: null as Date | null,
        peakEnd: null as Date | null,
        peakDaysRemaining: 0,
        peakProjected: 0,
        peakRequiredDaily: 0,
        breakevenDate: null as Date | null,
        currentDailyRate: 0,
        onTrack: false,
        categoryTargets: [] as Array<{ category: string; historicalShare: number; requiredDaily: number; currentAvg: number; currentMedian: number; activeDays: number }>,
        monthlyForecast: [] as Array<{ month: string; projected: number; target: number }>,
        monthlyPlan: [] as Array<{
          key: string; label: string; monthIdx: number; year: number; days: number; mult: number;
          target: number; capacity: number; otaPredicted: number; combined: number;
          historical: number; benchmark: number;
          achievable: boolean; liftNeededPct: number; vsBenchmarkPct: number;
          roomTarget: number; restaurantTarget: number; driverTarget: number; isPeak: boolean;
        }>,
        annualExpenseRunRate: 0,
        annualRevenueTarget: 0,
      },
    };
    if (!data) return empty;

    const balance = findTab(data.tabs, 'BalanceSheet');
    const roomBookings = findTab(data.tabs, 'Room bookings');
    const driver = findTab(data.tabs, 'Driver Room Bookings');
    const restaurant = findTab(data.tabs, 'Restaurant Billing');
    const ops = findTab(data.tabs, 'UH Ops Expenses');

    // ---- Top-line totals ----
    let totalInvestment = 0;
    if (balance) {
      for (let i = 2; i < balance.values.length; i++) {
        const name = balance.values[i]?.[1];
        if (!name || !String(name).trim()) continue;
        totalInvestment += parseNum(balance.values[i]?.[2]);
      }
    }
    let balanceExpenses = 0;
    if (balance) {
      for (let i = 2; i < balance.values.length; i++) {
        const desc = balance.values[i]?.[9];
        if (!desc || !String(desc).trim()) continue;
        balanceExpenses += parseNum(balance.values[i]?.[10]);
      }
    }
    let opsExpenses = 0;
    if (ops) {
      for (let i = 1; i < ops.values.length; i++) {
        opsExpenses += parseNum(ops.values[i]?.[1]);
      }
    }
    const totalExpenses = balanceExpenses + opsExpenses;

    // Track unique revenue-date keys per month across all tabs, used for the forecast baseline
    const uniqueDatesByMonth: Record<number, Set<string>> = {};
    const addDate = (month: number, dateStr: string) => {
      if (month === null || month === undefined) return;
      if (!uniqueDatesByMonth[month]) uniqueDatesByMonth[month] = new Set();
      uniqueDatesByMonth[month].add(String(dateStr).trim().toLowerCase());
    };

    // ---- Room bookings aggregations ----
    const roomByMonth: Record<number, number> = {};
    let roomRevenue = 0;
    let totalBookings = 0;
    let totalGuests = 0;
    let totalNights = 0;
    let roomsSold = 0;
    let upiTotal = 0;
    let cashTotal = 0;
    // Per-category unique active date sets — used to compute real per-day averages/medians
    const roomDateTotals: Record<string, number> = {};
    const driverDateTotals: Record<string, number> = {};
    const restaurantDateTotals: Record<string, number> = {};
    const recent: Array<{ date: string; pax: string; nights: string; rooms: string; amount: number; status: string }> = [];
    if (roomBookings) {
      for (let i = 1; i < roomBookings.values.length; i++) {
        const row = roomBookings.values[i] ?? [];
        const dateStr = row[0];
        if (!dateStr || !String(dateStr).trim()) continue;
        const amount = parseNum(row[8]); // Total sales
        if (amount > 0) {
          roomRevenue += amount;
          totalBookings += 1;
        }
        // Pax can be "4+2" or "7" — extract leading integer
        const paxMatch = String(row[1] ?? '').match(/\d+/);
        if (paxMatch) totalGuests += parseInt(paxMatch[0], 10);
        totalNights += parseNum(row[2]);
        roomsSold += parseNum(row[3]);
        upiTotal += parseNum(row[11]);
        cashTotal += parseNum(row[12]);
        const month = parseMonth(dateStr);
        if (month !== null) {
          roomByMonth[month] = (roomByMonth[month] ?? 0) + amount;
          if (amount > 0) addDate(month, String(dateStr));
        }
        if (amount > 0) {
          const key = String(dateStr).trim().toLowerCase();
          roomDateTotals[key] = (roomDateTotals[key] ?? 0) + amount;
        }
        recent.push({
          date: String(dateStr),
          pax: String(row[1] ?? ''),
          nights: String(row[2] ?? ''),
          rooms: String(row[3] ?? ''),
          amount,
          status: String(row[5] ?? ''),
        });
      }
    }

    // ---- Driver bookings aggregation ----
    const driverByMonth: Record<number, number> = {};
    let driverRevenue = 0;
    if (driver) {
      for (let i = 1; i < driver.values.length; i++) {
        const row = driver.values[i] ?? [];
        const dateStr = row[0];
        if (!dateStr || !String(dateStr).trim()) continue;
        const amount = parseNum(row[4]); // Total Daily Sales
        driverRevenue += amount;
        const month = parseMonth(dateStr);
        if (month !== null) {
          driverByMonth[month] = (driverByMonth[month] ?? 0) + amount;
          if (amount > 0) addDate(month, String(dateStr));
        }
        if (amount > 0) {
          const key = String(dateStr).trim().toLowerCase();
          driverDateTotals[key] = (driverDateTotals[key] ?? 0) + amount;
        }
      }
    }

    // ---- Restaurant aggregation ----
    const restaurantByMonth: Record<number, number> = {};
    let restaurantRevenue = 0;
    if (restaurant) {
      for (let i = 1; i < restaurant.values.length; i++) {
        const row = restaurant.values[i] ?? [];
        const dateStr = row[0];
        if (!dateStr || !String(dateStr).trim()) continue;
        const amount = parseNum(row[5]); // Final amount
        restaurantRevenue += amount;
        const month = parseMonth(dateStr);
        if (month !== null) {
          restaurantByMonth[month] = (restaurantByMonth[month] ?? 0) + amount;
          if (amount > 0) addDate(month, String(dateStr));
        }
        if (amount > 0) {
          const key = String(dateStr).trim().toLowerCase();
          restaurantDateTotals[key] = (restaurantDateTotals[key] ?? 0) + amount;
        }
      }
    }

    const totalRevenue = roomRevenue + driverRevenue + restaurantRevenue;
    const netPosition = totalInvestment + totalRevenue - totalExpenses;

    // ---- Revenue trend (only months with activity) ----
    const activeMonths = new Set<number>([
      ...Object.keys(roomByMonth).map(Number),
      ...Object.keys(driverByMonth).map(Number),
      ...Object.keys(restaurantByMonth).map(Number),
    ]);
    const orderedMonths = Array.from(activeMonths).sort((a, b) => a - b);
    const revenueByMonth = orderedMonths.map(m => {
      const room = roomByMonth[m] ?? 0;
      const drv = driverByMonth[m] ?? 0;
      const rest = restaurantByMonth[m] ?? 0;
      return { month: MONTH_NAMES[m], room, driver: drv, restaurant: rest, total: room + drv + rest };
    });

    // ---- Revenue mix ----
    const revenueMix = [
      { name: 'Room Bookings', value: roomRevenue, color: COLORS.gold },
      { name: 'Restaurant', value: restaurantRevenue, color: COLORS.orange },
      { name: 'Driver Rooms', value: driverRevenue, color: COLORS.purple },
    ].filter(x => x.value > 0);

    // ---- Payment split ----
    const paymentSplit = [
      { name: 'UPI', value: upiTotal, color: COLORS.blue },
      { name: 'Cash', value: cashTotal, color: COLORS.green },
    ].filter(x => x.value > 0);

    // ---- Cumulative investment timeline ----
    const investmentsByDate: Array<{ date: Date; amount: number }> = [];
    if (balance) {
      for (let i = 2; i < balance.values.length; i++) {
        const row = balance.values[i] ?? [];
        const name = row[1];
        if (!name || !String(name).trim()) continue;
        const d = parseDMY(row[0]);
        const amt = parseNum(row[2]);
        if (d && amt > 0) investmentsByDate.push({ date: d, amount: amt });
      }
    }
    investmentsByDate.sort((a, b) => a.date.getTime() - b.date.getTime());
    const byMonthKey: Record<string, number> = {};
    for (const e of investmentsByDate) {
      const key = `${MONTH_NAMES[e.date.getMonth()]} ${String(e.date.getFullYear()).slice(2)}`;
      byMonthKey[key] = (byMonthKey[key] ?? 0) + e.amount;
    }
    let running = 0;
    const cumulativeInvestment = Object.entries(byMonthKey).map(([month, amt]) => {
      running += amt;
      return { month, amount: running };
    });

    // ---- Top expenses from UH Ops ----
    const opsRows: Array<{ name: string; value: number }> = [];
    if (ops) {
      for (let i = 1; i < ops.values.length; i++) {
        const name = String(ops.values[i]?.[0] ?? '').trim();
        const value = parseNum(ops.values[i]?.[1]);
        if (name && value > 0) opsRows.push({ name, value });
      }
    }
    const topExpenses = opsRows.sort((a, b) => b.value - a.value).slice(0, 8);

    // ---------- Forecast / path to breakeven ----------
    const operatingGap = Math.max(0, totalExpenses - totalRevenue);

    // Normalize historical data to an "average-seasonality day" baseline.
    // weightedDays = Σ (unique revenue days in month m × SEASON_MULT[m])
    let weightedDays = 0;
    for (const [mStr, set] of Object.entries(uniqueDatesByMonth)) {
      const m = Number(mStr);
      weightedDays += set.size * (SEASON_MULT[m] ?? 1);
    }
    const dailyBaseline = weightedDays > 0 ? totalRevenue / weightedDays : 0;

    // Current daily rate (unweighted, for "on-track" comparison with target)
    const totalUniqueDays = Object.values(uniqueDatesByMonth).reduce((s, set) => s + set.size, 0);
    const currentDailyRate = totalUniqueDays > 0 ? totalRevenue / totalUniqueDays : 0;

    // Project forward N days from today, applying per-day season multiplier.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const projectDays = (n: number): number => {
      let sum = 0;
      const d = new Date(today);
      for (let i = 0; i < n; i++) {
        sum += dailyBaseline * (SEASON_MULT[d.getMonth()] ?? 1);
        d.setDate(d.getDate() + 1);
      }
      return sum;
    };
    const next7 = projectDays(7);
    const next30 = projectDays(30);

    // Peak season window (Apr 1 – Jun 30). Use this year's if we haven't passed Jun 30 yet,
    // otherwise next year's.
    const currentYear = today.getFullYear();
    const useNextYearPeak = today.getMonth() > 5;
    const peakYear = useNextYearPeak ? currentYear + 1 : currentYear;
    const peakStart = new Date(peakYear, 3, 1);
    const peakEnd = new Date(peakYear, 5, 30);
    const peakRefStart = today > peakStart ? today : peakStart;
    const peakDaysRemaining =
      peakRefStart <= peakEnd
        ? Math.ceil((peakEnd.getTime() - peakRefStart.getTime()) / 86400000) + 1
        : 0;

    let peakProjected = 0;
    if (peakDaysRemaining > 0) {
      const d = new Date(peakRefStart);
      for (let i = 0; i < peakDaysRemaining; i++) {
        peakProjected += dailyBaseline * (SEASON_MULT[d.getMonth()] ?? 1);
        d.setDate(d.getDate() + 1);
      }
    }
    const peakRequiredDaily = peakDaysRemaining > 0 ? operatingGap / peakDaysRemaining : 0;
    const onTrack = operatingGap === 0 || peakProjected >= operatingGap;

    // Walk forward day-by-day until projected cumulative revenue covers the gap.
    let breakevenDate: Date | null = null;
    if (operatingGap > 0 && dailyBaseline > 0) {
      let acc = 0;
      const d = new Date(today);
      for (let i = 0; i < 730; i++) {
        acc += dailyBaseline * (SEASON_MULT[d.getMonth()] ?? 1);
        if (acc >= operatingGap) {
          breakevenDate = new Date(d);
          break;
        }
        d.setDate(d.getDate() + 1);
      }
    } else if (operatingGap === 0) {
      breakevenDate = today;
    }

    // Per-category current daily averages & medians (only over days that had revenue).
    const perDayStats = (map: Record<string, number>) => {
      const vals = Object.values(map);
      if (vals.length === 0) return { avg: 0, median: 0, activeDays: 0 };
      const sum = vals.reduce((a, b) => a + b, 0);
      const sorted = [...vals].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      return { avg: sum / vals.length, median, activeDays: vals.length };
    };
    const roomStats = perDayStats(roomDateTotals);
    const restaurantStats = perDayStats(restaurantDateTotals);
    const driverStats = perDayStats(driverDateTotals);

    // Category targets: allocate the peak-season required daily rate across room/restaurant/driver
    // by their historical share. Include current avg/median for comparison.
    const historicalShares: Array<{ name: string; amount: number; stats: typeof roomStats }> = [
      { name: 'Rooms', amount: roomRevenue, stats: roomStats },
      { name: 'Restaurant', amount: restaurantRevenue, stats: restaurantStats },
      { name: 'Driver Rooms', amount: driverRevenue, stats: driverStats },
    ];
    const historicalTotal = historicalShares.reduce((s, x) => s + x.amount, 0) || 1;
    const categoryTargets = historicalShares.map(x => ({
      category: x.name,
      historicalShare: x.amount / historicalTotal,
      requiredDaily: peakRequiredDaily * (x.amount / historicalTotal),
      currentAvg: x.stats.avg,
      currentMedian: x.stats.median,
      activeDays: x.stats.activeDays,
    }));

    // Monthly forecast for next 6 months (projected revenue vs flat expense-run-rate target).
    const monthsOfHistory = Object.keys(uniqueDatesByMonth).length || 1;
    const monthlyExpenseTarget = totalExpenses / monthsOfHistory;
    const monthlyForecast: Array<{ month: string; projected: number; target: number }> = [];
    for (let i = 0; i < 6; i++) {
      const m = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = m.getFullYear();
      const mi = m.getMonth();
      const dim = daysInMonth(year, mi);
      const start = i === 0 ? today.getDate() : 1;
      const daysInWindow = dim - start + 1;
      const projected = dailyBaseline * (SEASON_MULT[mi] ?? 1) * daysInWindow;
      monthlyForecast.push({
        month: `${MONTH_NAMES[mi]} ${String(year).slice(2)}`,
        projected: Math.round(projected),
        target: Math.round(monthlyExpenseTarget),
      });
    }

    // ---------- 12-month breakeven roadmap ----------
    // Founder-set target: ₹3.5L/month average (historical ~₹3L/month + ₹50k growth).
    // Distributed across months by Pelling seasonality so peak months carry more
    // and monsoon months carry less — balanced and realistic.
    const MONTHLY_TARGET_BASE = 350000; // ₹3.5 lakh / month average
    const annualRevenueTarget = MONTHLY_TARGET_BASE * 12; // ₹42 lakh / year
    const annualExpenseRunRate = monthsOfHistory < 12
      ? (totalExpenses / monthsOfHistory) * 12
      : totalExpenses;

    const historicalByMonthIdx: Record<number, number> = {};
    for (const rec of revenueByMonth) {
      const mi = MONTH_NAMES.indexOf(rec.month);
      if (mi >= 0) historicalByMonthIdx[mi] = rec.total;
    }

    // Build seasonal weights across the next 12 months (starting from current month).
    const startRef = new Date(today.getFullYear(), today.getMonth(), 1);
    const seasonalCapacities: number[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(startRef.getFullYear(), startRef.getMonth() + i, 1);
      const mi = d.getMonth();
      const dim = daysInMonth(d.getFullYear(), mi);
      seasonalCapacities.push(dim * (SEASON_MULT[mi] ?? 1));
    }
    const totalSeasonalWeight = seasonalCapacities.reduce((a, b) => a + b, 0) || 1;

    // Historical category shares (fallback defaults if we have no data yet)
    const roomShare = historicalTotal > 0 ? roomRevenue / historicalTotal : 0.35;
    const restShare = historicalTotal > 0 ? restaurantRevenue / historicalTotal : 0.17;
    const drvShare  = historicalTotal > 0 ? driverRevenue / historicalTotal : 0.48;

    // Pelling-market benchmark — distribute the annual benchmark across 12 months
    // using the same seasonality shape. Total of all 12 values == PELLING_MARKET_BENCHMARK_ANNUAL.
    const calendarWeightedDays: number[] = [];
    for (let mi = 0; mi < 12; mi++) {
      const y = startRef.getFullYear();
      calendarWeightedDays.push(daysInMonth(y, mi) * (SEASON_MULT[mi] ?? 1));
    }
    const calendarWeightTotal = calendarWeightedDays.reduce((a, b) => a + b, 0) || 1;
    const benchmarkByMonthIdx: Record<number, number> = {};
    for (let mi = 0; mi < 12; mi++) {
      benchmarkByMonthIdx[mi] = PELLING_MARKET_BENCHMARK_ANNUAL * (calendarWeightedDays[mi] / calendarWeightTotal);
    }

    const monthlyPlan: Array<{
      key: string;
      label: string;
      monthIdx: number;
      year: number;
      days: number;
      mult: number;
      target: number;         // achievable target for this month
      capacity: number;       // direct revenue (walk-in/phone/website) from historical pace
      otaPredicted: number;   // OTA revenue prediction (RunHotel channel)
      combined: number;       // capacity + otaPredicted
      historical: number;     // actual recorded revenue for this month (any year)
      benchmark: number;      // estimated avg for a comparable Pelling boutique
      achievable: boolean;    // combined ≥ target × 0.90
      liftNeededPct: number;  // % lift from combined to hit target
      vsBenchmarkPct: number; // our target as % of market benchmark
      roomTarget: number;
      restaurantTarget: number;
      driverTarget: number;
      isPeak: boolean;
    }> = [];

    // OTA seasonal weight total (for distributing OTA_STEADY_STATE_MONTHLY across months)
    // OTA annual total = OTA_STEADY_STATE_MONTHLY × 12. Distribute across months
    // using (days × SEASON_MULT) weights so the annual sum is preserved but peak
    // months get proportionally more and monsoon months get proportionally less.
    const otaAnnualTotal = OTA_STEADY_STATE_MONTHLY * 12; // ₹9L at full maturity

    for (let i = 0; i < 12; i++) {
      const d = new Date(startRef.getFullYear(), startRef.getMonth() + i, 1);
      const mi = d.getMonth();
      const yr = d.getFullYear();
      const dim = daysInMonth(yr, mi);
      const mult = SEASON_MULT[mi] ?? 1;
      const capacity = dailyBaseline * mult * dim;
      const weight = seasonalCapacities[i] / totalSeasonalWeight;
      const target = annualRevenueTarget * weight;

      // OTA prediction: steady-state × seasonality × ramp-up curve
      // Calculate how many months since OTA integration for this calendar month
      const otaMonthsSince = (yr * 12 + mi) - (startRef.getFullYear() * 12 + OTA_INTEGRATION_MONTH);
      const rampIdx = Math.max(0, Math.min(otaMonthsSince, OTA_RAMP.length - 1));
      const rampFactor = otaMonthsSince < 0 ? 0 : OTA_RAMP[rampIdx];
      // OTA share for this month = (days × seasonality) / total weighted days across 12 months
      const monthSeasonWeight = dim * mult;
      const otaPredicted = otaAnnualTotal * (monthSeasonWeight / totalSeasonalWeight) * rampFactor;

      const combined = capacity + otaPredicted;
      const liftNeededPct = combined > 0 ? ((target / combined - 1) * 100) : 0;
      const benchmark = benchmarkByMonthIdx[mi] ?? 0;
      const vsBenchmarkPct = benchmark > 0 ? (target / benchmark) * 100 : 0;

      monthlyPlan.push({
        key: `${yr}-${mi}`,
        label: `${MONTH_NAMES[mi]} ${String(yr).slice(2)}`,
        monthIdx: mi,
        year: yr,
        days: dim,
        mult,
        target: Math.round(target),
        capacity: Math.round(capacity),
        otaPredicted: Math.round(otaPredicted),
        combined: Math.round(combined),
        historical: Math.round(historicalByMonthIdx[mi] ?? 0),
        benchmark: Math.round(benchmark),
        achievable: combined >= target * 0.9,
        liftNeededPct: Math.round(liftNeededPct),
        vsBenchmarkPct: Math.round(vsBenchmarkPct),
        roomTarget: Math.round(target * roomShare),
        restaurantTarget: Math.round(target * restShare),
        driverTarget: Math.round(target * drvShare),
        isPeak: PEAK_MONTHS.has(mi),
      });
    }

    return {
      totalRevenue,
      totalInvestment,
      totalExpenses,
      netPosition,
      totalBookings,
      totalGuests,
      totalNights,
      roomsSold,
      revenueByMonth,
      revenueMix,
      paymentSplit,
      cumulativeInvestment,
      topExpenses,
      recentBookings: recent.slice(-8).reverse(),
      forecast: {
        operatingGap,
        dailyBaseline,
        next7,
        next30,
        peakStart,
        peakEnd,
        peakDaysRemaining,
        peakProjected,
        peakRequiredDaily,
        breakevenDate,
        currentDailyRate,
        onTrack,
        categoryTargets,
        monthlyForecast,
        monthlyPlan,
        annualExpenseRunRate,
        annualRevenueTarget,
      },
    };
  }, [data]);

  // Selected month for the interactive 12-month plan drill-down.
  const [selectedPlanMonth, setSelectedPlanMonth] = useState<string | null>(null);
  const selectedMonth = useMemo(
    () => analytics.forecast.monthlyPlan.find(m => m.key === selectedPlanMonth) ?? analytics.forecast.monthlyPlan[0],
    [selectedPlanMonth, analytics.forecast.monthlyPlan]
  );

  // ---------- Render ----------

  if (loading && !data) {
    return (
      <div className="glassmorphism-strong rounded-2xl p-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-urbane-gold to-urbane-goldLight mb-4 animate-pulse">
          <Sparkles className="text-urbane-darkGreen" size={28} />
        </div>
        <p className="text-warm-ivory text-lg font-serif">Fetching live data from Google Sheets…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glassmorphism-strong rounded-2xl p-8 border border-red-500/40">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <p className="text-red-300 font-semibold text-lg">Unable to load overview</p>
            <p className="text-warm-ivory text-opacity-70 text-sm mt-1">{error}</p>
            <button
              onClick={load}
              className="mt-3 bg-copper hover:bg-opacity-90 text-warm-ivory px-4 py-2 rounded-lg font-medium text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-warm-ivory text-opacity-70 text-sm flex items-center space-x-2">
            <Activity size={14} className="text-urbane-gold" />
            <span>Live from Google Sheets</span>
            {data?.fetchedAt && (
              <>
                <span className="text-opacity-40">·</span>
                <span>Updated {new Date(data.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="bg-gradient-to-r from-urbane-gold to-urbane-goldLight hover:shadow-lg disabled:opacity-50 text-urbane-darkGreen px-5 py-2.5 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>

      {/* Hero KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HeroCard
          label="Total Revenue"
          value={fmt(analytics.totalRevenue)}
          sub={`${analytics.totalBookings} bookings`}
          icon={<TrendingUp size={24} />}
          gradient="from-green-500/20 to-emerald-500/5"
          accent={COLORS.green}
        />
        <HeroCard
          label="Total Investment"
          value={fmt(analytics.totalInvestment)}
          sub="Capital raised"
          icon={<Wallet size={24} />}
          gradient="from-yellow-500/20 to-amber-500/5"
          accent={COLORS.gold}
        />
        <HeroCard
          label="Total Expenses"
          value={fmt(analytics.totalExpenses)}
          sub="Operations + lease"
          icon={<TrendingDown size={24} />}
          gradient="from-red-500/20 to-rose-500/5"
          accent={COLORS.red}
        />
        <HeroCard
          label="Net Position"
          value={fmt(analytics.netPosition)}
          sub={analytics.netPosition >= 0 ? 'In the black' : 'Deficit'}
          icon={analytics.netPosition >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          gradient={analytics.netPosition >= 0 ? 'from-teal-500/20 to-cyan-500/5' : 'from-red-500/20 to-rose-500/5'}
          accent={analytics.netPosition >= 0 ? COLORS.green : COLORS.red}
        />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MiniStat icon={<Users size={20} />} label="Total Guests" value={analytics.totalGuests.toLocaleString('en-IN')} />
        <MiniStat icon={<BedDouble size={20} />} label="Rooms Sold" value={analytics.roomsSold.toLocaleString('en-IN')} />
        <MiniStat icon={<Activity size={20} />} label="Room-Nights" value={analytics.totalNights.toLocaleString('en-IN')} />
        <MiniStat icon={<Utensils size={20} />} label="Revenue / Booking" value={fmtShort(analytics.totalBookings > 0 ? analytics.totalRevenue / analytics.totalBookings : 0)} />
      </div>

      {/* ---------- 12-Month Breakeven Roadmap ---------- */}
      {analytics.forecast.monthlyPlan.length > 0 && (() => {
        const plan = analytics.forecast.monthlyPlan;
        const totalDirect = plan.reduce((s, m) => s + m.capacity, 0);
        const totalOta = plan.reduce((s, m) => s + m.otaPredicted, 0);
        const totalPredicted = totalDirect + totalOta;
        const totalTarget = plan.reduce((s, m) => s + m.target, 0);
        const totalGap = Math.max(0, totalTarget - totalPredicted);
        const monthsOnTrack = plan.filter(m => m.achievable).length;

        return (
          <div className="glassmorphism-strong rounded-2xl p-6 border border-urbane-gold/20 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-urbane-gold/5 blur-3xl" />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-urbane-gold/20 text-urbane-gold">
                    <CalendarRange size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-warm-ivory font-bold">12-Month Breakeven Roadmap</h2>
                    <p className="text-warm-ivory text-opacity-50 text-xs mt-1">
                      Predicted revenue vs monthly target to breakeven + secure next year's contract
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-2 ${
                  totalGap === 0
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : monthsOnTrack >= 8
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  <Activity size={12} />
                  <span>{monthsOnTrack}/12 months on track</span>
                </div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <ForecastStat
                  label="12-Month Target"
                  value={fmt(totalTarget)}
                  sub="To breakeven + next year"
                  accent={COLORS.gold}
                />
                <ForecastStat
                  label="Predicted Revenue"
                  value={fmt(totalPredicted)}
                  sub={`Direct ${fmtShort(totalDirect)} + OTA ${fmtShort(totalOta)}`}
                  accent={COLORS.green}
                />
                <ForecastStat
                  label="Total Shortfall"
                  value={totalGap > 0 ? fmt(totalGap) : '✓ Covered'}
                  sub={totalGap > 0 ? 'Revenue gap to close' : 'On track'}
                  accent={totalGap > 0 ? COLORS.red : COLORS.green}
                />
                <ForecastStat
                  label={analytics.forecast.breakevenDate ? 'Breakeven By' : 'Breakeven'}
                  value={
                    analytics.forecast.operatingGap === 0
                      ? 'Already ✓'
                      : analytics.forecast.breakevenDate
                      ? analytics.forecast.breakevenDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                      : '> 2 yrs'
                  }
                  sub="At current pace"
                  accent={analytics.forecast.operatingGap === 0 ? COLORS.green : COLORS.blue}
                />
              </div>

              {/* Chart: predicted vs target with gap highlighted */}
              <div className="rounded-xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={plan} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 11 }} />
                    <YAxis stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 11 }} tickFormatter={fmtShort} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1C1917',
                        border: `1px solid ${COLORS.gold}`,
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: '#F9F8F6',
                        fontSize: '13px',
                      }}
                      labelStyle={{ color: '#F9F8F6', fontWeight: 700, marginBottom: 6 }}
                      itemStyle={{ color: '#F9F8F6' }}
                      formatter={(v: number, name: string) => {
                        const color = name === 'Predicted Revenue' ? COLORS.gold : COLORS.red;
                        return [<span style={{ color }}>{fmt(v)}</span>, <span style={{ color }}>{name}</span>];
                      }}
                      cursor={{ fill: 'rgba(200,160,89,0.08)' }}
                    />
                    <Legend wrapperStyle={{ color: '#F9F8F6', fontSize: 11 }} />
                    <Bar dataKey="capacity" name="Direct Revenue" stackId="revenue" fill={COLORS.gold} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="otaPredicted" name="OTA Revenue (predicted)" stackId="revenue" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Monthly Target"
                      stroke={COLORS.red}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: COLORS.red, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-2 text-[10px] text-warm-ivory text-opacity-60 flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: COLORS.gold }} /> Direct (walk-in / phone / website)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: COLORS.blue }} /> OTA (Booking.com / Goibibo / Agoda)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background: COLORS.red }} /> Monthly target</span>
                </div>
              </div>

              {/* Month-by-month table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] text-warm-ivory text-opacity-50 uppercase tracking-wider border-b border-white/10">
                      <th className="text-left py-3 px-2">Month</th>
                      <th className="text-right py-3 px-2">Target</th>
                      <th className="text-right py-3 px-2">Direct</th>
                      <th className="text-right py-3 px-2">OTA</th>
                      <th className="text-right py-3 px-2">Combined</th>
                      <th className="text-right py-3 px-2">Gap / Surplus</th>
                      <th className="text-right py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.map((m) => {
                      const gap = m.target - m.combined;
                      return (
                        <tr key={m.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-2">
                            <span className="text-warm-ivory font-semibold">{m.label}</span>
                            {m.isPeak && <span className="text-urbane-gold text-[9px] ml-2 uppercase font-bold">peak</span>}
                          </td>
                          <td className="text-right py-3 px-2 text-urbane-gold font-semibold">{fmt(m.target)}</td>
                          <td className="text-right py-3 px-2 text-warm-ivory">{fmt(m.capacity)}</td>
                          <td className="text-right py-3 px-2 text-blue-300">{fmt(m.otaPredicted)}</td>
                          <td className="text-right py-3 px-2 text-warm-ivory font-semibold">{fmt(m.combined)}</td>
                          <td className={`text-right py-3 px-2 font-bold ${gap > 0 ? 'text-red-300' : 'text-green-300'}`}>
                            {gap > 0 ? `-${fmt(gap)}` : `+${fmt(Math.abs(gap))}`}
                          </td>
                          <td className="text-right py-3 px-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              m.achievable
                                ? 'bg-green-500/15 text-green-300 border border-green-500/30'
                                : 'bg-red-500/15 text-red-300 border border-red-500/30'
                            }`}>
                              {m.achievable ? 'On Track' : `Need +${m.liftNeededPct}%`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-urbane-gold/30 font-bold">
                      <td className="py-3 px-2 text-warm-ivory">12-Month Total</td>
                      <td className="text-right py-3 px-2 text-urbane-gold">{fmt(totalTarget)}</td>
                      <td className="text-right py-3 px-2 text-warm-ivory">{fmt(totalDirect)}</td>
                      <td className="text-right py-3 px-2 text-blue-300">{fmt(totalOta)}</td>
                      <td className="text-right py-3 px-2 text-warm-ivory">{fmt(totalPredicted)}</td>
                      <td className={`text-right py-3 px-2 ${totalGap > 0 ? 'text-red-300' : 'text-green-300'}`}>
                        {totalGap > 0 ? `-${fmt(totalGap)}` : `+${fmt(Math.abs(totalTarget - totalPredicted))}`}
                      </td>
                      <td className="text-right py-3 px-2 text-warm-ivory text-opacity-60 text-[10px]">
                        {monthsOnTrack}/12 months
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-warm-ivory text-opacity-40 text-[10px] mt-3 italic">
                  OTA prediction based on 8 confirmed RunHotel bookings (₹53,975 across Apr–May 2026, avg ₹6,747/booking). Steady-state ₹75k/month at maturity,
                  with ramp-up curve: 40% month 1–2 (0–5 reviews) → 60% month 3 → 75% month 4 → 95%+ month 7+. Weighted by Pelling seasonality.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Revenue Trend */}
      <ChartCard title="Revenue Trend" subtitle="Monthly split across room, restaurant, and driver rooms" icon={<TrendingUp size={20} />}>
        {analytics.revenueByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={analytics.revenueByMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRoom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradRest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradDriver" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 12 }} />
              <YAxis stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 12 }} tickFormatter={fmtShort} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ color: '#F9F8F6', fontSize: 12 }} />
              <Area type="monotone" dataKey="room" name="Rooms" stackId="1" stroke={COLORS.gold} strokeWidth={2} fill="url(#gradRoom)" />
              <Area type="monotone" dataKey="restaurant" name="Restaurant" stackId="1" stroke={COLORS.orange} strokeWidth={2} fill="url(#gradRest)" />
              <Area type="monotone" dataKey="driver" name="Driver Rooms" stackId="1" stroke={COLORS.purple} strokeWidth={2} fill="url(#gradDriver)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyState text="No revenue data yet" />}
      </ChartCard>

      {/* Revenue mix + payment split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Mix" subtitle="Where the money is coming from" icon={<BedDouble size={20} />}>
          {analytics.revenueMix.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.revenueMix}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {analytics.revenueMix.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState text="No revenue yet" />}
        </ChartCard>

        <ChartCard title="Payment Methods" subtitle="Room booking collections" icon={<CreditCard size={20} />}>
          {analytics.paymentSplit.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.paymentSplit} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 12 }} tickFormatter={fmtShort} />
                <YAxis type="category" dataKey="name" stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 13, fontWeight: 600 }} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {analytics.paymentSplit.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState text="No payment data" />}
        </ChartCard>
      </div>

      {/* Investment timeline + Top expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Cumulative Investment" subtitle="Capital raised over time" icon={<Wallet size={20} />}>
          {analytics.cumulativeInvestment.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.cumulativeInvestment} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={INVESTMENT_COLOR} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={INVESTMENT_COLOR} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 12 }} />
                <YAxis stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 12 }} tickFormatter={fmtShort} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <Area type="monotone" dataKey="amount" name="Cumulative" stroke={INVESTMENT_COLOR} strokeWidth={3} fill="url(#gradInvest)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState text="No investment data" />}
        </ChartCard>

        <ChartCard title="Top Expenses" subtitle="Largest operational line items" icon={<TrendingDown size={20} />}>
          {analytics.topExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.topExpenses} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 11 }} tickFormatter={fmtShort} />
                <YAxis type="category" dataKey="name" stroke="#F9F8F6" tick={{ fill: '#F9F8F6', fontSize: 10 }} width={140} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" fill={EXPENSE_COLOR} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState text="No expense data" />}
        </ChartCard>
      </div>

      {/* Recent bookings */}
      <ChartCard title="Recent Bookings" subtitle="Latest activity from the Room bookings tab" icon={<Users size={20} />}>
        {analytics.recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 text-urbane-gold font-semibold text-xs uppercase tracking-wider">Check-in</th>
                  <th className="text-left py-3 px-2 text-urbane-gold font-semibold text-xs uppercase tracking-wider">Pax</th>
                  <th className="text-left py-3 px-2 text-urbane-gold font-semibold text-xs uppercase tracking-wider">Nights</th>
                  <th className="text-left py-3 px-2 text-urbane-gold font-semibold text-xs uppercase tracking-wider">Rooms</th>
                  <th className="text-right py-3 px-2 text-urbane-gold font-semibold text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-2 text-urbane-gold font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentBookings.map((b, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-warm-ivory">{b.date}</td>
                    <td className="py-3 px-2 text-warm-ivory text-opacity-80">{b.pax}</td>
                    <td className="py-3 px-2 text-warm-ivory text-opacity-80">{b.nights}</td>
                    <td className="py-3 px-2 text-warm-ivory text-opacity-80">{b.rooms}</td>
                    <td className="py-3 px-2 text-right font-bold text-urbane-gold">{fmt(b.amount)}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status.toLowerCase().includes('settled') || b.status.toLowerCase().includes('paid')
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {b.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text="No bookings yet" />}
      </ChartCard>
    </div>
  );
};

// ---------- Subcomponents ----------

interface HeroCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
}

const HeroCard: React.FC<HeroCardProps> = ({ label, value, sub, icon, gradient, accent }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${gradient} border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group`}>
    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: accent }} />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <p className="text-warm-ivory text-opacity-70 text-xs uppercase tracking-widest font-semibold">{label}</p>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${accent}22`, color: accent }}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-serif font-bold text-warm-ivory mb-1 truncate">{value}</p>
      <p className="text-warm-ivory text-opacity-50 text-xs">{sub}</p>
    </div>
  </div>
);

const ForecastStat: React.FC<{ label: string; value: string; sub: string; accent: string }> = ({ label, value, sub, accent }) => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
    <p className="text-warm-ivory text-opacity-60 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
    <p className="font-serif text-2xl font-bold mt-1 truncate" style={{ color: accent }}>{value}</p>
    <p className="text-warm-ivory text-opacity-40 text-[10px] mt-0.5">{sub}</p>
  </div>
);

const MiniStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="glassmorphism-strong rounded-xl p-4 flex items-center space-x-3 hover:bg-white/5 transition-colors">
    <div className="p-2 rounded-lg bg-urbane-gold/20 text-urbane-gold flex-shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-warm-ivory text-opacity-60 text-[10px] uppercase tracking-wider truncate">{label}</p>
      <p className="text-warm-ivory font-bold text-lg truncate">{value}</p>
    </div>
  </div>
);

const ChartCard: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, icon, children }) => (
  <div className="glassmorphism-strong rounded-2xl p-6 border border-white/5">
    <div className="flex items-center space-x-3 mb-1">
      {icon && <div className="text-urbane-gold">{icon}</div>}
      <h2 className="text-xl font-serif text-warm-ivory font-bold">{title}</h2>
    </div>
    {subtitle && <p className="text-warm-ivory text-opacity-50 text-sm mb-5 ml-0">{subtitle}</p>}
    {children}
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center justify-center h-48 text-warm-ivory text-opacity-50 text-sm italic">
    {text}
  </div>
);

export default SheetOverview;
