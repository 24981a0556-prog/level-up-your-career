
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- user_profile table
CREATE TABLE public.user_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  year INTEGER,
  branch TEXT,
  target_role TEXT,
  timeline_days INTEGER,
  goal_preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profile FOR UPDATE USING (auth.uid() = user_id);

-- student_academics table
CREATE TABLE public.student_academics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  subjects TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  manual_skills TEXT[] DEFAULT '{}',
  projects JSONB DEFAULT '[]',
  cgpa NUMERIC
);

ALTER TABLE public.student_academics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own academics" ON public.student_academics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academics" ON public.student_academics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own academics" ON public.student_academics FOR UPDATE USING (auth.uid() = user_id);

-- role_maps table (seeded data, public read)
CREATE TABLE public.role_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT NOT NULL UNIQUE,
  required_skills TEXT[] DEFAULT '{}',
  core_skills TEXT[] DEFAULT '{}'
);

ALTER TABLE public.role_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read role_maps" ON public.role_maps FOR SELECT USING (true);

-- subject_maps table (seeded data, public read)
CREATE TABLE public.subject_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name TEXT NOT NULL UNIQUE,
  skill_tags TEXT[] DEFAULT '{}'
);

ALTER TABLE public.subject_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read subject_maps" ON public.subject_maps FOR SELECT USING (true);

-- roadmap_tasks table
CREATE TABLE public.roadmap_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skill_tag TEXT,
  priority TEXT DEFAULT 'Medium',
  week_number INTEGER,
  estimated_time TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON public.roadmap_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.roadmap_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.roadmap_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.roadmap_tasks FOR DELETE USING (auth.uid() = user_id);

-- streaks table
CREATE TABLE public.streaks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  streak_count INTEGER DEFAULT 0,
  last_completed_date DATE
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);
