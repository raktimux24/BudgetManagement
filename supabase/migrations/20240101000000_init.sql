-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.profiles;

-- Create tables with proper RLS
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text,
    email text,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    country text,
    bio text,
    profile_picture text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    budget numeric(10,2) NOT NULL DEFAULT 0,
    color text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,
    name text NOT NULL,
    amount numeric(10,2) NOT NULL,
    billing_cycle text NOT NULL,
    category text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    next_billing_date date,
    description text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Enable read access for authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for categories
CREATE POLICY "Enable read access for own categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own categories"
    ON public.categories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for subscriptions
CREATE POLICY "Enable read access for own subscriptions"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for own subscriptions"
    ON public.subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own subscriptions"
    ON public.subscriptions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own subscriptions"
    ON public.subscriptions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
