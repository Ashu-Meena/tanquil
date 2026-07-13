import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  'https://flygrbvvkaxriitxnzyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg'
);

const VELVET_WRAP_DRESS_ID = '55555555-5555-5555-5555-555555555555';
const IMAGE_PATH = path.resolve('public/velvet-wrap-dress.png');

async function uploadAndUpdate() {
  console.log('Reading image file...');
  const fileBuffer = fs.readFileSync(IMAGE_PATH);
  const fileName = 'velvet-wrap-dress.png';

  console.log('Uploading to Supabase Storage...');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('public-assets')
    .upload(fileName, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return;
  }
  console.log('Upload success:', uploadData);

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('public-assets')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;
  console.log('Public URL:', publicUrl);

  // Update the product_images record
  const { data, error } = await supabase
    .from('product_images')
    .update({ url: publicUrl })
    .eq('product_id', VELVET_WRAP_DRESS_ID);

  if (error) {
    console.error('DB Update error:', error);
  } else {
    console.log('✅ DB Updated successfully!', data);
  }

  // Verify
  const { data: updated } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', VELVET_WRAP_DRESS_ID);
  console.log('Final images in DB:', updated);
}

uploadAndUpdate();
