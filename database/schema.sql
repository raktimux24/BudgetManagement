-- Create tables
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  bio TEXT,
  profile_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL,
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  description TEXT,
  reminder_days INTEGER NOT NULL,
  status TEXT NOT NULL,
  next_payment DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" 
  ON public.subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" 
  ON public.subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" 
  ON public.subscriptions FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own categories" 
  ON public.categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories" 
  ON public.categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" 
  ON public.categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" 
  ON public.categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();