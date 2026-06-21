import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // Protect with admin password
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch top 5 featured news from last 7 days, fallback to latest
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: newsItems } = await supabaseAdmin
      .from('news')
      .select('*')
      .gte('published_at', sevenDaysAgo)
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(5);

    // Fetch highest rated model from last 7 days
    const { data: recentModels } = await supabaseAdmin
      .from('models')
      .select('*, companies(*)')
      .gte('launched_at', sevenDaysAgo.split('T')[0])
      .order('benchmark_score', { ascending: false })
      .limit(1);

    const modelOfWeek = recentModels?.[0];

    // Fetch active subscribers
    const { data: subscribers } = await supabaseAdmin
      .from('subscribers')
      .select('email, name, unsubscribe_token')
      .eq('is_active', true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No active subscribers.' });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const html = digestEmailHtml(newsItems || [], modelOfWeek, dateStr);

    let sent = 0;
    for (const sub of subscribers) {
      const unsubLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://potatoai.in'}/api/unsubscribe?token=${sub.unsubscribe_token}`;
      const personalizedHtml = html.replace(/{{unsubscribe_url}}/g, unsubLink);

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `PotatoAi <${fromEmail}>`,
            to: sub.email,
            subject: `PotatoAi Weekly — Top AI This Week (${dateStr})`,
            html: personalizedHtml,
          }),
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${sub.email}:`, err);
      }
    }

    console.log(`Digest sent to ${sent} subscribers.`);
    return NextResponse.json({ sent, total: subscribers.length });
  } catch (err: any) {
    console.error('Send digest error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send digest' }, { status: 500 });
  }
}

function digestEmailHtml(newsItems: any[], modelOfWeek: any | null, dateStr: string) {
  const newsHtml = newsItems.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <div style="font-size:15px;font-weight:600;margin-bottom:4px;">${item.title}</div>
        <div style="font-size:14px;color:#4b5563;line-height:1.5;margin-bottom:6px;">${item.summary || ''}</div>
        <a href="${item.source_url || '#'}" style="font-size:13px;color:#1877F2;text-decoration:none;font-weight:600;">Read more →</a>
      </td>
    </tr>
  `).join('');

  const modelHtml = modelOfWeek ? `
    <tr>
      <td style="padding:16px;background:#E7F0FD;border-radius:8px;">
        <div style="font-size:18px;font-weight:700;margin-bottom:8px;color:#1a1a1a;">${modelOfWeek.name}</div>
        <div style="font-size:14px;color:#4b5563;margin-bottom:8px;">${modelOfWeek.companies?.name || 'Unknown'} · ${modelOfWeek.pricing_type} · ${modelOfWeek.context_window || 'N/A'}</div>
        <div style="font-size:14px;color:#4b5563;margin-bottom:8px;line-height:1.5;">${modelOfWeek.description || ''}</div>
        <div style="font-size:14px;font-weight:600;color:#1877F2;">Benchmark: ${modelOfWeek.benchmark_score || 'N/A'}/100</div>
      </td>
    </tr>
  ` : `
    <tr>
      <td style="padding:12px 0;font-size:14px;color:#6b7280;">No new models launched this week.</td>
    </tr>
  `;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PotatoAi Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding-bottom:24px;">
            <div style="font-size:22px;font-weight:700;color:#1877F2;">PotatoAi</div>
            <div style="font-size:14px;color:#6b7280;margin-top:4px;">Weekly Digest · ${dateStr}</div>
          </td>
        </tr>
        <tr>
          <td style="font-size:20px;font-weight:700;padding-bottom:16px;">This Week in AI</td>
        </tr>
        ${newsHtml || '<tr><td style="padding:12px 0;font-size:14px;color:#6b7280;">No major news this week.</td></tr>'}
        <tr>
          <td style="font-size:20px;font-weight:700;padding:24px 0 16px;">Model of the Week</td>
        </tr>
        ${modelHtml}
        <tr>
          <td style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;font-size:12px;color:#9ca3af;">
            You're receiving this because you subscribed at potatoai.in.<br>
            <a href="{{unsubscribe_url}}" style="color:#1877F2;text-decoration:none;">Unsubscribe</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
