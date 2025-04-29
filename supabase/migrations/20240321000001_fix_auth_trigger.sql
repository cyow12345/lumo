-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        name,
        age,
        gender
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Neuer Benutzer'),
        COALESCE((NEW.raw_user_meta_data->>'age')::int, 18),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'no_answer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow public access to auth.users for the trigger
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update the RLS policy for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" 
    ON public.user_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- This is important for the trigger
CREATE POLICY "Service role can insert to profiles" 
    ON public.user_profiles FOR INSERT 
    WITH CHECK (true); 