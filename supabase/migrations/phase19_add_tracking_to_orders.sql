-- Add tracking_id and courier_name to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_id TEXT,
ADD COLUMN IF NOT EXISTS courier_name TEXT;
