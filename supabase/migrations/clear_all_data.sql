-- =======================================================================================
-- TRANQUIL LUXURY FASHION: CLEAR ALL STORE DATA
-- =======================================================================================
-- WARNING: This will delete ALL products, variants, images, categories, orders, 
-- carts, and homepage sections. Your store will be completely empty.
-- 
-- It will NOT delete users/profiles or global store settings.
-- 
-- Run this in Supabase SQL Editor → New Query
-- =======================================================================================

TRUNCATE TABLE 
    homepage_sections,
    product_images,
    product_variants,
    products,
    categories,
    order_items,
    orders,
    cart_items,
    carts,
    wishlist,
    reviews,
    coupons
CASCADE;
