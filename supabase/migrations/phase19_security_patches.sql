-- =======================================================================================
-- TRANQUIL LUXURY FASHION: SECURITY PATCHES V3 (AGGRESSIVE CLEANUP)
-- =======================================================================================

-- We explicitly drop ANY policy that might be allowing uploads to payment_screenshots
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'INSERT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Now we recreate ONLY the secure ones

-- 1. Secure Uploads for payment screenshots (only images)
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment_screenshots'
  AND (
    name ILIKE '%.jpg' OR 
    name ILIKE '%.jpeg' OR 
    name ILIKE '%.png' OR 
    name ILIKE '%.webp'
  )
);

-- 2. Secure Uploads for public-assets (Admins only)
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'public-assets' AND public.is_admin());

-- 3. PATCH PRIVILEGE ESCALATION ON `profiles` TABLE
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin OR NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      NEW.is_admin = OLD.is_admin;
      NEW.role = OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_privilege_escalation();

-- 4. PATCH PERMISSIVE ORDER ITEMS INSERTION
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

CREATE POLICY "Users can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_id AND (user_id = auth.uid() OR user_id IS NULL)
  )
);
