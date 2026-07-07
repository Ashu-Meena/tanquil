-- Simplified RLS for order_items to bypass nested SELECT permissions
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (true);
