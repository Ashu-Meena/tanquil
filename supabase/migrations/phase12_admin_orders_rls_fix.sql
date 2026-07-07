-- Drop the function-based policy that might be failing due to SECURITY DEFINER / search_path issues
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;

-- Create a direct subquery policy
-- This works because admins are allowed to read their own profiles via the "Users can read own profile" policy.
CREATE POLICY "Admins have full access to orders" 
ON public.orders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND (profiles.is_admin = true OR profiles.role = 'super_admin')
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND (profiles.is_admin = true OR profiles.role = 'super_admin')
  )
);
