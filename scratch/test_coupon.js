import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...val] = line.split('=');
    if (key) {
      env[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '');
    }
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCoupon() {
  const payload = {
    code: 'TESTCODE',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 0,
    is_active: true,
    is_free_shipping: true
  };

  const { data, error } = await supabase.from('coupons').insert([payload]).select();
  console.log("Insert result:", data);
  console.log("Insert error:", error);
}

testCoupon();
