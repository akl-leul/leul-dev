-- Create project_feedbacks table to collect public feedback on projects
-- Includes RLS policies that allow anyone to submit feedback,
-- public to read only approved feedback, and admins to manage all.

-- Enable required extension for UUID generation (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Table definition
CREATE TABLE IF NOT EXISTS public.project_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NULL, -- optional; when authenticated, store submitter's auth.uid()
  author_name TEXT NOT NULL,
  author_email TEXT NULL,
  rating SMALLINT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ NULL,
  approved_by UUID NULL, -- admin user id (no FK to auth.users for portability)
  response_message TEXT NULL, -- admin response to the feedback
  responded_at TIMESTAMPTZ NULL,
  responded_by UUID NULL, -- admin user id (no FK to auth.users for portability)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Helper function and trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_feedbacks_set_updated_at ON public.project_feedbacks;
CREATE TRIGGER trg_project_feedbacks_set_updated_at
BEFORE UPDATE ON public.project_feedbacks
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_project_feedbacks_project_id ON public.project_feedbacks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_feedbacks_approved ON public.project_feedbacks(approved);
CREATE INDEX IF NOT EXISTS idx_project_feedbacks_created_at ON public.project_feedbacks(created_at DESC);

-- 4) Enable RLS
ALTER TABLE public.project_feedbacks ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies

-- Anyone (anonymous or authenticated) can submit feedback.
-- If authenticated, they can optionally include their user_id = auth.uid().
CREATE POLICY "Anyone can submit project feedback"
ON public.project_feedbacks
FOR INSERT
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Public can view only approved feedback
CREATE POLICY "Approved project feedback is publicly visible"
ON public.project_feedbacks
FOR SELECT
USING (approved = true);

-- Feedback authors (authenticated submitters) can view their own feedback even if not yet approved
CREATE POLICY "Feedback authors can view their own feedback"
ON public.project_feedbacks
FOR SELECT
USING (auth.uid() = user_id);

-- Feedback authors can delete their own feedback
CREATE POLICY "Feedback authors can delete their own feedback"
ON public.project_feedbacks
FOR DELETE
USING (auth.uid() = user_id);

-- Optionally allow feedback authors to update their own feedback before it's approved
CREATE POLICY "Feedback authors can update their own unapproved feedback"
ON public.project_feedbacks
FOR UPDATE
USING (auth.uid() = user_id AND approved = false)
WITH CHECK (auth.uid() = user_id AND approved = false);

-- Admins can view, insert, update, and delete all feedback
-- Assumes existence of public.admin_roles(user_id UUID) table populated for admins.
CREATE POLICY "Admins can manage all project feedback (SELECT)"
ON public.project_feedbacks
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = auth.uid())
);

CREATE POLICY "Admins can manage all project feedback (INSERT)"
ON public.project_feedbacks
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = auth.uid())
);

CREATE POLICY "Admins can manage all project feedback (UPDATE)"
ON public.project_feedbacks
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = auth.uid())
);

CREATE POLICY "Admins can manage all project feedback (DELETE)"
ON public.project_feedbacks
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.admin_roles ar WHERE ar.user_id = auth.uid())
);

-- Notes:
-- - Admins should toggle `approved`, set `approved_at`, `approved_by`, and optionally add
--   `response_message`, `responded_at`, `responded_by`.
-- - Frontend can query approved feedback per project using:
--   select * from project_feedbacks where project_id = ? and approved = true order by created_at desc;
