import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  RefreshCw, TrendingUp, TrendingDown, Wallet, BedDouble, Utensils, Car,
  Users, CreditCard, Banknote, AlertCircle, Sparkles, Activity,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Tab = { name: string; values: string[][] };
type SheetPayload = { sheetId: string; fetchedAt: string; tabs: Tab[] };

// ---------- Parsing helpers ----------

const parseNum = (raw: unknown): number => {
  if (raw === null || raw === undefined) return 0;
  const s = String(raw).replace(/[₹,\s]/g, '').replace(/[^0-9.\-]/g, '');
  if (!s || s === '-' || s === '.') return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
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

    // ---- Room bookings aggregations ----
    const roomByMonth: Record<number, number> = {};
    let roomRevenue = 0;
    let totalBookings = 0;
    let totalGuests = 0;
    let totalNights = 0;
    let roomsSold = 0;
    let upiTotal = 0;
    let cashTotal = 0;
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
        if (month !== null) roomByMonth[month] = (roomByMonth[month] ?? 0) + amount;
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
        if (month !== null) driverByMonth[month] = (driverByMonth[month] ?? 0) + amount;
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
        if (month !== null) restaurantByMonth[month] = (restaurantByMonth[month] ?? 0) + amount;
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
    };
  }, [data]);

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
