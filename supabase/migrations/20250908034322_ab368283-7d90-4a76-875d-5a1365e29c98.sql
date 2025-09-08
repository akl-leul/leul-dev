-- Add likes functionality to blog posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create post_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_likes
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can add likes" ON post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove likes" ON post_likes FOR DELETE USING (true);

-- Create trigger to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for project images
CREATE POLICY "Project images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images' 
  AND auth.role() = 'authenticated'
);