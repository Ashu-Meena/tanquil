import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWishlist() {
  console.log("Checking products...");
  const { data: products, error: pErr } = await supabase.from('products').select('id, name').limit(1);
  if (pErr) console.error("Products error:", pErr);
  if (products && products.length > 0) {
    console.log("Found product:", products[0]);
    // Try to insert into wishlist
    // Note: Since we only have anon key, we can't bypass RLS unless we login.
    // But we can check RLS policies or try selecting wishlist.
    console.log("Checking wishlist table...");
    const { data: wList, error: wErr } = await supabase.from('wishlist').select('*').limit(1);
    console.log("Wishlist select result:", wErr || wList);
  }
}

testWishlist();
