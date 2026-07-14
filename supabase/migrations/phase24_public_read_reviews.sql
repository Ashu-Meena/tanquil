-- =======================================================================================
-- TRANQUIL LUXURY FASHION: PUBLIC REVIEWS POLICIES
-- =======================================================================================
-- This script enables public read access to reviews and allows authenticated users to insert.
-- =======================================================================================

-- Allow public read access to all reviews
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Public can read reviews"
ON public.reviews FOR SELECT
USING (true);

-- Allow authenticated users to insert reviews
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);
