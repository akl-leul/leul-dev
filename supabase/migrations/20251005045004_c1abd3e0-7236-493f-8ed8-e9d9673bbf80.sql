-- Create page_views table for analytics
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  user_id UUID,
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all page views"
ON public.page_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
  )
);

-- Create index for better query performance
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);

-- Create about_content table
CREATE TABLE IF NOT EXISTS public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'About Me',
  intro TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view about content"
ON public.about_content
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage about content"
ON public.about_content
FOR ALL
USING (auth.role() = 'authenticated');

-- Create contact_content table
CREATE TABLE IF NOT EXISTS public.contact_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Get In Touch',
  description TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view contact content"
ON public.contact_content
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage contact content"
ON public.contact_content
FOR ALL
USING (auth.role() = 'authenticated');