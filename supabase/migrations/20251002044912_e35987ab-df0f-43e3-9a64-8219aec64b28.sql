-- Remove the foreign key constraint on post_likes.user_id
-- This allows anonymous users (with generated UUIDs) to like posts
ALTER TABLE public.post_likes
DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

-- Also drop any other user_id foreign key constraints that might exist
ALTER TABLE public.post_likes
DROP CONSTRAINT IF EXISTS fk_post_likes_user_id;