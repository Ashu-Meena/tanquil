-- =======================================================================================
-- TRANQUIL LUXURY FASHION: SECURITY LOCKDOWN
-- Phase 13 Migration
-- =======================================================================================

-- ==========================================
-- 1. STORAGE BUCKET LOCKDOWN
-- ==========================================
-- Drop existing open public policies
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;

-- Create secure admin-only policies for mutations
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'public-assets' AND public.is_admin());

CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'public-assets' AND public.is_admin());

CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'public-assets' AND public.is_admin());


-- ==========================================
-- 2. PROFILE PRIVILEGE ESCALATION PREVENTION
-- ==========================================
-- Ensure users cannot manually update their is_admin or role columns
CREATE OR REPLACE FUNCTION public.protect_admin_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user executing the query is NOT already an admin
    IF NOT public.is_admin() THEN
        -- Revert any attempts to modify sensitive columns back to their original values
        NEW.is_admin = OLD.is_admin;
        NEW.role = OLD.role;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_admin_escalation ON public.profiles;
CREATE TRIGGER trigger_protect_admin_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_admin_escalation();


-- ==========================================
-- 3. ORDER ITEMS INJECTION PREVENTION
-- ==========================================
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

-- Restrict to the owner of the parent order
CREATE POLICY "Users can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    )
);


-- ==========================================
-- 4. CARTS AND CART ITEMS SECURITY
-- ==========================================
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Drop any existing just in case
DROP POLICY IF EXISTS "Users manage own carts" ON public.carts;
DROP POLICY IF EXISTS "Admins have full access to carts" ON public.carts;
DROP POLICY IF EXISTS "Users manage own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Admins have full access to cart_items" ON public.cart_items;

-- Users can select, insert, update, delete their own carts
CREATE POLICY "Users manage own carts"
ON public.carts FOR ALL
USING (
    user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
)
WITH CHECK (
    user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
);

-- Users can select, insert, update, delete their own cart items
CREATE POLICY "Users manage own cart items"
ON public.cart_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.carts 
        WHERE carts.id = cart_id 
        AND (carts.user_id = auth.uid() OR (carts.user_id IS NULL AND carts.session_id IS NOT NULL))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.carts 
        WHERE carts.id = cart_id 
        AND (carts.user_id = auth.uid() OR (carts.user_id IS NULL AND carts.session_id IS NOT NULL))
    )
);

-- Admins can manage all carts
CREATE POLICY "Admins have full access to carts"
ON public.carts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to cart_items"
ON public.cart_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
