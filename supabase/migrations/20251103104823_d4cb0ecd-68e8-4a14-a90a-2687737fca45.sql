-- Create blog-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for blog-media bucket
CREATE POLICY "Authenticated users can upload blog media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "Anyone can view blog media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can update their blog media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-media')
WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can delete blog media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-media');