-- ULTIMATE FIX FOR MEDIA UPLOADS AND DELETIONS
-- Run this in your Supabase SQL Editor

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access Anon" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

-- 2. Allow Public Read Access (anyone can view images)
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'public-assets');

-- 3. Allow Public Upload Access (anyone can upload images)
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
TO public
WITH CHECK (bucket_id = 'public-assets');

-- 4. Allow Public Delete Access (anyone can delete images)
CREATE POLICY "Public Delete Access" 
ON storage.objects FOR DELETE 
TO public
USING (bucket_id = 'public-assets');

-- 5. Allow Public Update Access (anyone can update images)
CREATE POLICY "Public Update Access" 
ON storage.objects FOR UPDATE 
TO public
USING (bucket_id = 'public-assets');
