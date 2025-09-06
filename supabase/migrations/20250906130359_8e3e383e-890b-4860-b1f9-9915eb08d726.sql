-- Enable RLS on all remaining tables that might not have it
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for categories
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.role() = 'authenticated');