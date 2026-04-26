/**
 * Email Service
 *
 * Sends go through the `send-email` Supabase Edge Function, which holds
 * the Resend API key server-side. Deploy with `supabase functions deploy
 * send-email` and set the secret via `supabase secrets set RESEND_API_KEY=...`.
 */

import { supabase } from '../supabase';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface BookingEmailData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paymentStatus: string;
}

async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });

    if (error) {
      console.error('send-email invoke error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      console.error('send-email function error:', data.error);
      return { success: false, error: data.error };
    }

    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Log email to database
async function logEmail(
  recipientEmail: string,
  recipientName: string,
  emailType: string,
  subject: string,
  bookingId: string | null,
  status: 'sent' | 'failed',
  resendId?: string,
  errorMessage?: string
) {
  try {
    await supabase.from('email_logs').insert({
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      email_type: emailType,
      subject: subject,
      booking_id: bookingId,
      status: status,
      resend_id: resendId,
      error_message: errorMessage,
    });
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

// ============================================
// Email Templates
// ============================================

function getBookingConfirmationHTML(data: BookingEmailData): string {
  const checkInDate = new Date(data.checkIn).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const checkOutDate = new Date(data.checkOut).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a4d1a 0%, #2d5a2d 100%); padding: 30px; text-align: center;">
              <img src="https://urbanehaauz.com/logo-uh.png" alt="Urbane Haauz" width="72" height="72" style="display: inline-block; width: 72px; height: 72px; background-color: #ffffff; border-radius: 50%; padding: 6px; border: 0; outline: none; text-decoration: none; margin-bottom: 14px;">
              <h1 style="color: #c9a84c; margin: 0; font-size: 28px; font-weight: bold;">URBANE HAAUZ</h1>
              <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px; letter-spacing: 2px;">PELLING, SIKKIM</p>
            </td>
          </tr>

          <!-- Hero banner -->
          <tr>
            <td style="padding: 0; font-size: 0; line-height: 0;">
              <img src="https://urbanehaauz.com/artists/artwork-sunset.jpg" alt="Pelling, West Sikkim" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;">
            </td>
          </tr>

          <!-- Confirmation Badge -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #e8f5e9; border-radius: 50px; padding: 12px 24px;">
                <span style="color: #2e7d32; font-weight: bold; font-size: 16px;">✓ Booking Confirmed</span>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px;">
              <h2 style="color: #333; margin: 0 0 10px; font-size: 22px;">Hello ${data.guestName}!</h2>
              <p style="color: #666; margin: 0; font-size: 15px; line-height: 1.6;">
                Thank you for choosing Urbane Haauz. Your booking has been confirmed and we're excited to host you!
              </p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 30px 40px;">
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #c9a84c;">
                <h3 style="color: #333; margin: 0 0 20px; font-size: 18px;">Booking Details</h3>

                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #888; font-size: 14px; width: 40%;">Booking ID</td>
                    <td style="color: #333; font-weight: bold; font-size: 14px;">${data.bookingId}</td>
                  </tr>
                  <tr>
                    <td style="color: #888; font-size: 14px;">Room</td>
                    <td style="color: #333; font-weight: bold; font-size: 14px;">${data.roomName}</td>
                  </tr>
                  <tr>
                    <td style="color: #888; font-size: 14px;">Check-in</td>
                    <td style="color: #333; font-weight: bold; font-size: 14px;">${checkInDate}<br><span style="color: #666; font-weight: normal; font-size: 12px;">From 2:00 PM</span></td>
                  </tr>
                  <tr>
                    <td style="color: #888; font-size: 14px;">Check-out</td>
                    <td style="color: #333; font-weight: bold; font-size: 14px;">${checkOutDate}<br><span style="color: #666; font-weight: normal; font-size: 12px;">By 11:00 AM</span></td>
                  </tr>
                  <tr>
                    <td style="color: #888; font-size: 14px;">Guests</td>
                    <td style="color: #333; font-weight: bold; font-size: 14px;">${data.guests} Guest${data.guests > 1 ? 's' : ''}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top: 1px dashed #ddd; padding-top: 15px;"></td>
                  </tr>
                  <tr>
                    <td style="color: #888; font-size: 14px;">Total Amount</td>
                    <td style="color: #1a4d1a; font-weight: bold; font-size: 20px;">₹${data.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="color: #888; font-size: 14px;">Payment Status</td>
                    <td style="font-size: 14px;">
                      <span style="background-color: ${data.paymentStatus === 'Paid' ? '#e8f5e9' : '#fff3e0'}; color: ${data.paymentStatus === 'Paid' ? '#2e7d32' : '#e65100'}; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
                        ${data.paymentStatus}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Important Info -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h3 style="color: #333; margin: 0 0 15px; font-size: 16px;">Important Information</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                <li>Please carry a valid government ID for check-in</li>
                <li>Free cancellation available up to 48 hours before check-in</li>
                <li>Early check-in and late check-out subject to availability</li>
                <li>Contact us for any special requests or arrangements</li>
              </ul>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #1a4d1a; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">Need assistance? We're here to help!</p>
                <p style="margin: 0;">
                  <a href="tel:+919136032524" style="color: #c9a84c; text-decoration: none; font-weight: bold;">📞 +91 9136032524</a>
                  <span style="color: #ffffff; margin: 0 10px;">|</span>
                  <a href="https://wa.me/919136032524" style="color: #c9a84c; text-decoration: none; font-weight: bold;">💬 WhatsApp</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; margin: 0 0 10px; font-size: 13px;">
                SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113
              </p>
              <p style="color: #888; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Urbane Haauz. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getBookingCancellationHTML(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancellation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a4d1a 0%, #2d5a2d 100%); padding: 30px; text-align: center;">
              <img src="https://urbanehaauz.com/logo-uh.png" alt="Urbane Haauz" width="72" height="72" style="display: inline-block; width: 72px; height: 72px; background-color: #ffffff; border-radius: 50%; padding: 6px; border: 0; outline: none; text-decoration: none; margin-bottom: 14px;">
              <h1 style="color: #c9a84c; margin: 0; font-size: 28px; font-weight: bold;">URBANE HAAUZ</h1>
              <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px; letter-spacing: 2px;">PELLING, SIKKIM</p>
            </td>
          </tr>

          <!-- Cancellation Badge -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #ffebee; border-radius: 50px; padding: 12px 24px;">
                <span style="color: #c62828; font-weight: bold; font-size: 16px;">Booking Cancelled</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="color: #333; margin: 0 0 10px; font-size: 22px;">Hello ${data.guestName},</h2>
              <p style="color: #666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
                Your booking (ID: <strong>${data.bookingId}</strong>) has been cancelled as requested.
              </p>

              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                  <strong>Room:</strong> ${data.roomName}<br>
                  <strong>Original Dates:</strong> ${new Date(data.checkIn).toLocaleDateString('en-IN')} - ${new Date(data.checkOut).toLocaleDateString('en-IN')}<br>
                  <strong>Amount:</strong> ₹${data.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              ${data.paymentStatus === 'Paid' ? `
              <div style="background-color: #e8f5e9; border-radius: 8px; padding: 20px;">
                <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                  <strong>Refund Information:</strong><br>
                  Your refund of ₹${data.totalAmount.toLocaleString('en-IN')} will be processed within 5-7 business days to your original payment method.
                </p>
              </div>
              ` : ''}

              <p style="color: #666; margin: 20px 0 0; font-size: 14px; line-height: 1.6;">
                We hope to welcome you at Urbane Haauz in the future. If you have any questions, please don't hesitate to contact us.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; margin: 0 0 10px; font-size: 13px;">
                📞 +91 9136032524 | 💬 WhatsApp Us
              </p>
              <p style="color: #888; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Urbane Haauz. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================
// Public API
// ============================================

export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  const subject = `Booking Confirmed - ${data.bookingId} | Urbane Haauz`;
  const html = getBookingConfirmationHTML(data);

  const result = await sendEmail({
    to: data.guestEmail,
    subject,
    html,
  });

  await logEmail(
    data.guestEmail,
    data.guestName,
    'booking_confirmation',
    subject,
    data.bookingId,
    result.success ? 'sent' : 'failed',
    result.id,
    result.error
  );

  return result.success;
}

export async function sendBookingCancellation(data: BookingEmailData): Promise<boolean> {
  const subject = `Booking Cancelled - ${data.bookingId} | Urbane Haauz`;
  const html = getBookingCancellationHTML(data);

  const result = await sendEmail({
    to: data.guestEmail,
    subject,
    html,
  });

  await logEmail(
    data.guestEmail,
    data.guestName,
    'booking_cancellation',
    subject,
    data.bookingId,
    result.success ? 'sent' : 'failed',
    result.id,
    result.error
  );

  return result.success;
}

export async function sendRangotsavNotifyConfirmation(email: string): Promise<boolean> {
  const subject = "You're on the list — Rangotsav 2026, Pelling";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rangotsav — You're on the list</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #1C1C1C;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border: 1px solid rgba(212,165,116,0.2); border-radius: 4px; overflow: hidden;">

          <!-- Brand bar -->
          <tr>
            <td style="background-color: #FAF7F2; padding: 28px 40px 10px; text-align: center;">
              <img src="https://urbanehaauz.com/logo-uh.png" alt="Urbane Haauz" width="56" height="56" style="display: inline-block; width: 56px; height: 56px; border: 0; outline: none; text-decoration: none;">
              <p style="color: #1C1C1C; margin: 10px 0 0; font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700;">Urbane Haauz &middot; Pelling, Sikkim</p>
            </td>
          </tr>

          <!-- Framed Ganesh hero -->
          <tr>
            <td style="background-color: #FAF7F2; padding: 18px 40px 40px; text-align: center;">
              <p style="color: #A67833; margin: 0 0 14px; font-size: 14px; letter-spacing: 0.4em; font-family: Georgia, 'Times New Roman', serif;">&#10038; &middot; &#10038;</p>
              <p style="color: #A67833; margin: 0 0 22px; font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700;">Shubh Aarambh</p>
              <img src="https://urbanehaauz.com/rangotsav-ganesh.jpeg" alt="Rangotsav 2026 — a cultural conglomerate in the mountains" width="380" style="display: block; width: 100%; max-width: 380px; height: auto; border: 3px solid #D4A574; box-shadow: 0 4px 16px rgba(28,28,28,0.15); margin: 0 auto; outline: none; text-decoration: none;">
              <p style="color: #8B6F47; margin: 22px 0 0; font-size: 12px; letter-spacing: 0.18em; font-family: Georgia, 'Times New Roman', serif; font-style: italic;">A blessing on the festival to come</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1C1C1C; padding: 0; font-size: 0; line-height: 0;">
              <div style="height: 3px; background-color: #D4A574;"></div>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid rgba(212,165,116,0.15);">
              <p style="color: #D4A574; margin: 0 0 18px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif;">A Cultural Conglomerate</p>
              <h1 style="color: #FAF7F2; margin: 0; font-size: 44px; font-weight: 700; letter-spacing: -0.02em; line-height: 1;">Rangotsav</h1>
              <p style="color: #D4A574; margin: 18px 0 0; font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">&mdash; The Tale Of Two States &mdash;</p>
            </td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td style="padding: 40px 40px 8px; text-align: center;">
              <p style="color: #D4A574; margin: 0 0 18px; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif;">You're on the list</p>
              <h2 style="color: #FAF7F2; margin: 0 0 20px; font-size: 28px; font-weight: 400; font-style: italic; line-height: 1.3;">
                We'll tell you first, when the doors open.
              </h2>
              <p style="color: rgba(250,247,242,0.65); margin: 0; font-size: 15px; line-height: 1.7; font-family: Georgia, serif;">
                Art is in the Air. Music is in the Mist. Flavours on your Plate.<br>
                From Bengal's soul to Sikkim's spirit &mdash; a cultural confluence in the mountains.
              </p>
            </td>
          </tr>

          <!-- Event card -->
          <tr>
            <td style="padding: 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(212,165,116,0.05); border: 1px solid rgba(212,165,116,0.25); border-radius: 12px;">
                <tr>
                  <td style="padding: 28px 28px 12px; text-align: center;">
                    <p style="color: #D4A574; margin: 0 0 8px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif;">Save the Date</p>
                    <p style="color: #FAF7F2; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.05em;">25&ndash;26 MAY 2026</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 28px 28px; text-align: center;">
                    <p style="color: rgba(250,247,242,0.6); margin: 0; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif;">Pelling &middot; West Sikkim</p>
                    <p style="color: rgba(250,247,242,0.4); margin: 10px 0 0; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; font-family: Arial, sans-serif;">Hosted by Urbane Haauz</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's next -->
          <tr>
            <td style="padding: 8px 40px 32px;">
              <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">What happens next</h3>
              <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
                When registration opens, you'll be the first to know &mdash; a single email to this address, with the link to book your tier.
              </p>
              <p style="color: rgba(250,247,242,0.55); margin: 0; font-size: 13px; line-height: 1.7; font-family: Georgia, serif; font-style: italic;">
                No spam. No physical tickets. Email confirmation only.
              </p>
            </td>
          </tr>

          <!-- Divider + sign-off -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <div style="height: 1px; background-color: rgba(212,165,116,0.2); margin: 0 auto 24px;"></div>
              <p style="color: rgba(250,247,242,0.6); margin: 0; font-size: 13px; line-height: 1.8; font-family: Georgia, serif; font-style: italic;">
                Until then, we're building something we can't wait for you to walk into.
              </p>
              <p style="color: #D4A574; margin: 14px 0 0; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif;">&mdash; Team Urbane Haauz</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #141414; padding: 24px 40px; text-align: center; border-top: 1px solid rgba(212,165,116,0.1);">
              <p style="color: rgba(250,247,242,0.4); margin: 0 0 6px; font-size: 11px; font-family: Arial, sans-serif;">
                Urbane Haauz &middot; SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113
              </p>
              <p style="color: rgba(250,247,242,0.35); margin: 0; font-size: 11px; font-family: Arial, sans-serif;">
                <a href="tel:+919136032524" style="color: #D4A574; text-decoration: none;">+91 91360 32524</a>
                &nbsp;&middot;&nbsp;
                <a href="https://urbanehaauz.com" style="color: #D4A574; text-decoration: none;">urbanehaauz.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const result = await sendEmail({ to: email, subject, html });

  await logEmail(
    email,
    '',
    'rangotsav_notify',
    subject,
    null,
    result.success ? 'sent' : 'failed',
    result.id,
    result.error
  );

  return result.success;
}

export async function sendRangotsavVendorWelcome(data: {
  name: string;
  email: string;
  whatSelling: string;
}): Promise<boolean> {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const name = esc(data.name);
  const whatSelling = esc(data.whatSelling).replace(/\n/g, '<br>');

  const subject = 'Application Received — Rangotsav 2026 Food Vendor';
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rangotsav — Vendor Application Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #1C1C1C;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border: 1px solid rgba(212,165,116,0.2); border-radius: 4px; overflow: hidden;">

          <!-- Brand bar -->
          <tr>
            <td style="background-color: #FAF7F2; padding: 28px 40px 10px; text-align: center;">
              <img src="https://urbanehaauz.com/logo-uh.png" alt="Urbane Haauz" width="56" height="56" style="display: inline-block; width: 56px; height: 56px; border: 0; outline: none; text-decoration: none;">
              <p style="color: #1C1C1C; margin: 10px 0 0; font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700;">Urbane Haauz &middot; Pelling, Sikkim</p>
            </td>
          </tr>

          <!-- Framed Ganesh hero -->
          <tr>
            <td style="background-color: #FAF7F2; padding: 18px 40px 40px; text-align: center;">
              <p style="color: #A67833; margin: 0 0 14px; font-size: 14px; letter-spacing: 0.4em; font-family: Georgia, 'Times New Roman', serif;">&#10038; &middot; &#10038;</p>
              <p style="color: #A67833; margin: 0 0 22px; font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700;">Shubh Aarambh</p>
              <img src="https://urbanehaauz.com/rangotsav-ganesh.jpeg" alt="Rangotsav 2026" width="380" style="display: block; width: 100%; max-width: 380px; height: auto; border: 3px solid #D4A574; box-shadow: 0 4px 16px rgba(28,28,28,0.15); margin: 0 auto; outline: none; text-decoration: none;">
              <p style="color: #8B6F47; margin: 22px 0 0; font-size: 12px; letter-spacing: 0.18em; font-family: Georgia, 'Times New Roman', serif; font-style: italic;">A blessing on the festival to come</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1C1C1C; padding: 0; font-size: 0; line-height: 0;">
              <div style="height: 3px; background-color: #D4A574;"></div>
            </td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid rgba(212,165,116,0.15);">
              <p style="color: #D4A574; margin: 0 0 18px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif;">A Cultural Conglomerate</p>
              <h1 style="color: #FAF7F2; margin: 0; font-size: 44px; font-weight: 700; letter-spacing: -0.02em; line-height: 1;">Rangotsav</h1>
              <p style="color: #D4A574; margin: 18px 0 0; font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">&mdash; 25&ndash;26 May 2026 &middot; Pelling &mdash;</p>
            </td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td style="padding: 40px 40px 8px; text-align: center;">
              <p style="color: #D4A574; margin: 0 0 18px; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif;">Application Received</p>
              <h2 style="color: #FAF7F2; margin: 0 0 20px; font-size: 26px; font-weight: 400; font-style: italic; line-height: 1.3;">
                Thank you for stepping forward, ${name}.
              </h2>
              <p style="color: rgba(250,247,242,0.65); margin: 0; font-size: 15px; line-height: 1.7; font-family: Georgia, serif;">
                Your food vendor application for Rangotsav 2026 has reached us. Our team will review your offering and respond within 7 business days.
              </p>
            </td>
          </tr>

          <!-- Submission recap -->
          <tr>
            <td style="padding: 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(212,165,116,0.05); border: 1px solid rgba(212,165,116,0.25); border-radius: 12px;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <p style="color: #D4A574; margin: 0 0 14px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif;">Your Submission</p>
                    <p style="color: rgba(250,247,242,0.55); margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Business / Name</p>
                    <p style="color: #FAF7F2; margin: 0 0 16px; font-size: 15px; font-family: Georgia, serif;">${name}</p>
                    <p style="color: rgba(250,247,242,0.55); margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">What You'll Be Selling</p>
                    <p style="color: #FAF7F2; margin: 0; font-size: 15px; line-height: 1.6; font-family: Georgia, serif;">${whatSelling}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Policy -->
          <tr>
            <td style="padding: 8px 40px 0;">
              <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">Before you commit stock</h3>
              <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
                Participation is subject to review. Only confirmed vendors receive a final invitation to trade at Rangotsav &mdash; please don't commit supplies or staff until you hear back from us.
              </p>
              <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
                A commission on on-site sales may apply for confirmed vendors. Complete terms &mdash; including the commission percentage and settlement schedule &mdash; will be shared with your participation agreement once we've confirmed your slot.
              </p>
              <p style="color: rgba(250,247,242,0.75); margin: 0; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
                Priority goes to Pelling and surrounding community kitchens that reflect the food heritage of Sikkim and Bengal. We welcome authenticity over scale.
              </p>
            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">What happens next</h3>
              <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
                We'll review your application and get back to you within 7 business days. If confirmed, you'll receive a participation agreement and logistics brief at this email address.
              </p>
              <p style="color: rgba(250,247,242,0.55); margin: 0; font-size: 13px; line-height: 1.7; font-family: Georgia, serif; font-style: italic;">
                Reply to this email if you'd like to add anything to your application.
              </p>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding: 32px 40px 32px; text-align: center;">
              <div style="height: 1px; background-color: rgba(212,165,116,0.2); margin: 0 auto 24px;"></div>
              <p style="color: rgba(250,247,242,0.6); margin: 0; font-size: 13px; line-height: 1.8; font-family: Georgia, serif; font-style: italic;">
                Thank you for wanting to feed our festival.
              </p>
              <p style="color: #D4A574; margin: 14px 0 0; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif;">&mdash; Team Urbane Haauz</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #141414; padding: 24px 40px; text-align: center; border-top: 1px solid rgba(212,165,116,0.1);">
              <p style="color: rgba(250,247,242,0.4); margin: 0 0 6px; font-size: 11px; font-family: Arial, sans-serif;">
                Urbane Haauz &middot; SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113
              </p>
              <p style="color: rgba(250,247,242,0.35); margin: 0; font-size: 11px; font-family: Arial, sans-serif;">
                <a href="tel:+919136032524" style="color: #D4A574; text-decoration: none;">+91 91360 32524</a>
                &nbsp;&middot;&nbsp;
                <a href="https://urbanehaauz.com" style="color: #D4A574; text-decoration: none;">urbanehaauz.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const result = await sendEmail({ to: data.email, subject, html });

  await logEmail(
    data.email,
    data.name,
    'rangotsav_vendor_welcome',
    subject,
    null,
    result.success ? 'sent' : 'failed',
    result.id,
    result.error
  );

  return result.success;
}

function rangotsavShellHtml(args: {
  title: string;
  eyebrow: string;
  heading: string;
  lead: string;
  bodyBlocks: string;
  signOff: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${args.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #1C1C1C;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border: 1px solid rgba(212,165,116,0.2); border-radius: 4px; overflow: hidden;">
          <tr>
            <td style="background-color: #FAF7F2; padding: 28px 40px 10px; text-align: center;">
              <img src="https://urbanehaauz.com/logo-uh.png" alt="Urbane Haauz" width="56" height="56" style="display: inline-block; width: 56px; height: 56px; border: 0; outline: none; text-decoration: none;">
              <p style="color: #1C1C1C; margin: 10px 0 0; font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700;">Urbane Haauz &middot; Pelling, Sikkim</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #FAF7F2; padding: 18px 40px 40px; text-align: center;">
              <p style="color: #A67833; margin: 0 0 14px; font-size: 14px; letter-spacing: 0.4em; font-family: Georgia, 'Times New Roman', serif;">&#10038; &middot; &#10038;</p>
              <p style="color: #A67833; margin: 0 0 22px; font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700;">Shubh Aarambh</p>
              <img src="https://urbanehaauz.com/rangotsav-ganesh.jpeg" alt="Rangotsav 2026 — a cultural conglomerate in the mountains" width="380" style="display: block; width: 100%; max-width: 380px; height: auto; border: 3px solid #D4A574; box-shadow: 0 4px 16px rgba(28,28,28,0.15); margin: 0 auto; outline: none; text-decoration: none;">
              <p style="color: #8B6F47; margin: 22px 0 0; font-size: 12px; letter-spacing: 0.18em; font-family: Georgia, 'Times New Roman', serif; font-style: italic;">A blessing on the festival to come</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1C1C1C; padding: 0; font-size: 0; line-height: 0;">
              <div style="height: 3px; background-color: #D4A574;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid rgba(212,165,116,0.15);">
              <p style="color: #D4A574; margin: 0 0 18px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif;">A Cultural Conglomerate</p>
              <h1 style="color: #FAF7F2; margin: 0; font-size: 44px; font-weight: 700; letter-spacing: -0.02em; line-height: 1;">Rangotsav</h1>
              <p style="color: #D4A574; margin: 18px 0 0; font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">&mdash; 25&ndash;26 May 2026 &middot; Pelling &mdash;</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 8px; text-align: center;">
              <p style="color: #D4A574; margin: 0 0 18px; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif;">${args.eyebrow}</p>
              <h2 style="color: #FAF7F2; margin: 0 0 20px; font-size: 26px; font-weight: 400; font-style: italic; line-height: 1.3;">${args.heading}</h2>
              <p style="color: rgba(250,247,242,0.65); margin: 0; font-size: 15px; line-height: 1.7; font-family: Georgia, serif;">${args.lead}</p>
            </td>
          </tr>
          ${args.bodyBlocks}
          <tr>
            <td style="padding: 32px 40px 32px; text-align: center;">
              <div style="height: 1px; background-color: rgba(212,165,116,0.2); margin: 0 auto 24px;"></div>
              <p style="color: rgba(250,247,242,0.6); margin: 0; font-size: 13px; line-height: 1.8; font-family: Georgia, serif; font-style: italic;">${args.signOff}</p>
              <p style="color: #D4A574; margin: 14px 0 0; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif;">&mdash; Team Urbane Haauz</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #141414; padding: 24px 40px; text-align: center; border-top: 1px solid rgba(212,165,116,0.1);">
              <p style="color: rgba(250,247,242,0.4); margin: 0 0 6px; font-size: 11px; font-family: Arial, sans-serif;">
                Urbane Haauz &middot; SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113
              </p>
              <p style="color: rgba(250,247,242,0.35); margin: 0; font-size: 11px; font-family: Arial, sans-serif;">
                <a href="tel:+919136032524" style="color: #D4A574; text-decoration: none;">+91 91360 32524</a>
                &nbsp;&middot;&nbsp;
                <a href="https://urbanehaauz.com" style="color: #D4A574; text-decoration: none;">urbanehaauz.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function sendRangotsavVolunteerWelcome(data: {
  name: string;
  email: string;
  skills: string;
}): Promise<boolean> {
  const name = escHtml(data.name);
  const skills = escHtml(data.skills).replace(/\n/g, '<br>');
  const subject = 'Volunteer sign-up received — Rangotsav 2026';

  const bodyBlocks = `
    <tr>
      <td style="padding: 32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(212,165,116,0.05); border: 1px solid rgba(212,165,116,0.25); border-radius: 12px;">
          <tr>
            <td style="padding: 24px 28px;">
              <p style="color: #D4A574; margin: 0 0 14px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif;">Your Signup</p>
              <p style="color: rgba(250,247,242,0.55); margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Name</p>
              <p style="color: #FAF7F2; margin: 0 0 16px; font-size: 15px; font-family: Georgia, serif;">${name}</p>
              <p style="color: rgba(250,247,242,0.55); margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">How you'd like to help</p>
              <p style="color: #FAF7F2; margin: 0; font-size: 15px; line-height: 1.6; font-family: Georgia, serif;">${skills}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 40px 0;">
        <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">What happens next</h3>
        <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          We'll match you to a team &mdash; hospitality, stage &amp; logistics, food stalls, social &amp; content, or on-ground coordination &mdash; and send a volunteer brief with call times, travel guidance, and festival day-of kit details a few weeks before the event.
        </p>
        <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          Volunteers receive festival meals, a Rangotsav crew lanyard, and the front-row view of every performance. Travel and accommodation are self-arranged; we can suggest homestay options in Pelling if you're coming in from Bengal.
        </p>
        <p style="color: rgba(250,247,242,0.55); margin: 0 0 12px; font-size: 13px; line-height: 1.7; font-family: Georgia, serif; font-style: italic;">
          Reply to this email if you have questions or want to add to your signup.
        </p>
      </td>
    </tr>
  `;

  const html = rangotsavShellHtml({
    title: 'Rangotsav — Volunteer signup',
    eyebrow: 'Signup Received',
    heading: `Glad to have you on the crew, ${name}.`,
    lead: "Thank you for offering your time to Rangotsav 2026. Our team will come back to you with where you fit best.",
    bodyBlocks,
    signOff: 'A festival is only as warm as the people who show up to build it.',
  });

  const result = await sendEmail({ to: data.email, subject, html });
  await logEmail(
    data.email, data.name, 'rangotsav_volunteer_welcome', subject, null,
    result.success ? 'sent' : 'failed', result.id, result.error,
  );
  return result.success;
}

export async function sendRangotsavVendorApproved(data: {
  name: string;
  email: string;
  whatSelling: string;
}): Promise<boolean> {
  const name = escHtml(data.name);
  const whatSelling = escHtml(data.whatSelling).replace(/\n/g, '<br>');
  const subject = "You're confirmed — Rangotsav 2026 Food Vendor";

  const bodyBlocks = `
    <tr>
      <td style="padding: 32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(74,124,89,0.10); border: 1px solid rgba(74,124,89,0.45); border-radius: 12px;">
          <tr>
            <td style="padding: 24px 28px;">
              <p style="color: #7FB88F; margin: 0 0 14px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700;">Confirmed &middot; You're In</p>
              <p style="color: rgba(250,247,242,0.55); margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Business / Name</p>
              <p style="color: #FAF7F2; margin: 0 0 16px; font-size: 15px; font-family: Georgia, serif;">${name}</p>
              <p style="color: rgba(250,247,242,0.55); margin: 0 0 4px; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Your Menu</p>
              <p style="color: #FAF7F2; margin: 0; font-size: 15px; line-height: 1.6; font-family: Georgia, serif;">${whatSelling}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 8px 40px 0;">
        <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">Commission on on-site sales</h3>
        <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          A commission on gross on-site sales is shared with the festival to cover infrastructure, licensing, and programming. The exact percentage and settlement schedule will be confirmed in your participation agreement, which we'll send separately in the next 5 business days for your e-signature.
        </p>
        <p style="color: rgba(250,247,242,0.75); margin: 0; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          Settlement happens within 7 working days after the festival, net of commission and any cashless-payments reconciliation.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px 0;">
        <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">Before 25 May</h3>
        <ul style="color: rgba(250,247,242,0.75); margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.85; font-family: Georgia, serif;">
          <li>You'll receive a stall allocation, setup window, and load-in gate pass by 10 May.</li>
          <li>FSSAI registration number, food-handler ID photo, and sample menu (with prices) are required for your participation agreement.</li>
          <li>Basic infrastructure (stall, power point, shared water) is provided. Signage, serving ware, and staff are your responsibility.</li>
          <li>Please don't commit to third-party catering on 25 May until the agreement is signed &mdash; we'll turn this around quickly.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px 0;">
        <p style="color: rgba(250,247,242,0.55); margin: 0; font-size: 13px; line-height: 1.7; font-family: Georgia, serif; font-style: italic;">
          Reply to this email with your FSSAI details and we'll fast-track your agreement.
        </p>
      </td>
    </tr>
  `;

  const html = rangotsavShellHtml({
    title: 'Rangotsav — Vendor confirmed',
    eyebrow: 'Application Approved',
    heading: `You're confirmed, ${name}.`,
    lead: 'We loved what you proposed to bring to the festival. Below are your on-site sales commission terms and what we need from you before 25 May.',
    bodyBlocks,
    signOff: 'Looking forward to your stall being one of the stops everyone tells their friends about.',
  });

  const result = await sendEmail({ to: data.email, subject, html });
  await logEmail(
    data.email, data.name, 'rangotsav_vendor_approved', subject, null,
    result.success ? 'sent' : 'failed', result.id, result.error,
  );
  return result.success;
}

export async function sendRangotsavVendorRejected(data: {
  name: string;
  email: string;
}): Promise<boolean> {
  const name = escHtml(data.name);
  const subject = 'Update on your Rangotsav 2026 vendor application';

  const bodyBlocks = `
    <tr>
      <td style="padding: 32px 40px 0;">
        <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          Rangotsav 2026 is our first edition, and we're hosting a small, tightly curated set of food stalls centred on Pelling and surrounding community kitchens. We reviewed your application carefully, and this time we won't be able to offer you a stall.
        </p>
        <p style="color: rgba(250,247,242,0.75); margin: 0 0 12px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          This is not a reflection of your offering &mdash; it's a function of stall count and curation for this edition. We've kept your application on file, and you'll be first on our list for Rangotsav 2027 and any Urbane Haauz tasting pop-ups we host in the interim.
        </p>
        <p style="color: rgba(250,247,242,0.75); margin: 0; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          You're warmly invited to visit the festival on 25 May as a guest. We'd love to meet you in person.
        </p>
      </td>
    </tr>
  `;

  const html = rangotsavShellHtml({
    title: 'Rangotsav — Application update',
    eyebrow: 'Application Update',
    heading: `Thank you for applying, ${name}.`,
    lead: "We received many more vendor applications than we had stalls for this first edition. Here's where we landed.",
    bodyBlocks,
    signOff: "We're building something long-term here, and we hope our paths cross again soon.",
  });

  const result = await sendEmail({ to: data.email, subject, html });
  await logEmail(
    data.email, data.name, 'rangotsav_vendor_rejected', subject, null,
    result.success ? 'sent' : 'failed', result.id, result.error,
  );
  return result.success;
}

export async function sendRangotsavTicketConfirmation(data: {
  ticketCode: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}): Promise<boolean> {
  const name = escHtml(data.buyerName);
  const code = escHtml(data.ticketCode);
  const subject = `Your Rangotsav 2026 Pass — ${data.ticketCode}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(
    data.ticketCode,
  )}`;

  const waMessage = encodeURIComponent(
    `My Rangotsav 2026 Pass — Code: ${data.ticketCode} (${data.quantity} ${data.quantity > 1 ? 'admits' : 'admit'}). Pelling, 25–26 May 2026.`,
  );

  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Rangotsav 2026 — Urbane Haauz, Pelling') +
    '&dates=20260525T043000Z/20260526T163000Z' +
    '&details=' + encodeURIComponent(
      `A Bengal–Sikkim cultural conglomerate. Your ticket code: ${data.ticketCode}. Show this code (or QR) at the entrance.`,
    ) +
    '&location=' + encodeURIComponent('Urbane Haauz, SH-510, Skywalk Road, Upper Pelling, West Sikkim 737113');

  const bodyBlocks = `
    <tr>
      <td style="padding: 32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(212,165,116,0.05); border: 1px solid rgba(212,165,116,0.25); border-radius: 12px;">
          <tr>
            <td style="padding: 28px 28px 8px; text-align: center;">
              <p style="color: #D4A574; margin: 0 0 14px; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; font-family: Arial, sans-serif;">Show this at entry</p>
              <img src="${qrUrl}" alt="Rangotsav ticket QR — ${code}" width="200" height="200" style="display: block; width: 200px; height: 200px; margin: 0 auto; background-color: #FAF7F2; border: 6px solid #FAF7F2; border-radius: 8px; outline: none; text-decoration: none;">
              <p style="color: #FAF7F2; margin: 18px 0 4px; font-size: 22px; font-weight: 700; letter-spacing: 0.18em; font-family: 'Courier New', Courier, monospace;">${code}</p>
              <p style="color: rgba(250,247,242,0.55); margin: 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-family: Arial, sans-serif;">Your unique pass code</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 28px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-top: 1px solid rgba(212,165,116,0.2); padding-top: 20px;">
                <tr>
                  <td style="padding: 6px 0; color: rgba(250,247,242,0.55); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Pass Holder</td>
                  <td style="padding: 6px 0; color: #FAF7F2; font-size: 14px; text-align: right; font-family: Georgia, serif;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(250,247,242,0.55); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Admits</td>
                  <td style="padding: 6px 0; color: #FAF7F2; font-size: 14px; text-align: right; font-family: Georgia, serif;">${data.quantity} ${data.quantity > 1 ? 'persons' : 'person'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: rgba(250,247,242,0.55); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Paid</td>
                  <td style="padding: 6px 0; color: #FAF7F2; font-size: 14px; text-align: right; font-family: Georgia, serif;">&#8377;${data.totalAmount.toLocaleString('en-IN')} <span style="color: rgba(250,247,242,0.45); font-size: 11px;">(&#8377;${data.unitPrice.toLocaleString('en-IN')} &times; ${data.quantity})</span></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 8px 40px 0; text-align: center;">
        <a href="https://wa.me/?text=${waMessage}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700; margin: 0 6px 12px;">Save to WhatsApp</a>
        <a href="${calendarUrl}" style="display: inline-block; background-color: rgba(212,165,116,0.12); color: #D4A574; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 700; border: 1px solid rgba(212,165,116,0.4); margin: 0 6px 12px;">Add to Calendar</a>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px 40px 0;">
        <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">When &amp; Where</h3>
        <p style="color: rgba(250,247,242,0.75); margin: 0 0 8px; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          <strong style="color: #FAF7F2;">25–26 May 2026</strong> &middot; Two days of art, music, and food.
        </p>
        <p style="color: rgba(250,247,242,0.75); margin: 0; font-size: 14px; line-height: 1.75; font-family: Georgia, serif;">
          Urbane Haauz, SH-510 Skywalk Road, Upper Pelling, West Sikkim 737113.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 24px 40px 0;">
        <h3 style="color: #D4A574; margin: 0 0 14px; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif;">At the gate</h3>
        <ul style="color: rgba(250,247,242,0.75); margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.85; font-family: Georgia, serif;">
          <li>Show this email (or just the QR / code <strong style="color: #FAF7F2;">${code}</strong>) at the entrance.</li>
          <li>Carry a government photo ID matching the pass holder name.</li>
          <li>One pass admits ${data.quantity} ${data.quantity > 1 ? 'people' : 'person'}. Children under 5 enter free.</li>
          <li>This pass is non-transferable and refunds are not available once issued.</li>
        </ul>
      </td>
    </tr>

    <tr>
      <td style="padding: 24px 40px 0;">
        <p style="color: rgba(250,247,242,0.55); margin: 0; font-size: 13px; line-height: 1.7; font-family: Georgia, serif; font-style: italic;">
          Lost the email? Reply with your pass code and we'll resend it.
        </p>
      </td>
    </tr>
  `;

  const html = rangotsavShellHtml({
    title: 'Rangotsav — Your Pass',
    eyebrow: 'Pass Confirmed',
    heading: `You're in, ${name}.`,
    lead: 'Your Rangotsav 2026 pass is below. Save it, screenshot it, or just keep this email handy on festival day.',
    bodyBlocks,
    signOff: "See you in the mountains. The festival begins the moment you arrive.",
  });

  const result = await sendEmail({ to: data.buyerEmail, subject, html });
  await logEmail(
    data.buyerEmail, data.buyerName, 'rangotsav_ticket_confirmation', subject, null,
    result.success ? 'sent' : 'failed', result.id, result.error,
  );
  return result.success;
}

export async function sendContactInquiryNotification(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
}): Promise<boolean> {
  // Send notification to hotel admin
  const adminHtml = `
    <h2>New Contact Inquiry</h2>
    <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
    ${inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ''}
    <p><strong>Type:</strong> ${inquiry.inquiryType}</p>
    <p><strong>Subject:</strong> ${inquiry.subject}</p>
    <hr>
    <p><strong>Message:</strong></p>
    <p>${inquiry.message.replace(/\n/g, '<br>')}</p>
  `;

  const result = await sendEmail({
    to: 'urbanehaauz@gmail.com',
    subject: `[Inquiry] ${inquiry.subject} - from ${inquiry.name}`,
    html: adminHtml,
    replyTo: inquiry.email,
  });

  return result.success;
}
