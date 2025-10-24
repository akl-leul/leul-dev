-- Create the comment_likes table to track likes on comments.
-- This table stores a many-to-many relationship between comments and anonymous users.
CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id BIGINT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Define the composite primary key to ensure a user can only like a comment once.
  PRIMARY KEY (comment_id, user_id),

  -- Foreign key constraint to ensure that the comment_id exists in the comments table.
  -- On deletion of a comment, the corresponding likes will also be removed.
  CONSTRAINT fk_comment
    FOREIGN KEY(comment_id)
    REFERENCES public.comments(id)
    ON DELETE CASCADE
);

-- Add comments to the table and columns for clarity.
COMMENT ON TABLE public.comment_likes IS 'Tracks user likes on comments.';
COMMENT ON COLUMN public.comment_likes.comment_id IS 'The ID of the comment being liked.';
COMMENT ON COLUMN public.comment_likes.user_id IS 'The anonymous user ID who liked the comment.';
COMMENT ON COLUMN public.comment_likes.created_at IS 'The timestamp when the like was created.';

-- Drop existing triggers and function if they exist, to allow for idempotent script execution.
DROP TRIGGER IF EXISTS on_comment_like_insert ON public.comment_likes;
DROP TRIGGER IF EXISTS on_comment_like_delete ON public.comment_likes;
DROP FUNCTION IF EXISTS public.update_comment_likes_count();

-- Create the trigger function to update the likes_count on the comments table.
-- This function is called by triggers when a row is inserted into or deleted from comment_likes.
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If a new like is added, increment the likes_count for the corresponding comment.
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;

  -- If a like is removed, decrement the likes_count for the corresponding comment.
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.comments
    SET likes_count = likes_count - 1
    WHERE id = OLD.comment_id AND likes_count > 0; -- Prevent going below 0
    RETURN OLD;
  END IF;

  -- For any other operation, do nothing.
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls the function after a new like is inserted.
CREATE TRIGGER on_comment_like_insert
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_comment_likes_count();

-- Create a trigger that calls the function after a like is deleted.
CREATE TRIGGER on_comment_like_delete
  AFTER DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_comment_likes_count();
