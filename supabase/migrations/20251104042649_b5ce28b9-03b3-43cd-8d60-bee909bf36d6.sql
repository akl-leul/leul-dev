-- Create dynamic_pages table for custom pages
CREATE TABLE public.dynamic_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  password TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  meta_description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dynamic_pages ENABLE ROW LEVEL SECURITY;

-- Policies for dynamic_pages
CREATE POLICY "Anyone can view published pages"
  ON public.dynamic_pages
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all pages"
  ON public.dynamic_pages
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create navigation_items table
CREATE TABLE public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('navbar', 'footer')),
  is_external BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  section TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Policies for navigation_items
CREATE POLICY "Anyone can view visible navigation items"
  ON public.navigation_items
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins can manage navigation items"
  ON public.navigation_items
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create trigger for updating timestamps
CREATE TRIGGER update_dynamic_pages_updated_at
  BEFORE UPDATE ON public.dynamic_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_navigation_items_updated_at
  BEFORE UPDATE ON public.navigation_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default navigation items
INSERT INTO public.navigation_items (label, href, location, display_order, section) VALUES
  ('Home', '/', 'navbar', 1, NULL),
  ('About', '/about', 'navbar', 2, NULL),
  ('Skills', '/skills', 'navbar', 3, NULL),
  ('Projects', '/projects', 'navbar', 4, NULL),
  ('Blog', '/blog', 'navbar', 5, NULL),
  ('Contact', '/contact', 'navbar', 6, NULL),
  ('Home', '/', 'footer', 1, 'Navigation'),
  ('About', '/about', 'footer', 2, 'Navigation'),
  ('Skills', '/skills', 'footer', 3, 'Navigation'),
  ('Projects', '/projects', 'footer', 4, 'Navigation'),
  ('Blog', '/blog', 'footer', 5, 'Content'),
  ('Contact', '/contact', 'footer', 6, 'Content');