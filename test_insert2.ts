import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  const userId = profiles?.[0]?.id;
  console.log("User ID:", userId);

  if (userId) {
    const { data: products } = await supabase.from('products').select('id').limit(1);
    const productId = products?.[0]?.id;
    console.log("Product ID:", productId);
    
    if (productId) {
      const { data, error } = await supabase.from('wishlist').insert([{ user_id: userId, product_id: productId }]).select();
      console.log('Insert error:', error);
      console.log('Insert data:', data);
    }
  }
}
check();
