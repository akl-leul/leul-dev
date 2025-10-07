-- Create storage bucket for home images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'home-images',
  'home-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for home-images bucket
CREATE POLICY "Anyone can view home images"
ON storage.objects FOR SELECT
USING (bucket_id = 'home-images');

CREATE POLICY "Authenticated users can upload home images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'home-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update home images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'home-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete home images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'home-images' 
  AND auth.role() = 'authenticated'
);