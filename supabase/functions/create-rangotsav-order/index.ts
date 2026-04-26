import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ReserveRow {
  ticket_id: string;
  ticket_code: string;
  remaining: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const quantity   = Number(body?.quantity);
    const buyerName  = String(body?.buyerName  ?? '').trim();
    const buyerEmail = String(body?.buyerEmail ?? '').trim().toLowerCase();
    const buyerPhone = String(body?.buyerPhone ?? '').trim();

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return jsonError('Quantity must be between 1 and 10', 400);
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

    // 1) Read current ticket price (server-authoritative — never trust client)
    const { data: priceRow, error: priceErr } = await admin
      .from('settings')
      .select('value')
      .eq('key', 'rangotsav_ticket_price')
      .single();

    if (priceErr || !priceRow?.value) {
      console.error('Failed to read rangotsav_ticket_price:', priceErr);
      return jsonError('Ticket pricing unavailable', 500);
    }

    const unitPrice = Number(priceRow.value);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return jsonError('Invalid ticket price configuration', 500);
    }

    const totalAmount = Math.round(unitPrice * quantity * 100) / 100;

    // 2) Atomic reservation — RPC handles SOLD_OUT and capacity locking
    const { data: reserveData, error: reserveErr } = await admin.rpc(
      'reserve_rangotsav_tickets',
      {
        p_quantity: quantity,
        p_buyer_name: buyerName,
        p_buyer_email: buyerEmail,
        p_buyer_phone: buyerPhone,
        p_unit_price: unitPrice,
        p_source: 'online',
        p_payment_method: 'razorpay',
      },
    );

    if (reserveErr) {
      const msg = reserveErr.message ?? '';
      if (msg.includes('SOLD_OUT')) {
        return new Response(
          JSON.stringify({ error: 'SOLD_OUT', message: msg }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      console.error('reserve_rangotsav_tickets failed:', reserveErr);
      return jsonError('Failed to reserve ticket', 500);
    }

    const row = (Array.isArray(reserveData) ? reserveData[0] : reserveData) as ReserveRow | undefined;
    if (!row?.ticket_id || !row?.ticket_code) {
      return jsonError('Reservation returned no ticket', 500);
    }

    // 3) Create Razorpay order — secret never leaves the server
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
        receipt: row.ticket_code,
        notes: {
          kind: 'rangotsav',
          ticket_id: row.ticket_id,
          ticket_code: row.ticket_code,
          quantity: String(quantity),
        },
      }),
    });

    if (!razorpayRes.ok) {
      const err = await razorpayRes.json().catch(() => ({}));
      console.error('Razorpay order creation failed:', err);

      // Roll the reservation back to 'failed' so it stops counting against inventory immediately.
      await admin
        .from('rangotsav_tickets')
        .update({ payment_status: 'failed' })
        .eq('id', row.ticket_id);

      return jsonError('Failed to create payment order', 502);
    }

    const order = await razorpayRes.json();

    // 4) Persist order_id back on the ticket row for reconciliation
    await admin
      .from('rangotsav_tickets')
      .update({ razorpay_order_id: order.id })
      .eq('id', row.ticket_id);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        ticket_id: row.ticket_id,
        ticket_code: row.ticket_code,
        amount: totalAmount,
        unit_price: unitPrice,
        quantity,
        remaining: row.remaining,
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
