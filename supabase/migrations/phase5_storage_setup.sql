-- Supabase Database Migration for Phase 5: Full Storefront Control
-- Sets up the Storage Bucket for Image Uploads

-- 1. Create a public bucket named 'public-assets'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to everyone
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'public-assets');

-- 3. Allow uploads (For this MVP, we allow anon uploads, but in production this should be restricted to admin auth roles)
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'public-assets');

CREATE POLICY "Public Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'public-assets');

CREATE POLICY "Public Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'public-assets');
