-- Create home_content table for editable hero section
CREATE TABLE IF NOT EXISTS public.home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  hero_image TEXT,
  my_story TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view home content
CREATE POLICY "Anyone can view home content"
  ON public.home_content
  FOR SELECT
  USING (true);

-- Only authenticated users can manage home content
CREATE POLICY "Authenticated users can manage home content"
  ON public.home_content
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default content
INSERT INTO public.home_content (name, tagline, my_story)
VALUES (
  'Leul Ayfokru',
  'Full-stack website and application developer based in Ethiopia.',
  'I am a passionate full-stack developer with expertise in building modern web applications. My journey in technology has been driven by curiosity and a desire to create impactful solutions.'
);

-- Create trigger for updated_at
CREATE TRIGGER update_home_content_updated_at
  BEFORE UPDATE ON public.home_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();