-- Fix Storage RLS to allow deletions
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

CREATE POLICY "Public Delete Access" 
ON storage.objects FOR DELETE 
TO public
USING (bucket_id = 'public-assets');
