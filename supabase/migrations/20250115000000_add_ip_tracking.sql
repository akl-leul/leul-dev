-- Add IP address tracking to page_views table
ALTER TABLE public.page_views 
ADD COLUMN IF NOT EXISTS ip_address INET;

-- Create index for IP address queries
CREATE INDEX IF NOT EXISTS idx_page_views_ip_address ON public.page_views(ip_address);

-- Add device information columns
ALTER TABLE public.page_views 
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON public.page_views(device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON public.page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at_ip ON public.page_views(created_at, ip_address);
