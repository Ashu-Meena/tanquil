-- =======================================================================================
-- TRANQUIL LUXURY FASHION: ADMIN FULL ACCESS POLICIES
-- =======================================================================================
-- This script creates a helper function to identify admins and grants them 
-- full Read/Write/Update/Delete access to all critical tables.
-- =======================================================================================

-- 1. Create is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_admin = true OR role = 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on all tables that don't have it yet
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Grant ALL privileges to Admins on all relevant tables
DO $$ 
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'categories', 'products', 'product_images', 'product_variants',
            'homepage_sections', 'orders', 'order_items', 'coupons', 
            'store_settings', 'pages', 'blog_posts', 'reviews', 'profiles'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admins have full access to %I" ON public.%I', t_name, t_name);
        EXECUTE format('CREATE POLICY "Admins have full access to %I" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t_name, t_name, t_name, t_name);
    END LOOP;
END $$;

-- 4. Ensure authenticated users can still see their own orders/profiles
-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert orders (checkout)
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
CREATE POLICY "Users can insert orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Store Settings should be publicly readable
DROP POLICY IF EXISTS "Public can read store_settings" ON public.store_settings;
CREATE POLICY "Public can read store_settings"
ON public.store_settings FOR SELECT
USING (true);

-- Pages should be publicly readable
DROP POLICY IF EXISTS "Public can read pages" ON public.pages;
CREATE POLICY "Public can read pages"
ON public.pages FOR SELECT
USING (true);
