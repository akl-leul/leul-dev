-- Create form_submissions table for page builder forms
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id TEXT NOT NULL,
  page_id UUID REFERENCES public.dynamic_pages(id) ON DELETE CASCADE,
  form_name TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create component_templates table for reusable form/slider/accordion templates
CREATE TABLE public.component_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  component_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_templates ENABLE ROW LEVEL SECURITY;

-- Form submissions policies - admins can do everything
CREATE POLICY "Admins can manage form submissions"
ON public.form_submissions
FOR ALL
USING (public.is_admin(auth.uid()));

-- Anyone can insert form submissions (for public forms)
CREATE POLICY "Anyone can submit forms"
ON public.form_submissions
FOR INSERT
WITH CHECK (true);

-- Component templates policies
CREATE POLICY "Admins can manage component templates"
ON public.component_templates
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view public templates"
ON public.component_templates
FOR SELECT
USING (is_public = true);

-- Create updated_at trigger
CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_component_templates_updated_at
BEFORE UPDATE ON public.component_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();