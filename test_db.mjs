import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://flygrbvvkaxriitxnzyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg'
);

async function test() {
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  const orderId = crypto.randomUUID();

  const { data: newOrder, error } = await supabase.from('orders').insert({
    id: orderId,
    order_number: orderNumber,
    customer_name: 'Test',
    customer_email: 'test@example.com',
    customer_phone: '1234567890',
    shipping_address: {},
    subtotal: 100,
    shipping_fee: 10,
    total_amount: 110,
    payment_method: 'upi',
    transaction_id: '12345',
    screenshot_url: 'http://example.com',
    status: 'pending'
  }); // REMOVED .select().single()

  if (error) {
    console.error('Order insert error:', error);
    return;
  }
  
  console.log('Order inserted successfully with ID:', orderId);

  const orderItems = [{
    order_id: orderId,
    product_id: 'a935daaa-6d5d-456f-8703-a16082bc8527', // fake uuid
    product_name: 'Test Item',
    quantity: 1,
    price: 100
  }];

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) {
    console.error('Order items insert error:', itemsError);
    return;
  }
  
  console.log('Order Items inserted successfully');
}

test();
