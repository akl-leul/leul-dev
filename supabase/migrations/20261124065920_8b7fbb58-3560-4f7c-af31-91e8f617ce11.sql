DROP POLICY IF EXISTS "Enable update for authenticated users on comments" ON public.comments;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Admins can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Admins can create order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Admins can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can add likes" ON public.post_likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
CREATE POLICY "Likes on published posts can be added" ON public.post_likes FOR INSERT
  WITH CHECK (user_id IS NOT NULL AND (auth.uid() IS NULL OR user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.published = true));
CREATE POLICY "Likes on published posts are viewable" ON public.post_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.published = true));

DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.app_settings;
CREATE POLICY "Public site settings are viewable" ON public.app_settings FOR SELECT
  USING (setting_key IN ('site_name','site_description','site_url','meta_keywords','favicon_url','og_image_url'));