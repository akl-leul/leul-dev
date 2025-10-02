-- Update home_content table to include customization options
-- Remove my_story column and add customization fields
ALTER TABLE public.home_content
DROP COLUMN IF EXISTS my_story;

-- Add customization columns
ALTER TABLE public.home_content
ADD COLUMN IF NOT EXISTS background_image TEXT,
ADD COLUMN IF NOT EXISTS background_gradient TEXT DEFAULT 'linear-gradient(135deg, hsl(250, 70%, 15%), hsl(220, 70%, 10%))',
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT 'hsl(262, 83%, 58%)',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT 'hsl(180, 100%, 50%)',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'hsl(0, 0%, 100%)',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'hsl(262, 90%, 65%)';

-- Update existing record to have default values
UPDATE public.home_content
SET 
  background_gradient = 'linear-gradient(135deg, hsl(250, 70%, 15%), hsl(220, 70%, 10%))',
  primary_color = 'hsl(262, 83%, 58%)',
  secondary_color = 'hsl(180, 100%, 50%)',
  text_color = 'hsl(0, 0%, 100%)',
  accent_color = 'hsl(262, 90%, 65%)'
WHERE background_gradient IS NULL;