import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://flygrbvvkaxriitxnzyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg'
);

async function test() {
  const { data, error } = await supabase.from('orders').insert({
    order_number: `ORD-${Date.now()}`,
    customer_name: 'Test',
    customer_email: 'test@test.com',
    shipping_address: {},
    subtotal: 100,
    total_amount: 100,
    screenshot_url: 'http://example.com'
  }).select();

  console.log('Error:', error);
  console.log('Data:', data);
}

test();
