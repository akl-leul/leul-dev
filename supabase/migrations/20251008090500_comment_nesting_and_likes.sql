-- Add migration to support nested comments and likes for comments

-- Safe extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Extend comments table for nesting and like counts
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id INTEGER NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS replies_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- Helpful indexes for fetching threads
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent_created_at ON public.comments(post_id, parent_id, created_at DESC);

-- 2) Maintain replies_count on parent comments
CREATE OR REPLACE FUNCTION public.update_parent_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE public.comments
      SET replies_count = replies_count + 1
      WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE public.comments
      SET replies_count = GREATEST(replies_count - 1, 0)
      WHERE id = OLD.parent_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle moving a reply from one parent to another
    IF NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN
      IF OLD.parent_id IS NOT NULL THEN
        UPDATE public.comments
        SET replies_count = GREATEST(replies_count - 1, 0)
        WHERE id = OLD.parent_id;
      END IF;
      IF NEW.parent_id IS NOT NULL THEN
        UPDATE public.comments
        SET replies_count = replies_count + 1
        WHERE id = NEW.parent_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Drop and recreate triggers to ensure correct wiring
DROP TRIGGER IF EXISTS trg_comments_replies_count_ai ON public.comments;
DROP TRIGGER IF EXISTS trg_comments_replies_count_ad ON public.comments;
DROP TRIGGER IF EXISTS trg_comments_replies_count_au ON public.comments;

CREATE TRIGGER trg_comments_replies_count_ai
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_parent_replies_count();

CREATE TRIGGER trg_comments_replies_count_ad
AFTER DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_parent_replies_count();

CREATE TRIGGER trg_comments_replies_count_au
AFTER UPDATE OF parent_id ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_parent_replies_count();

-- 3) Comment likes table and counters
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id INTEGER NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID, -- can store authenticated or anonymous UUID (from client)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices to speed up lookups
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_comment ON public.comment_likes(user_id, comment_id);

-- Optionally, prevent duplicate likes per user per comment (for non-null user_id)
-- This keeps behavior consistent for identified users, while allowing null-based records
-- to exist without a uniqueness guarantee (matches prior post_likes behavior).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'uq_comment_likes_user_comment_nonnull'
  ) THEN
    CREATE UNIQUE INDEX uq_comment_likes_user_comment_nonnull
    ON public.comment_likes(comment_id, user_id)
    WHERE user_id IS NOT NULL;
  END IF;
END
$$;

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies mirroring post likes behavior
CREATE POLICY IF NOT EXISTS "Anyone can view comment likes"
ON public.comment_likes
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can add comment likes"
ON public.comment_likes
FOR INSERT
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can remove comment likes"
ON public.comment_likes
FOR DELETE
USING (true);

-- 4) Maintain likes_count on comments
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_comment_likes_count ON public.comment_likes;

CREATE TRIGGER trg_update_comment_likes_count
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_likes_count();

-- Notes:
-- - parent_id enables nested replies; replies_count helps render thread previews efficiently.
-- - comment_likes stores per-user (or per anonymous UUID) likes; likes_count materializes totals.
-- - RLS allows public like/unlike behavior consistent with existing post likes implementation.
