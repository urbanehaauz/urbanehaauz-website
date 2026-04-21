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
              <h1 style="color: #c9a84c; margin: 0; font-size: 28px; font-weight: bold;">URBANE HAAUZ</h1>
              <p style="color: #ffffff; margin: 8px 0 0; font-size: 14px; letter-spacing: 2px;">PELLING, SIKKIM</p>
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
                SH-510, Pelling, West Sikkim, India 737113
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
                    <p style="color: #FAF7F2; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.05em;">25 MAY 2026</p>
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
                Urbane Haauz &middot; SH-510, Pelling, West Sikkim 737113
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
