-- Update Velvet Wrap Dress image to a proper velvet dress photo
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/flygrbvvkaxriitxnzyi/sql/new

UPDATE product_images 
SET url = 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600'
WHERE product_id = '55555555-5555-5555-5555-555555555555';

-- Verify the update
SELECT id, product_id, url, display_order 
FROM product_images 
WHERE product_id = '55555555-5555-5555-5555-555555555555';
