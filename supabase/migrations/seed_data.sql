-- =======================================================================================
-- TRANQUIL LUXURY FASHION: SEED DATA
-- =======================================================================================
-- WARNING: This will delete existing products, categories, and homepage sections 
-- and replace them with the official placeholder photos and data.

TRUNCATE TABLE homepage_sections, product_images, product_variants, products, categories CASCADE;

-- ==========================================
-- 1. CATEGORIES
-- ==========================================
INSERT INTO categories (id, name, slug, image_url, display_order) VALUES 
('11111111-1111-1111-1111-111111111111', 'Dresses', 'dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000', 1),
('22222222-2222-2222-2222-222222222222', 'Corsets', 'corsets', 'https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=1000', 2),
('33333333-3333-3333-3333-333333333333', 'Co-Ords', 'coord', 'https://images.unsplash.com/photo-1594938298603-c8148c4b4096?q=80&w=1000', 3),
('44444444-4444-4444-4444-444444444444', 'Accessories', 'accessories', 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1000', 4);

-- ==========================================
-- 2. PRODUCTS
-- ==========================================
INSERT INTO products (id, name, slug, price, status, is_trending, is_featured, category_id) VALUES
('55555555-5555-5555-5555-555555555551', 'Embellished Corset Top', 'embellished-corset-top', 3499, 'active', true, true, '22222222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555552', 'Satin Slip Midi Dress', 'satin-slip-midi-dress', 4999, 'active', true, true, '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555553', 'Draped Halter Gown', 'draped-halter-gown', 6999, 'active', true, true, '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555554', 'Sequin Mini Skirt', 'sequin-mini-skirt', 2999, 'active', true, false, '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555555', 'Velvet Wrap Dress', 'velvet-wrap-dress', 5499, 'active', true, false, '11111111-1111-1111-1111-111111111111');

-- ==========================================
-- 3. PRODUCT IMAGES
-- ==========================================
INSERT INTO product_images (product_id, url, display_order) VALUES
('55555555-5555-5555-5555-555555555551', 'https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=600', 1),
('55555555-5555-5555-5555-555555555551', 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?q=80&w=600', 2),

('55555555-5555-5555-5555-555555555552', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600', 1),

('55555555-5555-5555-5555-555555555553', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600', 1),

('55555555-5555-5555-5555-555555555554', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=600', 1),

('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=600', 1);

-- ==========================================
-- 4. PRODUCT VARIANTS (multi-size per colour)
-- ==========================================

-- Embellished Corset Top — Black & Ivory
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock_quantity, sku) VALUES
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'XS',  8,  'ECT-BLK-XS'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'S',   15, 'ECT-BLK-S'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'M',   20, 'ECT-BLK-M'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'L',   12, 'ECT-BLK-L'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'XL',  6,  'ECT-BLK-XL'),
('55555555-5555-5555-5555-555555555551', 'Black', '#1A1A1A', 'XXL', 3,  'ECT-BLK-XXL'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'XS',  5,  'ECT-IVY-XS'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'S',   10, 'ECT-IVY-S'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'M',   14, 'ECT-IVY-M'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'L',   8,  'ECT-IVY-L'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'XL',  4,  'ECT-IVY-XL'),
('55555555-5555-5555-5555-555555555551', 'Ivory', '#F5F0E8', 'XXL', 2,  'ECT-IVY-XXL'),

-- Satin Slip Midi Dress — Champagne & Blush Pink
('55555555-5555-5555-5555-555555555552', 'Champagne',  '#F7E7CE', 'XS',  6,  'SSMD-CHP-XS'),
('55555555-5555-5555-5555-555555555552', 'Champagne',  '#F7E7CE', 'S',   12, 'SSMD-CHP-S'),
('55555555-5555-5555-5555-555555555552', 'Champagne',  '#F7E7CE', 'M',   18, 'SSMD-CHP-M'),
('55555555-5555-5555-5555-555555555552', 'Champagne',  '#F7E7CE', 'L',   10, 'SSMD-CHP-L'),
('55555555-5555-5555-5555-555555555552', 'Champagne',  '#F7E7CE', 'XL',  5,  'SSMD-CHP-XL'),
('55555555-5555-5555-5555-555555555552', 'Champagne',  '#F7E7CE', 'XXL', 2,  'SSMD-CHP-XXL'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'XS',  4,  'SSMD-BLS-XS'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'S',   9,  'SSMD-BLS-S'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'M',   13, 'SSMD-BLS-M'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'L',   7,  'SSMD-BLS-L'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'XL',  3,  'SSMD-BLS-XL'),
('55555555-5555-5555-5555-555555555552', 'Blush Pink', '#F4B8C1', 'XXL', 1,  'SSMD-BLS-XXL'),

-- Draped Halter Gown — Midnight Blue & Emerald
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'XS',  4,  'DHG-MDB-XS'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'S',   8,  'DHG-MDB-S'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'M',   12, 'DHG-MDB-M'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'L',   9,  'DHG-MDB-L'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'XL',  5,  'DHG-MDB-XL'),
('55555555-5555-5555-5555-555555555553', 'Midnight Blue', '#1B2A4A', 'XXL', 2,  'DHG-MDB-XXL'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'XS',  3,  'DHG-EMR-XS'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'S',   7,  'DHG-EMR-S'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'M',   10, 'DHG-EMR-M'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'L',   6,  'DHG-EMR-L'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'XL',  3,  'DHG-EMR-XL'),
('55555555-5555-5555-5555-555555555553', 'Emerald',       '#1B6B45', 'XXL', 0,  'DHG-EMR-XXL'),

-- Sequin Mini Skirt — Gold & Silver
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'XS',  10, 'SMS-GLD-XS'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'S',   20, 'SMS-GLD-S'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'M',   25, 'SMS-GLD-M'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'L',   15, 'SMS-GLD-L'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'XL',  8,  'SMS-GLD-XL'),
('55555555-5555-5555-5555-555555555554', 'Gold',   '#C7A17A', 'XXL', 4,  'SMS-GLD-XXL'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'XS',  7,  'SMS-SLV-XS'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'S',   14, 'SMS-SLV-S'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'M',   18, 'SMS-SLV-M'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'L',   10, 'SMS-SLV-L'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'XL',  5,  'SMS-SLV-XL'),
('55555555-5555-5555-5555-555555555554', 'Silver', '#B0B0B0', 'XXL', 2,  'SMS-SLV-XXL'),

-- Velvet Wrap Dress — Wine Red & Forest Green
('55555555-5555-5555-5555-555555555555', 'Wine Red',     '#722F37', 'XS',  5,  'VWD-WNR-XS'),
('55555555-5555-5555-5555-555555555555', 'Wine Red',     '#722F37', 'S',   10, 'VWD-WNR-S'),
('55555555-5555-5555-5555-555555555555', 'Wine Red',     '#722F37', 'M',   14, 'VWD-WNR-M'),
('55555555-5555-5555-5555-555555555555', 'Wine Red',     '#722F37', 'L',   8,  'VWD-WNR-L'),
('55555555-5555-5555-5555-555555555555', 'Wine Red',     '#722F37', 'XL',  4,  'VWD-WNR-XL'),
('55555555-5555-5555-5555-555555555555', 'Wine Red',     '#722F37', 'XXL', 2,  'VWD-WNR-XXL'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'XS',  4,  'VWD-FGR-XS'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'S',   8,  'VWD-FGR-S'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'M',   11, 'VWD-FGR-M'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'L',   6,  'VWD-FGR-L'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'XL',  3,  'VWD-FGR-XL'),
('55555555-5555-5555-5555-555555555555', 'Forest Green', '#2D5A27', 'XXL', 1,  'VWD-FGR-XXL');

-- ==========================================
-- 5. HOMEPAGE SECTIONS
-- ==========================================
INSERT INTO homepage_sections (section_type, title, subtitle, image_url, display_order) VALUES
('hero', 'Luxury Crafted For Every Occasion', 'Designed to make you unforgettable.', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=2000', 1),
('hero', 'Elegance In Every Detail', 'Explore our latest editorial curations.', 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2000', 2),
('hero', 'Statement Pieces That Inspire', 'Embrace the art of standing out.', 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=2000', 3),

('trending', 'Summer Edit', 'summer', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800', 1),
('trending', 'Party Wear', 'partywear', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800', 2),
('trending', 'Date Night', 'dresses', 'https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=800', 3),
('trending', 'Vacation Collection', 'new', 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800', 4),
('trending', 'Birthday Looks', 'partywear', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800', 5);
