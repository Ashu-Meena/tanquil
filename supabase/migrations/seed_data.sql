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
-- 4. HOMEPAGE SECTIONS
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
