import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribe</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#ffffff;"><div style="text-align:center;padding:24px;"><h1 style="font-size:20px;color:#1a1a1a;">Invalid link</h1><p style="font-size:14px;color:#6b7280;">The unsubscribe link is missing a token.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const { data: subscriber } = await supabaseAdmin
    .from('subscribers')
    .select('id')
    .eq('unsubscribe_token', token)
    .maybeSingle();

  if (!subscriber) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribe</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#ffffff;"><div style="text-align:center;padding:24px;"><h1 style="font-size:20px;color:#1a1a1a;">Not found</h1><p style="font-size:14px;color:#6b7280;">We couldn't find a subscription with that token.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  await supabaseAdmin
    .from('subscribers')
    .update({ is_active: false })
    .eq('id', subscriber.id);

  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribed</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#ffffff;"><div style="text-align:center;padding:24px;"><h1 style="font-size:20px;color:#1a1a1a;">You've been unsubscribed</h1><p style="font-size:14px;color:#6b7280;">Sorry to see you go. You can always resubscribe at <a href="/" style="color:#1877F2;text-decoration:none;">potatoai.in</a>.</p></div></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}
