-- Create the user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Persönliche Infos
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    gender TEXT NOT NULL,
    relationship_start_date DATE,

    -- Bindungsstil
    evening_alone TEXT,
    separation_anxiety INTEGER CHECK (separation_anxiety BETWEEN 1 AND 5),
    attachment_style TEXT,

    -- Kommunikationsstil
    addressing_issues TEXT,
    emotional_expression INTEGER CHECK (emotional_expression BETWEEN 1 AND 5),
    hurt_response TEXT,

    -- Konfliktverhalten
    previous_conflict TEXT,
    emotional_conflicts INTEGER CHECK (emotional_conflicts BETWEEN 1 AND 5),
    criticism_response TEXT,

    -- Persönlichkeit
    openness INTEGER CHECK (openness BETWEEN 1 AND 5),
    extraversion INTEGER CHECK (extraversion BETWEEN 1 AND 5),
    conscientiousness INTEGER CHECK (conscientiousness BETWEEN 1 AND 5),
    agreeableness INTEGER CHECK (agreeableness BETWEEN 1 AND 5),
    neuroticism INTEGER CHECK (neuroticism BETWEEN 1 AND 5),

    -- Werte
    relationship_values TEXT[] NOT NULL DEFAULT '{}',
    fidelity_meaning TEXT,
    values_priority JSONB NOT NULL DEFAULT '{
        "vertrauen": 1,
        "leidenschaft": 1,
        "unabhaengigkeit": 1,
        "humor": 1,
        "treue": 1
    }',

    -- Kindheit & Prägung
    parental_influence TEXT,
    trust_experience TEXT,
    parental_patterns TEXT,

    -- Optionale Features
    whatsapp_import BOOLEAN DEFAULT false,
    astrology BOOLEAN DEFAULT false,
    birth_date DATE,
    birth_time TIME,
    birth_place TEXT
);

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
    ON public.user_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 