-- ==========================================
-- PHASE 4: SEED DEMO DATA
-- ==========================================

-- 1. Instagram Posts Table
CREATE TABLE IF NOT EXISTS instagram_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    post_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed Instagram Posts
INSERT INTO instagram_posts (image_url, post_url, display_order)
VALUES 
('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', 'https://instagram.com/tranquil.co.in', 1),
('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', 'https://instagram.com/tranquil.co.in', 2),
('https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80', 'https://instagram.com/tranquil.co.in', 3);

-- 2. Seed Reviews
-- We will use a DO block to safely insert reviews linked to real products and profiles if available.
DO $$
DECLARE
    v_product_id UUID;
    v_user_id UUID;
BEGIN
    -- Get a random product
    SELECT id INTO v_product_id FROM products LIMIT 1;
    
    -- Get a random profile
    SELECT id INTO v_user_id FROM profiles LIMIT 1;

    IF v_product_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        -- Insert dummy reviews
        INSERT INTO reviews (product_id, user_id, rating, title, comment, status)
        VALUES 
        (v_product_id, v_user_id, 5, 'Absolutely Stunning', 'The quality of the satin is incredible. It feels like second skin and fits perfectly. Truly a luxury experience.', 'approved'),
        (v_product_id, v_user_id, 5, 'Perfect for special occasions', 'Wore this for my engagement party and received endless compliments. The finishing is flawless.', 'approved'),
        (v_product_id, v_user_id, 4, 'Great fit, fast shipping', 'The fit is true to size and the packaging felt incredibly premium. Will definitely be buying again.', 'approved');
    END IF;
END $$;
