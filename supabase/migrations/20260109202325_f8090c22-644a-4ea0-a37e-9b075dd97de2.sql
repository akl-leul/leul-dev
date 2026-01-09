-- Create storage bucket for page builder images
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-builder-images', 'page-builder-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for page builder images
CREATE POLICY "Anyone can view page builder images"
ON storage.objects FOR SELECT
USING (bucket_id = 'page-builder-images');

CREATE POLICY "Authenticated users can upload page builder images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'page-builder-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their page builder images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'page-builder-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete page builder images"
ON storage.objects FOR DELETE
USING (bucket_id = 'page-builder-images' AND auth.role() = 'authenticated');