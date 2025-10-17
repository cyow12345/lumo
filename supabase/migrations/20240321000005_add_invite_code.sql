-- Add invite_code column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Create function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update existing rows with invite codes
UPDATE public.user_profiles
SET invite_code = (SELECT generate_invite_code())
WHERE invite_code IS NULL;

-- Make invite_code NOT NULL after setting initial values
ALTER TABLE public.user_profiles
ALTER COLUMN invite_code SET NOT NULL;

-- Create trigger to automatically set invite_code for new users
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code = (SELECT generate_invite_code());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invite_code_trigger
    BEFORE INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_invite_code(); 