-- Fix any remaining functions with mutable search_path
-- Update update_updated_at_column function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update touch_projects_updated_at function
DROP FUNCTION IF EXISTS touch_projects_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.touch_projects_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Update log_project_changes function
DROP FUNCTION IF EXISTS log_project_changes() CASCADE;

CREATE OR REPLACE FUNCTION public.log_project_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  diff JSONB := '{}'::jsonb;
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN 
    diff := jsonb_set(diff, '{name}', jsonb_build_object('from', OLD.name, 'to', NEW.name)); 
  END IF;
  IF NEW.deadline IS DISTINCT FROM OLD.deadline THEN 
    diff := jsonb_set(diff, '{deadline}', jsonb_build_object('from', OLD.deadline, 'to', NEW.deadline)); 
  END IF;
  IF NEW.price IS DISTINCT FROM OLD.price THEN 
    diff := jsonb_set(diff, '{price}', jsonb_build_object('from', OLD.price, 'to', NEW.price)); 
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN 
    diff := jsonb_set(diff, '{status}', jsonb_build_object('from', OLD.status, 'to', NEW.status)); 
  END IF;
  IF NEW.progress IS DISTINCT FROM OLD.progress THEN 
    diff := jsonb_set(diff, '{progress}', jsonb_build_object('from', OLD.progress, 'to', NEW.progress)); 
  END IF;

  IF diff <> '{}'::jsonb THEN
    INSERT INTO public.project_logs (project_id, user_id, change)
    VALUES (NEW.id, NEW.user_id, diff);
  END IF;

  RETURN NEW;
END;
$$;