-- Create payment_screenshots bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment_screenshots', 'payment_screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to payment_screenshots
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment_screenshots');

-- Allow public read access to payment_screenshots
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment_screenshots');
