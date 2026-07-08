-- Copy and paste this into your Supabase SQL Editor

-- 1. Drop the old policy that isn't working for deletes
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- 2. Create a new policy that explicitly grants delete permissions to EVERYONE
CREATE POLICY "Public Delete Access" 
ON storage.objects FOR DELETE 
TO public
USING (bucket_id = 'public-assets');

-- 3. Just to be absolutely sure, allow anon and authenticated roles explicitly
DROP POLICY IF EXISTS "Public Delete Access Anon" ON storage.objects;
CREATE POLICY "Public Delete Access Anon" 
ON storage.objects FOR DELETE 
TO anon, authenticated
USING (bucket_id = 'public-assets');
