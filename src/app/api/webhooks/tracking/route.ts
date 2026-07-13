import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for server-side updates
// We use the service role key to bypass RLS for webhook updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Fallback for local dev if service role missing
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verify webhook signature here if using a real provider (e.g., Shiprocket x-api-signature)
    
    /**
     * MOCK PAYLOAD STRUCTURE
     * Assuming the provider sends:
     * {
     *   "tracking_id": "AWB123456789",
     *   "courier_name": "Delhivery",
     *   "status": "Out for Delivery",
     *   "timestamp": "2024-03-20T10:30:00Z"
     * }
     */

    const { tracking_id, status, timestamp } = payload;

    if (!tracking_id || !status) {
      return NextResponse.json({ error: 'Missing tracking_id or status' }, { status: 400 });
    }

    // Update the database
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_status: status,
        tracking_last_updated: timestamp || new Date().toISOString()
      })
      .eq('tracking_id', tracking_id);

    if (error) {
      console.error('[Tracking Webhook] DB Update Error:', error);
      return NextResponse.json({ error: 'Failed to update order tracking status' }, { status: 500 });
    }

    console.log(`[Tracking Webhook] Successfully updated tracking ${tracking_id} to ${status}`);
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[Tracking Webhook] Error processing payload:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
