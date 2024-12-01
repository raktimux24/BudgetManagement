-- Add schedule review columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN schedule_review_enabled boolean DEFAULT false,
ADD COLUMN schedule_review_frequency text DEFAULT 'monthly',
ADD COLUMN last_review_date timestamptz,
ADD COLUMN next_review_date timestamptz;
