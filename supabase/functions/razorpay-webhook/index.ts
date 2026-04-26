import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// No CORS headers needed — this is called server-to-server by Razorpay, not by browser
async function verifyWebhookSignature(secret: string, rawBody: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return computedHex.length === signature.length &&
    computedHex.split('').every((c, i) => c === signature[i]);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET not set');
    return new Response('Not configured', { status: 500 });
  }

  // Must read raw body before JSON parsing for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  const isValid = await verifyWebhookSignature(webhookSecret, rawBody, signature);
  if (!isValid) {
    console.error('Webhook signature mismatch');
    return new Response('Unauthorized', { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const paymentEntity = event?.payload?.payment?.entity;
  const paymentId: string = paymentEntity?.id ?? '';
  const orderId: string = paymentEntity?.order_id ?? '';
  const notes: Record<string, string> = paymentEntity?.notes ?? {};

  if (!paymentId) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Route by notes.kind: Rangotsav tickets vs room bookings.
  if (notes?.kind === 'rangotsav') {
    const ticketId: string = notes?.ticket_id ?? '';
    if (!ticketId) {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    if (event.event === 'payment.captured') {
      await supabase
        .from('rangotsav_tickets')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId || undefined,
        })
        .eq('id', ticketId);
    } else if (event.event === 'payment.failed') {
      // Mark failed so reserve_rangotsav_tickets stops counting it against inventory.
      await supabase
        .from('rangotsav_tickets')
        .update({ payment_status: 'failed' })
        .eq('id', ticketId);
    }

    return new Response(JSON.stringify({ received: true, kind: 'rangotsav' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Default: room booking flow
  const bookingId: string = notes?.booking_id ?? '';
  if (!bookingId) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (event.event === 'payment.captured') {
    await supabase
      .from('bookings')
      .update({ status: 'Confirmed', payment_status: 'Paid', razorpay_payment_id: paymentId })
      .eq('id', bookingId);
  } else if (event.event === 'payment.failed') {
    // Reset to Pending so guest can retry
    await supabase
      .from('bookings')
      .update({ status: 'Pending', payment_status: 'Pending' })
      .eq('id', bookingId);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
