-- Fix RLS policies for order_items and orders so checkout can complete

-- Allow anyone to insert order items for their own orders (or guest orders)
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE id = order_items.order_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    )
);

-- Allow users to view order items
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
CREATE POLICY "Users can view their order items"
ON public.order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE id = order_items.order_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    )
);
