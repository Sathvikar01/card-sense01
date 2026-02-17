-- Fix difficulty constraint to include all difficulty levels
-- Run this if you've already created the table with the old migration

-- Drop the old constraint
ALTER TABLE public.education_articles DROP CONSTRAINT IF EXISTS education_articles_difficulty_check;

-- Add the new constraint with all difficulty levels
ALTER TABLE public.education_articles
  ADD CONSTRAINT education_articles_difficulty_check
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'beginner_to_intermediate', 'intermediate_to_advanced'));
