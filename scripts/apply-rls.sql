-- First, ensure the tables exist and have the required structure
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.subscriptions;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    bio TEXT,
    profile_picture TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    budget NUMERIC(10,2) NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    next_billing_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.categories;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.subscriptions;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles select policy"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Profiles insert policy"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profiles update policy"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Profiles delete policy"
ON public.profiles FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for categories
CREATE POLICY "Categories select policy"
ON public.categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Categories insert policy"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Categories update policy"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Categories delete policy"
ON public.categories FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for subscriptions
CREATE POLICY "Subscriptions select policy"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Subscriptions insert policy"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Subscriptions update policy"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Subscriptions delete policy"
ON public.subscriptions FOR DELETE
USING (auth.uid() = user_id);

-- Create updated trigger function
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS set_user_id_profiles ON public.profiles;
CREATE TRIGGER set_user_id_profiles
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_categories ON public.categories;
CREATE TRIGGER set_user_id_categories
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_subscriptions ON public.subscriptions;
CREATE TRIGGER set_user_id_subscriptions
  BEFORE INSERT ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
