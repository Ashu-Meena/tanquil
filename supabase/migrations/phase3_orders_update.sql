-- Supabase Database Migration for Phase 3: Order Management
-- Adds fulfillment tracking fields to the existing orders table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
