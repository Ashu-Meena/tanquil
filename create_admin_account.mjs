import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://flygrbvvkaxriitxnzyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWdyYnZ2a2F4cmlpdHhuenlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxOTEzMjEsImV4cCI6MjA5ODc2NzMyMX0.mwERwYodTzhd7oxnsP6U94L1VZCPtg6MFVHy_ern_Gg'
);

async function main() {
  console.log('Attempting to create admin account...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@tranquil.com',
    password: 'AdminPassword123!',
    options: {
      data: {
        first_name: 'Super',
        last_name: 'Admin'
      }
    }
  });

  if (error) {
    console.error('Error signing up:', error.message);
  } else {
    console.log('Successfully created user in Supabase auth!', data.user?.id);
    
    // Now verify the profile was created (because of our SQL trigger)
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user?.id);
    console.log('Profile created:', profileData);
  }
}

main();
