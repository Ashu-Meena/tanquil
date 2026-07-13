-- Create the new many-to-many join table for product categories
CREATE TABLE product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Policies for product_categories
-- Allow public read access
CREATE POLICY "Allow public read access on product_categories" ON product_categories
    FOR SELECT TO public
    USING (true);

-- Allow admin full access
CREATE POLICY "Allow admin full access on product_categories" ON product_categories
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Migrate existing data
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products WHERE category_id IS NOT NULL;

-- Remove the old category_id column from products
ALTER TABLE products DROP COLUMN category_id;
