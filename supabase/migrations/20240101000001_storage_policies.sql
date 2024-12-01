-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the profile-pictures bucket
UPDATE storage.buckets
SET public = false
WHERE id = 'profile-pictures';

-- Create policies for profile pictures bucket
DROP POLICY IF EXISTS "Give users access to own folder 1" ON storage.objects;
CREATE POLICY "Give users access to own folder 1"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Give users access to own folder 2" ON storage.objects;
CREATE POLICY "Give users access to own folder 2"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Give users access to own folder 3" ON storage.objects;
CREATE POLICY "Give users access to own folder 3"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Give users access to own folder 4" ON storage.objects;
CREATE POLICY "Give users access to own folder 4"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
