import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.log('List users error:', userError);
    // try to just insert without admin if possible
  }
  
  // Let's just find ANY product
  const { data: products } = await supabase.from('products').select('id').limit(1);
  const productId = products?.[0]?.id;
  console.log('Product ID:', productId);

  // Hardcode the user id if we know it, or just print it.
  console.log('Users:', users?.users?.map(u => u.id));
}
test();
