-- =======================================================================================
-- TRANQUIL LUXURY FASHION: RESET ORDERS
-- =======================================================================================
-- This script will safely delete all past orders and restart the order sequence from 1.
-- WARNING: This will permanently delete all order history.
-- =======================================================================================

-- 1. Delete all existing orders. 
-- Note: 'order_items' table has ON DELETE CASCADE, so order items will be deleted automatically.
DELETE FROM public.orders;

-- 2. Reset the order number sequence back to 1
ALTER SEQUENCE IF EXISTS public.order_number_seq RESTART WITH 1;
