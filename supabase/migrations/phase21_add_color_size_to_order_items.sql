-- Add color_name and size to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS color_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS size VARCHAR(50);
