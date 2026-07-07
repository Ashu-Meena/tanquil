-- =======================================================================================
-- TRANQUIL LUXURY FASHION: SEQUENTIAL ORDER NUMBERS
-- Phase 14 Migration
-- =======================================================================================

-- 1. Create a sequence starting at 1
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- 2. Create a secure RPC function to fetch and format the next number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
DECLARE
    next_val integer;
BEGIN
    -- Get the next value from the sequence
    next_val := nextval('order_number_seq');
    
    -- Format it as ORD-0001
    -- LPAD pads the number with leading zeros up to 4 characters
    RETURN 'ORD-' || LPAD(next_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute permissions to anonymous and authenticated users so the checkout page can call it
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;
