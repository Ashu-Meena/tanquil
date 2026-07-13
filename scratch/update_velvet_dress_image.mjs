import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://flygrbvvkaxriitxnzyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg'
);

const VELVET_WRAP_DRESS_ID = '55555555-5555-5555-5555-555555555555';
const NEW_IMAGE_URL = '/velvet-wrap-dress.png';

async function updateImage() {
  console.log('Updating Velvet Wrap Dress image...');

  // First, check existing images
  const { data: existing, error: fetchErr } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', VELVET_WRAP_DRESS_ID);

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }
  console.log('Current images:', existing);

  // Update the first image URL
  const { data, error } = await supabase
    .from('product_images')
    .update({ url: NEW_IMAGE_URL })
    .eq('product_id', VELVET_WRAP_DRESS_ID)
    .eq('display_order', 1);

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('✅ Updated successfully!');
  }

  // Verify
  const { data: updated } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', VELVET_WRAP_DRESS_ID);
  console.log('Updated images:', updated);
}

updateImage();
