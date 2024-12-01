-- Add reminder_days column to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN reminder_days integer;

-- Update existing rows to have a default reminder of 3 days (optional)
UPDATE public.subscriptions
SET reminder_days = 3
WHERE reminder_days IS NULL;
