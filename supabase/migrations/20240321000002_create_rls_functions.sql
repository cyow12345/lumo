-- Function to disable RLS for user_profiles table
CREATE OR REPLACE FUNCTION disable_rls_for_user_profiles()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable RLS for user_profiles table
CREATE OR REPLACE FUNCTION enable_rls_for_user_profiles()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 