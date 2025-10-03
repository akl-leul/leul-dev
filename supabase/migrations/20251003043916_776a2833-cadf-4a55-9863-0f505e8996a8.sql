-- Update RLS policies for comments to allow anonymous submissions

-- Drop existing insert policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;

-- Create new policy to allow anyone to insert comments (anonymous or authenticated)
CREATE POLICY "Anyone can submit comments"
ON public.comments
FOR INSERT
WITH CHECK (
  -- Either anonymous (user_id is null) or authenticated user owns the comment
  user_id IS NULL OR user_id = auth.uid()
);

-- Add policy for admins to manage all comments (approve, delete, etc.)
CREATE POLICY "Admins can manage all comments"
ON public.comments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  )
);

-- Add policy to allow comment authors to delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id);

-- Update the existing select policy to show approved comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;

CREATE POLICY "Approved comments are viewable by everyone"
ON public.comments
FOR SELECT
USING (approved = true OR auth.uid() = user_id OR is_admin(auth.uid()));