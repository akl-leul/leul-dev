-- Create table for page templates
CREATE TABLE public.page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '[]',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for page versions (version control)
CREATE TABLE public.page_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.dynamic_pages(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);

-- Add builder_content column to dynamic_pages for storing JSON structure
ALTER TABLE public.dynamic_pages 
ADD COLUMN IF NOT EXISTS builder_content JSONB DEFAULT '[]';

-- Add use_builder column to track if page uses builder or raw HTML
ALTER TABLE public.dynamic_pages 
ADD COLUMN IF NOT EXISTS use_builder BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for page_templates
CREATE POLICY "Users can view public templates or their own" 
ON public.page_templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own templates" 
ON public.page_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" 
ON public.page_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" 
ON public.page_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS policies for page_versions
CREATE POLICY "Users can view page versions" 
ON public.page_versions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create page versions" 
ON public.page_versions 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create index for faster version lookups
CREATE INDEX idx_page_versions_page_id ON public.page_versions(page_id);
CREATE INDEX idx_page_versions_version ON public.page_versions(page_id, version_number DESC);

-- Trigger for updated_at
CREATE TRIGGER update_page_templates_updated_at
BEFORE UPDATE ON public.page_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();