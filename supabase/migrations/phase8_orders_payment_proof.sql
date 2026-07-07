-- Adds payment proof fields to the orders table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_number VARCHAR(255);
