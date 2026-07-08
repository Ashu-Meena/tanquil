ALTER TABLE product_images ADD COLUMN IF NOT EXISTS color_name VARCHAR(50);
ALTER TABLE product_variants DROP COLUMN IF EXISTS image_url;
