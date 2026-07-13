-- =======================================================================================
-- ADD TRACKING STATUS TO ORDERS
-- =======================================================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_status VARCHAR(100) DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS tracking_last_updated TIMESTAMP WITH TIME ZONE;
