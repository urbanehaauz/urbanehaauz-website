import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * OTA Booking Webhook
 *
 * Receives incoming bookings from a channel manager (ezee Centrix, DJUBO, Staah, etc.)
 * and inserts them into the Supabase bookings table with source='OTA'.
 *
 * Give this URL to your channel manager:
 *   https://<project-ref>.supabase.co/functions/v1/ota-booking-webhook
 *
 * They must send the header: x-ota-secret: <your OTA_WEBHOOK_SECRET>
 *
 * Expected JSON payload:
 * {
 *   "reservation_id": "RES-12345",     // Channel manager's reservation ID
 *   "channel_name": "MakeMyTrip",      // OTA platform name
 *   "guest_name": "Rahul Sharma",
 *   "guest_email": "rahul@example.com",
 *   "guest_phone": "+919876543210",
 *   "room_type_name": "Cloud Mist Deluxe",
 *   "arrival_date": "2026-04-01",      // YYYY-MM-DD
 *   "departure_date": "2026-04-05",    // YYYY-MM-DD
 *   "total_amount": 20000,             // In INR
 *   "action": "new" | "cancel"         // Optional: "cancel" to cancel an existing booking
 * }
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  // Authenticate the channel manager
  const otaSecret = Deno.env.get('OTA_WEBHOOK_SECRET');
  const incomingSecret = req.headers.get('x-ota-secret');

  if (!otaSecret || incomingSecret !== otaSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const {
      reservation_id,
      channel_name,
      guest_name,
      guest_email,
      guest_phone,
      room_type_name,
      arrival_date,
      departure_date,
      total_amount,
      action = 'new',
    } = payload;

    // Validate required fields
    if (!reservation_id || !guest_name || !room_type_name || !arrival_date || !departure_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const bookingId = `OTA-${reservation_id}`;

    if (action === 'cancel') {
      // Handle cancellation from OTA
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'Cancelled', payment_status: 'Refunded' })
        .eq('id', bookingId);

      if (error) {
        console.error('Failed to cancel OTA booking:', error);
        return new Response(JSON.stringify({ error: 'Failed to cancel booking' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, booking_id: bookingId, action: 'cancelled' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert new OTA booking
    const { error } = await supabase.from('bookings').insert({
      id: bookingId,
      guest_name,
      email: guest_email ?? null,
      phone: guest_phone ?? null,
      room_name: room_type_name,
      check_in: arrival_date,
      check_out: departure_date,
      total_amount: total_amount ?? 0,
      status: 'Confirmed',         // OTA bookings arrive pre-confirmed
      payment_status: 'Paid',      // OTA collects payment; hotel receives net rate
      source: 'OTA',
      ota_platform: channel_name ?? null,
    });

    if (error) {
      // Handle duplicate reservation gracefully
      if (error.code === '23505') {
        return new Response(JSON.stringify({ success: true, booking_id: bookingId, note: 'Already exists' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('Failed to insert OTA booking:', error);
      return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, booking_id: bookingId }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ota-booking-webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
