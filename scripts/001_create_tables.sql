-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_market TEXT,
  problem_statement TEXT,
  solution_hypothesis TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  linkedin_url TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  interview_type TEXT DEFAULT 'discovery',
  notes TEXT,
  key_insights TEXT[],
  pain_points TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_questions table
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  question_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (feed)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  interview_id UUID REFERENCES public.interviews(id) ON DELETE SET NULL,
  insight_text TEXT NOT NULL,
  category TEXT,
  importance TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for leads
CREATE POLICY "Users can view leads from their projects"
  ON public.leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = leads.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads to their projects"
  ON public.leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = leads.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads from their projects"
  ON public.leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = leads.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete leads from their projects"
  ON public.leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = leads.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for interviews
CREATE POLICY "Users can view interviews from their projects"
  ON public.interviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = interviews.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interviews to their projects"
  ON public.interviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = interviews.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interviews from their projects"
  ON public.interviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = interviews.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete interviews from their projects"
  ON public.interviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = interviews.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for interview_questions
CREATE POLICY "Users can view questions from their interviews"
  ON public.interview_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      JOIN public.projects ON projects.id = interviews.project_id
      WHERE interviews.id = interview_questions.interview_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions to their interviews"
  ON public.interview_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interviews
      JOIN public.projects ON projects.id = interviews.project_id
      WHERE interviews.id = interview_questions.interview_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions from their interviews"
  ON public.interview_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      JOIN public.projects ON projects.id = interviews.project_id
      WHERE interviews.id = interview_questions.interview_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions from their interviews"
  ON public.interview_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      JOIN public.projects ON projects.id = interviews.project_id
      WHERE interviews.id = interview_questions.interview_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for activities
CREATE POLICY "Users can view activities from their projects"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = activities.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activities to their projects"
  ON public.activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = activities.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for insights
CREATE POLICY "Users can view insights from their projects"
  ON public.insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = insights.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights to their projects"
  ON public.insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = insights.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update insights from their projects"
  ON public.insights FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = insights.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete insights from their projects"
  ON public.insights FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = insights.project_id
      AND projects.user_id = auth.uid()
    )
  );
