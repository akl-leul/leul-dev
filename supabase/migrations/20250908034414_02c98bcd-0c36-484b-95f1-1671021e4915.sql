-- Fix security warning: Drop trigger first, then function, then recreate both
DROP TRIGGER IF EXISTS update_likes_count_trigger ON post_likes;
DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
DROP FUNCTION IF EXISTS update_post_likes_count() CASCADE;

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();