const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDelete() {
  const bucketName = 'public-assets';
  // Try to list files
  const { data: files } = await supabase.storage.from(bucketName).list('', { limit: 5 });
  
  if (files && files.length > 0) {
    const file = files.find(f => f.name !== '.emptyFolderPlaceholder');
    if (!file) return;
    
    console.log("Trying to delete:", file.name);
    const { data, error } = await supabase.storage.from(bucketName).remove([file.name]);
    console.log("Data:", data);
    console.log("Error:", error);
    
    // Check if it's still there
    const { data: filesAfter } = await supabase.storage.from(bucketName).list('', { limit: 5 });
    const stillThere = filesAfter.find(f => f.name === file.name);
    console.log("Still there after delete?", !!stillThere);
  } else {
    console.log("No files to delete.");
  }
}

testDelete();
