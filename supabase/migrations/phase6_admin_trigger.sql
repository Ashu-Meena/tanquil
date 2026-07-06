-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, is_admin)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    'customer', 
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (so this script is safely re-runnable)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Bind the trigger to the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- For any users that you ALREADY created in the Auth panel that didn't get a profile:
-- This will insert them into the profiles table so you can edit them.
INSERT INTO public.profiles (id, email, role, is_admin)
SELECT id, email, 'customer', false
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
