import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check if already exists
    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ error: 'This email is already subscribed.' }, { status: 409 });
      } else {
        // Reactivate
        await supabaseAdmin
          .from('subscribers')
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq('id', existing.id);
      }
    } else {
      await supabaseAdmin
        .from('subscribers')
        .insert({ email: email.toLowerCase().trim(), name: name || null });
    }

    // Send welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `PotatoAi <${fromEmail}>`,
            to: email.toLowerCase().trim(),
            subject: "Welcome to PotatoAi — Your weekly AI digest starts Monday",
            html: welcomeEmailHtml(name),
          }),
        });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

function welcomeEmailHtml(name?: string) {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to PotatoAi</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding-bottom:24px;">
            <div style="font-size:22px;font-weight:700;color:#1877F2;">PotatoAi</div>
          </td>
        </tr>
        <tr>
          <td style="font-size:16px;line-height:1.6;padding-bottom:16px;">
            ${greeting},<br><br>
            You're now subscribed to the <strong>PotatoAi Weekly Digest</strong>. Every Monday morning, we'll send you a curated roundup of the most important AI news, model launches, and updates — tailored for India.
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;">
            <div style="font-size:16px;font-weight:600;margin-bottom:8px;">What to expect:</div>
            <ul style="margin:0;padding-left:20px;line-height:1.8;">
              <li>Top 5 AI news stories of the week</li>
              <li>Best model of the week with ratings</li>
              <li>New funding rounds and company updates</li>
              <li>AI glossary term to level up your knowledge</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="font-size:14px;color:#6b7280;padding-bottom:24px;">
            Your first digest arrives next Monday. Until then, explore the latest AI models and news at <a href="https://potatoai.in" style="color:#1877F2;text-decoration:none;">potatoai.in</a>.
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e5e7eb;padding-top:16px;font-size:12px;color:#9ca3af;">
            You're receiving this because you subscribed at potatoai.in.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
