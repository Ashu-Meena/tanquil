-- =======================================================================================
-- TRANQUIL LUXURY FASHION: FIX ORDER ITEMS RLS
-- Phase 15 Migration
-- =======================================================================================
-- The previous security lockdown caused guest checkout order_items to fail 
-- because guest users do not have SELECT permissions on their own orders.
-- This script fixes it by using a SECURITY DEFINER function to securely verify ownership.

-- 1. Create a secure function that runs as database owner
CREATE OR REPLACE FUNCTION public.check_order_ownership(check_order_id UUID)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = check_order_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update the policy to use the secure function
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

CREATE POLICY "Users can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (
    public.check_order_ownership(order_id)
);
