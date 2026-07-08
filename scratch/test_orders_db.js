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
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOrders() {
  const { data: orders, error } = await supabase.from('orders').select('*');
  console.log("Orders count:", orders?.length, "Error:", error);
  if (orders && orders.length > 0) {
    console.log("Sample order user_id:", orders[0].user_id, "email:", orders[0].email);
  }
}

testOrders();
