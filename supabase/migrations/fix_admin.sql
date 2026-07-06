-- Force insert any missing users into the profiles table and make them ALL admins
INSERT INTO public.profiles (id, email, role, is_admin)
SELECT id, email, 'super_admin', true
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, role = 'super_admin';
