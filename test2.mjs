import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://flygrbvvkaxriitxnzyi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg');

async function test() {
  const orderId = crypto.randomUUID();
  const { data, error } = await supabase.from('orders').insert({
    id: orderId,
    order_number: 'TEST-' + Math.random(),
    customer_name: 'Test',
    customer_email: 'test@example.com',
    shipping_address: {},
    subtotal: 100,
    total_amount: 100
  }).select().single();
  console.log(error || data);
}
test();
