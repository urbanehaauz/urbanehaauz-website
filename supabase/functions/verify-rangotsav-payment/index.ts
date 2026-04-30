import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function verifyHmac(secret: string, data: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const computedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return computedHex.length === signature.length &&
    computedHex.split('').every((c, i) => c === signature[i]);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      purchase_group_id,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !purchase_group_id) {
      return jsonError('Missing required fields', 400);
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      return jsonError('Razorpay not configured', 500);
    }

    // Razorpay signature: HMAC-SHA256(order_id + '|' + payment_id, key_secret)
    const signedData = `${razorpay_order_id}|${razorpay_payment_id}`;
    const isValid = await verifyHmac(keySecret, signedData, razorpay_signature);

    if (!isValid) {
      console.error('Rangotsav payment signature verification failed for group:', purchase_group_id);
      return jsonError('Payment verification failed', 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch all sibling rows in the purchase group. The order_id match defends
    // against group_id swap; both must align with what we saved on creation.
    const { data: rows, error: fetchErr } = await admin
      .from('rangotsav_tickets')
      .select('id, ticket_code, day_selection, quantity, unit_price, total_amount, razorpay_order_id, payment_status, buyer_name, buyer_email')
      .eq('purchase_group_id', purchase_group_id)
      .eq('razorpay_order_id', razorpay_order_id);

    if (fetchErr) {
      console.error('Group lookup failed:', fetchErr);
      return jsonError('Lookup failed', 500);
    }
    if (!rows || rows.length === 0) {
      return jsonError('Tickets not found for this order', 404);
    }

    // Idempotent: if all rows are already paid, just return success without rewriting
    const allPaid = rows.every((r) => r.payment_status === 'paid');

    if (!allPaid) {
      const { error: updateErr } = await admin
        .from('rangotsav_tickets')
        .update({
          payment_status: 'paid',
          razorpay_payment_id,
        })
        .eq('purchase_group_id', purchase_group_id)
        .eq('razorpay_order_id', razorpay_order_id);

      if (updateErr) {
        console.error('Failed to mark group paid:', updateErr);
        return jsonError('Failed to update tickets', 500);
      }
    }

    const totalAmount = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);

    return new Response(
      JSON.stringify({
        success: true,
        purchase_group_id,
        items: rows.map((r) => ({
          ticket_id: r.id,
          ticket_code: r.ticket_code,
          day_selection: r.day_selection,
          quantity: r.quantity,
          unit_price: Number(r.unit_price),
          total_amount: Number(r.total_amount),
        })),
        total_amount: Math.round(totalAmount * 100) / 100,
        buyer_name: rows[0].buyer_name,
        buyer_email: rows[0].buyer_email,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('verify-rangotsav-payment error:', error);
    return jsonError('Internal server error', 500);
  }
});

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
