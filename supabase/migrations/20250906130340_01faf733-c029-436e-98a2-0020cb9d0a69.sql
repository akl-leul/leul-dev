-- Create categories table for blog posts (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    CREATE TABLE public.categories (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Create posts table for blog (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    CREATE TABLE public.posts (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      featured_image TEXT,
      published BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMP WITH TIME ZONE,
      author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      category_id UUID REFERENCES public.categories(id),
      tags TEXT[],
      views INTEGER NOT NULL DEFAULT 0,
      reading_time INTEGER NOT NULL DEFAULT 5,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Published posts are viewable by everyone" 
    ON public.posts 
    FOR SELECT 
    USING (published = true OR auth.uid() = author_id);

    CREATE POLICY "Users can manage their own posts" 
    ON public.posts 
    FOR ALL 
    USING (auth.uid() = author_id);
  END IF;
END $$;

-- Create projects table (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    CREATE TABLE public.projects (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT,
      image_url TEXT,
      github_url TEXT,
      demo_url TEXT,
      tech_stack TEXT[],
      featured BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'completed',
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Projects are viewable by everyone" 
    ON public.projects 
    FOR SELECT 
    USING (true);

    CREATE POLICY "Users can manage their own projects" 
    ON public.projects 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create skills table (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'skills') THEN
    CREATE TABLE public.skills (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'intermediate',
      icon TEXT,
      category TEXT NOT NULL DEFAULT 'technical',
      years_experience INTEGER DEFAULT 1,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Skills are viewable by everyone" 
    ON public.skills 
    FOR SELECT 
    USING (true);

    CREATE POLICY "Users can manage their own skills" 
    ON public.skills 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create experiences table (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'experiences') THEN
    CREATE TABLE public.experiences (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      company_url TEXT,
      location TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      current BOOLEAN NOT NULL DEFAULT false,
      description TEXT,
      achievements TEXT[],
      tech_used TEXT[],
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Experiences are viewable by everyone" 
    ON public.experiences 
    FOR SELECT 
    USING (true);

    CREATE POLICY "Users can manage their own experiences" 
    ON public.experiences 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create contact_submissions table (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_submissions') THEN
    CREATE TABLE public.contact_submissions (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can submit contact forms" 
    ON public.contact_submissions 
    FOR INSERT 
    WITH CHECK (true);

    CREATE POLICY "Authenticated users can view contact submissions" 
    ON public.contact_submissions 
    FOR SELECT 
    USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Add missing columns to existing profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='name') THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='location') THEN
    ALTER TABLE public.profiles ADD COLUMN location TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='website') THEN
    ALTER TABLE public.profiles ADD COLUMN website TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='github_url') THEN
    ALTER TABLE public.profiles ADD COLUMN github_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='linkedin_url') THEN
    ALTER TABLE public.profiles ADD COLUMN linkedin_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='twitter_url') THEN
    ALTER TABLE public.profiles ADD COLUMN twitter_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='resume_url') THEN
    ALTER TABLE public.profiles ADD COLUMN resume_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='user_id') THEN
    ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update profiles table to use user_id instead of id for auth reference
DO $$
BEGIN
  IF EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='user_id') THEN
    UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
  END IF;
END $$;

-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insert some default categories (if not exists)
INSERT INTO public.categories (name, slug, description) 
SELECT 'Technology', 'technology', 'Posts about technology and programming'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'technology');

INSERT INTO public.categories (name, slug, description) 
SELECT 'Personal', 'personal', 'Personal thoughts and experiences'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'personal');

INSERT INTO public.categories (name, slug, description) 
SELECT 'Tutorials', 'tutorials', 'Step-by-step guides and tutorials'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'tutorials');

INSERT INTO public.categories (name, slug, description) 
SELECT 'Projects', 'projects', 'Project showcases and case studies'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'projects');