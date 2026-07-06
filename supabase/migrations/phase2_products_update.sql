-- Supabase Database Migration for Phase 2: Product Management
-- This script safely adds the new advanced fields to the existing 'products' table.

-- 1. Add SKU
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;

-- 2. Add Pricing
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10, 2);

-- 3. Add Organization & Taxonomy
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);

-- 4. Add Product Details
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2); -- in kg or grams
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_info TEXT;

-- 5. Add Status & SEO
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft'; -- 'active', 'draft', 'archived'
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Update the database type definition (src/types/database.ts) after applying this migration.
