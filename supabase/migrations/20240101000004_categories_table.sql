-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    budget numeric(10,2) NOT NULL DEFAULT 0,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own categories"
    ON public.categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
