const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFetch() {
  const productId = '26a56248-2e0b-41cd-ac2e-c42dfb05f65f'; // Replace with a real one if this doesn't exist, we'll first try it
  console.log("Fetching product ID:", productId);
  
  const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(category_id),
          product_images(image_url, color_name),
          product_variants(*)
        `)
        .eq('id', productId)
        .single();
        
  if (error) {
    console.error("Error fetching product:", error);
  } else {
    console.log("Success fetching product:", data.name);
  }
}

testFetch();
