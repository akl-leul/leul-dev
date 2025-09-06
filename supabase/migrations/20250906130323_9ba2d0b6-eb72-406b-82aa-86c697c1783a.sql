-- Fix security issues: Enable RLS on existing tables that don't have it
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for existing tables
CREATE POLICY "Anyone can submit contact forms" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users only" 
ON public.users 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view restaurant tables" 
ON public.restaurant_tables 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage restaurant tables" 
ON public.restaurant_tables 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view tags" 
ON public.tags 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage tags" 
ON public.tags 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view post tags" 
ON public.post_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage post tags" 
ON public.post_tags 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;