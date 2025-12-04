-- Add gallery_images column to projects table for storing multiple images
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';