import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type DaySelection = 'day_1' | 'day_2' | 'both';

interface CartItem {
  day_selection: DaySelection;
  quantity: number;
}

interface ReserveRow {
  ticket_id: string;
  ticket_code: string;
  day_selection: DaySelection;
  quantity: number;
  unit_price: number;
  total_amount: number;
  purchase_group_id: string;
  remaining_day_1: number;
  remaining_day_2: number;
}

const VALID_DAYS: DaySelection[] = ['day_1', 'day_2', 'both'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawItems = body?.items;
    const buyerName  = String(body?.buyerName  ?? '').trim();
    const buyerEmail = String(body?.buyerEmail ?? '').trim().toLowerCase();
    const buyerPhone = String(body?.buyerPhone ?? '').trim();

    // Validate items array
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 3) {
      return jsonError('Items must be a non-empty array of up to 3 line items', 400);
    }

    const items: CartItem[] = [];
    let totalQty = 0;
    const seenDays = new Set<DaySelection>();

    for (const raw of rawItems) {
      const day = raw?.day_selection;
      const qty = Number(raw?.quantity);
      if (!VALID_DAYS.includes(day)) {
        return jsonError(`Invalid day_selection: ${day}`, 400);
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        return jsonError('Each item quantity must be 1-10', 400);
      }
      if (seenDays.has(day)) {
        return jsonError(`Duplicate day_selection in items: ${day}`, 400);
      }
      seenDays.add(day);
      totalQty += qty;
      items.push({ day_selection: day, quantity: qty });
    }
    if (totalQty < 1 || totalQty > 10) {
      return jsonError('Total quantity across all line items must be 1-10', 400);
    }

    if (!buyerName || buyerName.length < 2 || buyerName.length > 100) {
      return jsonError('Invalid buyer name', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      return jsonError('Invalid buyer email', 400);
    }
    if (buyerPhone.replace(/\D/g, '').length < 10) {
      return jsonError('Invalid buyer phone', 400);
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      return jsonError('Razorpay not configured', 500);
    }

    // Service-role client for server-side writes (bypasses RLS).
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1) Read current pricing — server-authoritative, never trust the client.
    //    Two keys: per-day price (₹100) and the discounted both-days bundle (₹175).
    const { data: priceRows, error: priceErr } = await admin
      .from('settings')
      .select('key, value')
      .in('key', ['rangotsav_ticket_price', 'rangotsav_both_days_price']);

    if (priceErr || !priceRows || priceRows.length === 0) {
      console.error('Failed to read rangotsav pricing:', priceErr);
      return jsonError('Ticket pricing unavailable', 500);
    }

    const priceMap = Object.fromEntries(priceRows.map((r) => [r.key, r.value]));
    const unitPrice = Number(priceMap['rangotsav_ticket_price']);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return jsonError('Invalid ticket price configuration', 500);
    }
    // Bundle price falls back to 2× single-day if not configured (defensive).
    const rawBundle = priceMap['rangotsav_both_days_price'];
    const bothDaysPrice = rawBundle != null && Number.isFinite(Number(rawBundle)) && Number(rawBundle) > 0
      ? Number(rawBundle)
      : unitPrice * 2;

    // 2) Atomic reservation — RPC handles per-day SOLD_OUT and capacity locking
    const { data: reserveData, error: reserveErr } = await admin.rpc(
      'reserve_rangotsav_tickets',
      {
        p_items: items, // JSONB-coerced server-side
        p_buyer_name: buyerName,
        p_buyer_email: buyerEmail,
        p_buyer_phone: buyerPhone,
        p_unit_price: unitPrice,
        p_both_days_price: bothDaysPrice,
        p_source: 'online',
        p_payment_method: 'razorpay',
      },
    );

    if (reserveErr) {
      const msg = reserveErr.message ?? '';
      if (msg.includes('SOLD_OUT_DAY_1')) {
        return new Response(
          JSON.stringify({ error: 'SOLD_OUT_DAY_1', message: msg }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (msg.includes('SOLD_OUT_DAY_2')) {
        return new Response(
          JSON.stringify({ error: 'SOLD_OUT_DAY_2', message: msg }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      console.error('reserve_rangotsav_tickets failed:', reserveErr);
      return jsonError('Failed to reserve tickets', 500);
    }

    const rows = (Array.isArray(reserveData) ? reserveData : [reserveData]) as ReserveRow[];
    if (!rows.length || !rows[0]?.purchase_group_id) {
      return jsonError('Reservation returned no rows', 500);
    }

    const groupId = rows[0].purchase_group_id;
    const totalAmount =
      Math.round(rows.reduce((sum, r) => sum + Number(r.total_amount), 0) * 100) / 100;

    // 3) Create one Razorpay order for the full checkout — secret never leaves the server
    const credentials = btoa(`${keyId}:${keySecret}`);
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(totalAmount * 100), // paise
        currency: 'INR',
        receipt: `RANG-${groupId.slice(0, 8)}`,
        notes: {
          kind: 'rangotsav',
          purchase_group_id: groupId,
          ticket_count: String(rows.length),
          total_qty: String(totalQty),
        },
      }),
    });

    if (!razorpayRes.ok) {
      const err = await razorpayRes.json().catch(() => ({}));
      console.error('Razorpay order creation failed:', err);

      // Roll all sibling rows back to 'failed' so they stop counting against inventory immediately.
      await admin
        .from('rangotsav_tickets')
        .update({ payment_status: 'failed' })
        .eq('purchase_group_id', groupId);

      return jsonError('Failed to create payment order', 502);
    }

    const order = await razorpayRes.json();

    // 4) Persist order_id back on every row in the group for reconciliation
    await admin
      .from('rangotsav_tickets')
      .update({ razorpay_order_id: order.id })
      .eq('purchase_group_id', groupId);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        purchase_group_id: groupId,
        items: rows.map((r) => ({
          ticket_id: r.ticket_id,
          ticket_code: r.ticket_code,
          day_selection: r.day_selection,
          quantity: r.quantity,
          unit_price: Number(r.unit_price),
          total_amount: Number(r.total_amount),
        })),
        amount: totalAmount,
        unit_price: unitPrice,
        both_days_price: bothDaysPrice,
        remaining_day_1: rows[0].remaining_day_1,
        remaining_day_2: rows[0].remaining_day_2,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('create-rangotsav-order error:', error);
    return jsonError('Internal server error', 500);
  }
});

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
