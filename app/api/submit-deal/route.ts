import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { tool_name, deal_url, deal_description } = await request.json();

    if (!tool_name || typeof tool_name !== 'string') {
      return NextResponse.json({ error: 'Tool name is required.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('pending_deals').insert({
      tool_name: tool_name.trim(),
      deal_url: deal_url?.trim() || null,
      deal_description: deal_description?.trim() || null,
      status: 'pending',
    });

    if (error) {
      console.error('Insert pending deal error:', error);
      return NextResponse.json({ error: 'Failed to submit deal.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
