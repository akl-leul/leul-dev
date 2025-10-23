-- Create comments table for blog posts
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

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent_created_at ON public.comments(post_id, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.comments(approved);

-- RLS Policies
CREATE POLICY "Approved comments are viewable by everyone"
ON public.comments
FOR SELECT
USING (approved = true);

CREATE POLICY "Anyone can submit comments"
ON public.comments
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to check if user is admin
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

-- Admin policy for managing all comments
CREATE POLICY "Admins can manage all comments"
ON public.comments
FOR ALL
USING (is_admin(auth.uid()));

-- Create admin_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Admin roles policies
CREATE POLICY "Admins can view admin roles"
ON public.admin_roles
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin roles"
ON public.admin_roles
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updating updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
