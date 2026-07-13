-- Update Co-Ords category image to a proper co-ord set photo
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/flygrbvvkaxriitxnzyi/sql/new

UPDATE categories 
SET image_url = 'https://images.unsplash.com/photo-1594938298603-c8148c4b4096?q=80&w=1000'
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Verify the update
SELECT id, name, image_url FROM categories WHERE id = '33333333-3333-3333-3333-333333333333';
