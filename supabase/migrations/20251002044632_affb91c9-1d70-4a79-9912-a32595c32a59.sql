-- Clean up duplicate RLS policies on post_likes table
-- Keep only the permissive policies that allow anyone to like/unlike

DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.post_likes;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;

-- Ensure we have the correct policies for anonymous liking
DROP POLICY IF EXISTS "Anyone can add likes" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can remove likes" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;

-- Create clean policies that allow anyone (anonymous or authenticated) to like
CREATE POLICY "Anyone can view likes"
ON public.post_likes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add likes"
ON public.post_likes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can remove likes"
ON public.post_likes
FOR DELETE
USING (true);