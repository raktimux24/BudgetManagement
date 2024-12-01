-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add user_id to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id to categories if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'categories' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public.categories 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id to subscriptions if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'subscriptions' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing rows with the user_id if there's authenticated data
UPDATE public.profiles
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE public.categories
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE public.subscriptions
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- Make user_id NOT NULL after populating data
ALTER TABLE public.profiles
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.categories
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.subscriptions
ALTER COLUMN user_id SET NOT NULL;
