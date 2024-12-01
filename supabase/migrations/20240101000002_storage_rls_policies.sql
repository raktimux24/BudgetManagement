-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public viewing of profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile pictures" ON storage.objects;

-- Create the bucket if it doesn't exist with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies for profile pictures
CREATE POLICY "Allow public viewing of profile pictures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-pictures'
  AND (storage.foldername(name))[1] IS NOT NULL  -- Ensure the path is valid
);

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Allow users to upload their own profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'profile-picture.png'  -- Enforce filename pattern
);

-- Allow users to update their own profile pictures
CREATE POLICY "Allow users to update their own profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'profile-picture.png'  -- Enforce filename pattern
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Allow users to delete their own profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures'
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
