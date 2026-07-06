import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from('categories').insert([
    {
      name: 'Test Category',
      slug: 'test-category',
      image_url: 'test.png',
      display_order: 10
    }
  ]).select();

  console.log('Insert Result:', data);
  console.log('Insert Error:', error);

  if (data) {
    // clean up
    await supabase.from('categories').delete().eq('id', data[0].id);
  }
}

testInsert();
