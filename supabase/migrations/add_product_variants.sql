-- =======================================================================================
-- TRANQUIL LUXURY FASHION: ADD PRODUCT VARIANTS WITH MULTI-SIZE SUPPORT
-- =======================================================================================
-- Run this in Supabase SQL Editor → New Query
-- This script:
--   1. Clears existing variants for the seeded products
--   2. Inserts multi-size variants (XS, S, M, L, XL, XXL) per color per product
--   3. Updates the velvet dress + co-ords image URLs (if not already done)
-- =======================================================================================

-- ──────────────────────────────────────────────────────────────────────────────────────
-- STEP 1: Remove any existing variants for the seeded products (safe re-run)
-- ──────────────────────────────────────────────────────────────────────────────────────
DELETE FROM product_variants
WHERE product_id IN (
  '55555555-5555-5555-5555-555555555551',
  '55555555-5555-5555-5555-555555555552',
  '55555555-5555-5555-5555-555555555553',
  '55555555-5555-5555-5555-555555555554',
  '55555555-5555-5555-5555-555555555555'
);

-- ──────────────────────────────────────────────────────────────────────────────────────
-- STEP 2: INSERT VARIANTS
-- Structure: one row per (product, color, size) with realistic stock quantities
-- ──────────────────────────────────────────────────────────────────────────────────────

-- ── Product 1: Embellished Corset Top ────────────────────────────────────────────────
-- Color: Black
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock_quantity, sku) VALUES
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'XS',  8,  'ECT-BLK-XS'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'S',   15, 'ECT-BLK-S'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'M',   20, 'ECT-BLK-M'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'L',   12, 'ECT-BLK-L'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'XL',  6,  'ECT-BLK-XL'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'XXL', 3,  'ECT-BLK-XXL'),
-- Color: Ivory
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'XS',  5,  'ECT-IVY-XS'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'S',   10, 'ECT-IVY-S'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'M',   14, 'ECT-IVY-M'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'L',   8,  'ECT-IVY-L'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'XL',  4,  'ECT-IVY-XL'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'XXL', 2,  'ECT-IVY-XXL');

-- ── Product 2: Satin Slip Midi Dress ─────────────────────────────────────────────────
-- Color: Champagne
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock_quantity, sku) VALUES
('55555555-5555-5555-5555-555555555552', 'Champagne', '#F7E7CE', 'XS',  6,  'SSMD-CHP-XS'),
('55555555-5555-5555-5555-555555555552', 'Champagne', '#F7E7CE', 'S',   12, 'SSMD-CHP-S'),
('55555555-5555-5555-5555-555555555552', 'Champagne', '#F7E7CE', 'M',   18, 'SSMD-CHP-M'),
('55555555-5555-5555-5555-555555555552', 'Champagne', '#F7E7CE', 'L',   10, 'SSMD-CHP-L'),
('55555555-5555-5555-5555-555555555552', 'Champagne', '#F7E7CE', 'XL',  5,  'SSMD-CHP-XL'),
('55555555-5555-5555-5555-555555555552', 'Champagne', '#F7E7CE', 'XXL', 2,  'SSMD-CHP-XXL'),
-- Color: Blush Pink
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'XS',  4,  'SSMD-BLS-XS'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'S',   9,  'SSMD-BLS-S'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'M',   13, 'SSMD-BLS-M'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'L',   7,  'SSMD-BLS-L'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'XL',  3,  'SSMD-BLS-XL'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'XXL', 1,  'SSMD-BLS-XXL');

-- ── Product 3: Draped Halter Gown ─────────────────────────────────────────────────────
-- Color: Midnight Blue
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock_quantity, sku) VALUES
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'XS',  4,  'DHG-MDB-XS'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'S',   8,  'DHG-MDB-S'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'M',   12, 'DHG-MDB-M'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'L',   9,  'DHG-MDB-L'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'XL',  5,  'DHG-MDB-XL'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'XXL', 2,  'DHG-MDB-XXL'),
-- Color: Emerald
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'XS',  3,  'DHG-EMR-XS'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'S',   7,  'DHG-EMR-S'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'M',   10, 'DHG-EMR-M'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'L',   6,  'DHG-EMR-L'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'XL',  3,  'DHG-EMR-XL'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'XXL', 0,  'DHG-EMR-XXL');

-- ── Product 4: Sequin Mini Skirt ──────────────────────────────────────────────────────
-- Color: Gold
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock_quantity, sku) VALUES
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'XS',  10, 'SMS-GLD-XS'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'S',   20, 'SMS-GLD-S'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'M',   25, 'SMS-GLD-M'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'L',   15, 'SMS-GLD-L'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'XL',  8,  'SMS-GLD-XL'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'XXL', 4,  'SMS-GLD-XXL'),
-- Color: Silver
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'XS',  7,  'SMS-SLV-XS'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'S',   14, 'SMS-SLV-S'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'M',   18, 'SMS-SLV-M'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'L',   10, 'SMS-SLV-L'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'XL',  5,  'SMS-SLV-XL'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'XXL', 2,  'SMS-SLV-XXL');

-- ── Product 5: Velvet Wrap Dress ──────────────────────────────────────────────────────
-- Color: Wine Red
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock_quantity, sku) VALUES
('55555555-5555-5555-5555-555555555555', 'Wine Red', '#722F37', 'XS',  5,  'VWD-WNR-XS'),
('55555555-5555-5555-5555-555555555555', 'Wine Red', '#722F37', 'S',   10, 'VWD-WNR-S'),
('55555555-5555-5555-5555-555555555555', 'Wine Red', '#722F37', 'M',   14, 'VWD-WNR-M'),
('55555555-5555-5555-5555-555555555555', 'Wine Red', '#722F37', 'L',   8,  'VWD-WNR-L'),
('55555555-5555-5555-5555-555555555555', 'Wine Red', '#722F37', 'XL',  4,  'VWD-WNR-XL'),
('55555555-5555-5555-5555-555555555555', 'Wine Red', '#722F37', 'XXL', 2,  'VWD-WNR-XXL'),
-- Color: Forest Green
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'XS',  4,  'VWD-FGR-XS'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'S',   8,  'VWD-FGR-S'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'M',   11, 'VWD-FGR-M'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'L',   6,  'VWD-FGR-L'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'XL',  3,  'VWD-FGR-XL'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'XXL', 1,  'VWD-FGR-XXL');

-- ──────────────────────────────────────────────────────────────────────────────────────
-- STEP 3: Fix image URLs (velvet dress + co-ords category)
-- ──────────────────────────────────────────────────────────────────────────────────────
UPDATE product_images
SET url = 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600'
WHERE product_id = '55555555-5555-5555-5555-555555555555';

UPDATE categories
SET image_url = 'https://images.unsplash.com/photo-1594938298603-c8148c4b4096?q=80&w=1000'
WHERE id = '33333333-3333-3333-3333-333333333333';

-- ──────────────────────────────────────────────────────────────────────────────────────
-- VERIFY: Check counts
-- ──────────────────────────────────────────────────────────────────────────────────────
SELECT 
  p.name,
  COUNT(DISTINCT pv.color_name) AS colours,
  COUNT(pv.id)                  AS total_variants,
  SUM(pv.stock_quantity)        AS total_stock
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
WHERE p.id IN (
  '55555555-5555-5555-5555-555555555551',
  '55555555-5555-5555-5555-555555555552',
  '55555555-5555-5555-5555-555555555553',
  '55555555-5555-5555-5555-555555555554',
  '55555555-5555-5555-5555-555555555555'
)
GROUP BY p.name
ORDER BY p.name;
