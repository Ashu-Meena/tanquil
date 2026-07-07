-- Fix Admin Panel visibility for Orders
-- 1. Ensure the is_admin helper function exists and works
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop any existing admin policies for orders to avoid duplicates
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;

-- 3. Create the definitive policy allowing admins to read/update/delete all orders
CREATE POLICY "Admins have full access to orders" 
ON public.orders FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());
