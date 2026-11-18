
-- ===== Site content tables: public read stays, writes admin-only =====
DROP POLICY IF EXISTS "Authenticated users can manage about content" ON public.about_content;
CREATE POLICY "Admins can manage about content" ON public.about_content FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can manage post tags" ON public.post_tags;
CREATE POLICY "Admins can manage post tags" ON public.post_tags FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can manage home content" ON public.home_content;
CREATE POLICY "Admins can manage home content" ON public.home_content FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can manage contact content" ON public.contact_content;
CREATE POLICY "Admins can manage contact content" ON public.contact_content FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Authenticated users can manage restaurant tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Anyone can view restaurant tables" ON public.restaurant_tables;
CREATE POLICY "Admins can manage restaurant tables" ON public.restaurant_tables FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ===== Contact / form submissions =====
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON public.contacts;
CREATE POLICY "Admins can view contacts" ON public.contacts FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contacts;
CREATE POLICY "Anyone can submit contact forms" ON public.contacts FOR INSERT TO anon, authenticated
  WITH CHECK (read = false AND length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(subject) BETWEEN 1 AND 300 AND length(message) BETWEEN 1 AND 5000);

DROP POLICY IF EXISTS "Authenticated users can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(subject) BETWEEN 1 AND 300 AND length(message) BETWEEN 1 AND 5000);

DROP POLICY IF EXISTS "Anyone can submit forms" ON public.form_submissions;
CREATE POLICY "Anyone can submit forms" ON public.form_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (length(form_id) BETWEEN 1 AND 200 AND pg_column_size(data) < 65536);

DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;
CREATE POLICY "Anyone can submit job applications" ON public.job_applications FOR INSERT TO anon, authenticated
  WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND length(full_name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320);

-- ===== Comments =====
DROP POLICY IF EXISTS "Enable delete for authenticated users on comments" ON public.comments;

-- ===== Project logs =====
DROP POLICY IF EXISTS "Authenticated users can create project logs" ON public.project_logs;

-- ===== Legacy users table =====
DROP POLICY IF EXISTS "Admin users only" ON public.users;
DROP POLICY IF EXISTS "Allow public read access on users" ON public.users;
CREATE POLICY "Admins can manage users" ON public.users FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ===== Admin users table (password hashes) =====
DROP POLICY IF EXISTS "Anyone can view admin users for login" ON public.admin_users;

-- ===== Admin roles =====
DROP POLICY IF EXISTS "Admin roles readable for role checks" ON public.admin_roles;
CREATE POLICY "Users can read own admin role" ON public.admin_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ===== Page views =====
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK ((user_id IS NULL OR user_id = auth.uid()) AND length(page_path) BETWEEN 1 AND 2048);

-- ===== Restaurant leftovers: admin only =====
DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;
CREATE POLICY "Admins can manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ===== Notifications =====
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Users or admins can insert notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ===== Likes =====
DROP POLICY IF EXISTS "Anyone can remove likes" ON public.post_likes;
CREATE POLICY "Users can remove own likes" ON public.post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Enable insert for authenticated and anon users on comment_likes" ON public.comment_likes;
CREATE POLICY "Users can like comments" ON public.comment_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ===== Profiles =====
DROP POLICY IF EXISTS "Allow all authenticated to view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Owner profile is public; users see own" ON public.profiles FOR SELECT
  USING (id = '0282d3df-966e-4c01-afcf-a7d3e88642ca'::uuid OR id = auth.uid() OR public.is_admin(auth.uid()));

-- ===== Project tasks =====
DROP POLICY IF EXISTS "Allow all authenticated to view tasks" ON public.project_tasks;

-- ===== Page versions =====
DROP POLICY IF EXISTS "Users can view page versions" ON public.page_versions;
CREATE POLICY "Creators and admins can view page versions" ON public.page_versions FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.is_admin(auth.uid()));

-- ===== App settings =====
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.app_settings;
CREATE POLICY "Admins can manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ===== Storage: writes admin-only (task attachments owner-scoped) =====
DROP POLICY IF EXISTS "Allow authenticated uploads to project-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete home images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete page builder images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update home images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their blog media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their page builder images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload home images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload page builder images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own project images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own project images" ON storage.objects;

CREATE POLICY "Admins can upload site images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('project-images','blog-images','blog-media','home-images','page-builder-images') AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can update site images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('project-images','blog-images','blog-media','home-images','page-builder-images') AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id IN ('project-images','blog-images','blog-media','home-images','page-builder-images') AND public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete site images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('project-images','blog-images','blog-media','home-images','page-builder-images') AND public.is_admin(auth.uid()));
CREATE POLICY "Users can upload own task attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-attachments' AND (auth.uid())::text = (storage.foldername(name))[1]);
