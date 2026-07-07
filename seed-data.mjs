import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.ADMIN_SECRET;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding data...");
  
  // 1. Seed Reviews
  const { data: products } = await supabase.from('products').select('id').limit(1);
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  
  if (products && products.length > 0 && profiles && profiles.length > 0) {
    const productId = products[0].id;
    const userId = profiles[0].id;
    
    await supabase.from('reviews').insert([
      { product_id: productId, user_id: userId, rating: 5, title: 'Absolutely Stunning', comment: 'The quality of the satin is incredible. It feels like second skin and fits perfectly. Truly a luxury experience.', status: 'approved' },
      { product_id: productId, user_id: userId, rating: 5, title: 'Perfect for special occasions', comment: 'Wore this for my engagement party and received endless compliments. The finishing is flawless.', status: 'approved' },
      { product_id: productId, user_id: userId, rating: 4, title: 'Great fit, fast shipping', comment: 'The fit is true to size and the packaging felt incredibly premium. Will definitely be buying again.', status: 'approved' }
    ]);
    console.log("Inserted reviews.");
  }
  
  // 2. Seed Instagram Posts in homepage_sections
  await supabase.from('homepage_sections').insert([
    { section_type: 'instagram', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', button_link: 'https://instagram.com/tranquil.co.in', display_order: 1 },
    { section_type: 'instagram', image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', button_link: 'https://instagram.com/tranquil.co.in', display_order: 2 },
    { section_type: 'instagram', image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80', button_link: 'https://instagram.com/tranquil.co.in', display_order: 3 }
  ]);
  console.log("Inserted instagram posts.");
  
  // 3. Seed missing Lookbook images in homepage_sections
  await supabase.from('homepage_sections').insert([
    { section_type: 'lookbook', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600', title: 'Satin Midi', button_link: 'dresses', metadata: { type: 'photo', height: 'h-[400px]' }, display_order: 1 },
    { section_type: 'lookbook', image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600', title: 'Velvet Gown', button_link: 'dresses', metadata: { type: 'video', height: 'h-[550px]' }, display_order: 2 },
    { section_type: 'lookbook', image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600', title: 'Silk Co-ord', button_link: 'coord-sets', metadata: { type: 'photo', height: 'h-[450px]' }, display_order: 3 },
    { section_type: 'lookbook', image_url: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=600', title: 'Draped Halter', button_link: 'gowns', metadata: { type: 'photo', height: 'h-[600px]' }, display_order: 4 }
  ]);
  console.log("Inserted lookbook.");
  
  console.log("Done.");
}

seed().catch(console.error);
