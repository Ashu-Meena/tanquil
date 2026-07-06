import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://flygrbvvkaxriitxnzyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg'
);

async function main() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles:', data);
  if (error) console.error('Error:', error);
}

main();
