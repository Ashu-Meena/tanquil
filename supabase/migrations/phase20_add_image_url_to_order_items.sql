-- Add image_url to order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS image_url TEXT;
