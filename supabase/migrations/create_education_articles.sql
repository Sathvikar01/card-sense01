-- Create education_articles table
CREATE TABLE IF NOT EXISTS public.education_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'beginner_to_intermediate', 'intermediate_to_advanced')),
  content TEXT NOT NULL,
  read_time_minutes INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_education_articles_category ON public.education_articles(category);
CREATE INDEX IF NOT EXISTS idx_education_articles_difficulty ON public.education_articles(difficulty);
CREATE INDEX IF NOT EXISTS idx_education_articles_is_published ON public.education_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_education_articles_view_count ON public.education_articles(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_education_articles_slug ON public.education_articles(slug);

-- Enable Row Level Security
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to published articles
CREATE POLICY "Allow public read access to published articles"
  ON public.education_articles
  FOR SELECT
  USING (is_published = true);

-- Create policy to allow authenticated users to read all articles
CREATE POLICY "Allow authenticated users to read all articles"
  ON public.education_articles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow service role full access
CREATE POLICY "Allow service role full access"
  ON public.education_articles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.education_articles IS 'Educational articles about credit cards, CIBIL scores, and financial literacy';
