import { corsHeaders } from '../_shared/cors.ts';

const DEFAULT_FROM = 'Urbane Haauz <info@urbanehaauz.com>';
const DEFAULT_REPLY_TO = 'urbanehaauz@gmail.com';

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, replyTo, from } = (await req.json()) as SendEmailPayload;

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'to, subject, and html are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || DEFAULT_FROM,
        to: [to],
        subject,
        html,
        reply_to: replyTo || DEFAULT_REPLY_TO,
      }),
    });

    const data = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to send email' }),
        {
          status: resendRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(JSON.stringify({ id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-email error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
