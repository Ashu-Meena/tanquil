import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://flygrbvvkaxriitxnzyi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg');

async function testGuestCheckout() {
  console.log("Simulating Guest Checkout...");

  // 1. Fetch a valid product ID
  const { data: products, error: pErr } = await supabase.from('products').select('id, name, price').limit(1);
  if (pErr || !products || products.length === 0) {
    console.error("Could not fetch product:", pErr);
    return;
  }
  const product = products[0];
  console.log("Using product:", product);

  const orderId = crypto.randomUUID();
  const orderNum = 'TEST-GUEST-' + Math.floor(Math.random() * 10000);
  
  // 2. Insert order (NO user_id)
  const { error: orderErr } = await supabase.from('orders').insert({
    id: orderId,
    order_number: orderNum,
    customer_name: 'Guest Mobile Test',
    customer_email: 'guest@example.com',
    shipping_address: { city: 'Test' },
    subtotal: product.price,
    total_amount: product.price
  });
  
  if (orderErr) {
    console.error("Order Insert Error:", orderErr);
    return;
  }
  console.log("Order Inserted Successfully. ID:", orderId);

  // 3. Insert order items
  const { error: itemErr } = await supabase.from('order_items').insert([{
    order_id: orderId,
    product_id: product.id,
    product_name: product.name,
    quantity: 1,
    price: product.price
  }]);
  
  if (itemErr) {
    console.error("Order Items Insert Error:", itemErr);
  } else {
    console.log("Order Items Inserted Successfully!");
  }
}

testGuestCheckout();
