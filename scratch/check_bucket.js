require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkBucket() {
  const { data, error } = await supabase.storage.getBucket('public-assets');
  console.log("Bucket data:", data);
  if (error) console.error("Error:", error);
}

checkBucket();
