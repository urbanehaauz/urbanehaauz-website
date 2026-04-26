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
      ticket_id,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !ticket_id) {
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
      console.error('Rangotsav payment signature verification failed for ticket:', ticket_id);
      return jsonError('Payment verification failed', 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Sanity-check: the order_id we stored must match (defends against ticket_id swap)
    const { data: ticketRow, error: fetchErr } = await admin
      .from('rangotsav_tickets')
      .select('id, ticket_code, razorpay_order_id, payment_status, quantity, total_amount, buyer_name, buyer_email')
      .eq('id', ticket_id)
      .single();

    if (fetchErr || !ticketRow) {
      console.error('Ticket lookup failed:', fetchErr);
      return jsonError('Ticket not found', 404);
    }

    if (ticketRow.razorpay_order_id && ticketRow.razorpay_order_id !== razorpay_order_id) {
      console.error('Order id mismatch for ticket', ticket_id);
      return jsonError('Order/ticket mismatch', 400);
    }

    // Idempotent: if already paid, just return success without rewriting
    if (ticketRow.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ success: true, ticket_code: ticketRow.ticket_code }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { error: updateErr } = await admin
      .from('rangotsav_tickets')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
        razorpay_order_id,
      })
      .eq('id', ticket_id);

    if (updateErr) {
      console.error('Failed to mark ticket paid:', updateErr);
      return jsonError('Failed to update ticket', 500);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket_code: ticketRow.ticket_code,
        quantity: ticketRow.quantity,
        total_amount: Number(ticketRow.total_amount),
        buyer_name: ticketRow.buyer_name,
        buyer_email: ticketRow.buyer_email,
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
