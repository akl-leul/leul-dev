-- Comprehensive migration to fix comments and likes functionality
-- Run this in the Supabase SQL Editor

-- 1. Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id INTEGER NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL DEFAULT false,
  replies_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS on comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent_created_at ON public.comments(post_id, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.comments(approved);

-- 4. Create comment_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id INTEGER NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID, -- can store authenticated or anonymous UUID (from client)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS on comment_likes table
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 6. Create indexes for comment_likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_comment ON public.comment_likes(user_id, comment_id);

-- 7. Create unique index to prevent duplicate likes per user per comment
CREATE UNIQUE INDEX IF NOT EXISTS uq_comment_likes_user_comment_nonnull
ON public.comment_likes(comment_id, user_id)
WHERE user_id IS NOT NULL;

-- 8. Create admin_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 10. Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = is_admin.user_id
  );
END;
$$;

-- 11. Create RLS policies for comments
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON public.comments;
CREATE POLICY "Approved comments are viewable by everyone"
ON public.comments
FOR SELECT
USING (approved = true);

DROP POLICY IF EXISTS "Anyone can submit comments" ON public.comments;
CREATE POLICY "Anyone can submit comments"
ON public.comments
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all comments" ON public.comments;
CREATE POLICY "Admins can manage all comments"
ON public.comments
FOR ALL
USING (is_admin(auth.uid()));

-- 12. Create RLS policies for comment_likes
DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.comment_likes;
CREATE POLICY "Anyone can view comment likes"
ON public.comment_likes
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can add comment likes" ON public.comment_likes;
CREATE POLICY "Anyone can add comment likes"
ON public.comment_likes
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can remove comment likes" ON public.comment_likes;
CREATE POLICY "Anyone can remove comment likes"
ON public.comment_likes
FOR DELETE
USING (true);

-- 13. Create RLS policies for admin_roles
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
CREATE POLICY "Admins can view admin roles"
ON public.admin_roles
FOR SELECT
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage admin roles" ON public.admin_roles;
CREATE POLICY "Admins can manage admin roles"
ON public.admin_roles
FOR ALL
USING (is_admin(auth.uid()));

-- 14. Create function to maintain replies_count on parent comments
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

-- 15. Create function to maintain likes_count on comments
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

-- 16. Create triggers for replies count
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

-- 17. Create trigger for likes count
DROP TRIGGER IF EXISTS trg_update_comment_likes_count ON public.comment_likes;

CREATE TRIGGER trg_update_comment_likes_count
AFTER INSERT OR DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_likes_count();

-- 18. Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 19. Insert a test admin role (replace with your actual user ID)
-- You can get your user ID from the auth.users table
-- INSERT INTO public.admin_roles (user_id, role) 
-- VALUES ('your-user-id-here', 'admin')
-- ON CONFLICT (user_id) DO NOTHING;

-- Success message
SELECT 'Comments and likes functionality has been set up successfully!' as message;
