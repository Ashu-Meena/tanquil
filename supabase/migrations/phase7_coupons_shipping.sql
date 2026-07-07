-- Add is_free_shipping to coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_free_shipping BOOLEAN DEFAULT false;
