-- Enable RLS on profiles (in case it isn't already)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING ( true );

CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- Also, force the admin status again just to be absolutely sure!
INSERT INTO public.profiles (id, email, role, is_admin)
SELECT id, email, 'super_admin', true
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, role = 'super_admin';
