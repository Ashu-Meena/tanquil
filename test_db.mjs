import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing DB connection...');
  
  const { data: sections, error: sErr } = await supabase.from('homepage_sections').select('*');
  console.log('Sections:', sections?.length, sErr);

  const { data: products, error: pErr } = await supabase.from('products').select('*');
  console.log('Products:', products?.length, pErr);

  const { data: categories, error: cErr } = await supabase.from('categories').select('*');
  console.log('Categories:', categories?.length, cErr);
}

test();
