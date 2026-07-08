import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://flygrbvvkaxriitxnzyi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg');

async function test() {
  const orderId = crypto.randomUUID();
  const orderNum = 'TEST-' + Math.floor(Math.random() * 1000000);
  
  // 1. Insert order
  const { error: orderErr } = await supabase.from('orders').insert({
    id: orderId,
    order_number: orderNum,
    customer_name: 'Test Mobile',
    customer_email: 'testmobile@example.com',
    shipping_address: {},
    subtotal: 100,
    total_amount: 100
  });
  console.log('Order insert err:', orderErr);
  
  // 2. Insert order items
  const { error: itemErr } = await supabase.from('order_items').insert({
    order_id: orderId,
    product_id: 'e8e45260-2646-4444-a095-2c8c4a165b4c',
    product_name: 'Test Mobile',
    quantity: 1,
    price: 100
  });
  console.log('Item insert err:', itemErr);
}
test();
