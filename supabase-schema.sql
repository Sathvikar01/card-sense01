-- CardSense India - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  income_range TEXT,
  employment_type TEXT,
  primary_bank TEXT,
  cibil_score INTEGER,
  existing_cards JSONB DEFAULT '[]'::jsonb,
  fixed_deposits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Credit Cards Table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank TEXT NOT NULL,
  card_name TEXT NOT NULL,
  card_type TEXT NOT NULL, -- rewards, cashback, travel, premium, fuel, shopping, entry-level
  network TEXT, -- Visa, Mastercard, Amex, RuPay
  joining_fee INTEGER DEFAULT 0,
  annual_fee INTEGER DEFAULT 0,
  annual_fee_waiver_conditions TEXT,
  min_income_required INTEGER,
  min_cibil_score INTEGER DEFAULT 650,
  age_requirement TEXT DEFAULT '21-60 years',
  eligibility_criteria TEXT,
  reward_structure JSONB NOT NULL, -- {baseRate, categories: [{name, rate, cap}], caps: {monthly, quarterly, annual}}
  welcome_benefits JSONB DEFAULT '[]'::jsonb,
  key_features TEXT[],
  pros TEXT[],
  cons TEXT[],
  best_for TEXT[],
  milestone_benefits JSONB DEFAULT '[]'::jsonb,
  lounge_access TEXT,
  fuel_surcharge_waiver BOOLEAN DEFAULT false,
  foreign_markup_fee NUMERIC(4,2),
  image_url TEXT,
  apply_url TEXT,
  terms_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- beginner, experienced, chat
  input_snapshot JSONB NOT NULL, -- store user input for record
  recommended_cards JSONB NOT NULL, -- [{cardId, cardName, reasoning, score, rewardBreakdown}]
  ai_analysis TEXT, -- full AI response text
  spending_analysis JSONB, -- parsed spending data if uploaded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Spending Transactions Table
CREATE TABLE IF NOT EXISTS spending_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL, -- dining, groceries, travel, fuel, shopping, utilities, entertainment, healthcare, education, bills, other
  merchant TEXT,
  card_used UUID REFERENCES credit_cards(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'manual', -- manual, bank-statement
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Uploaded Documents Table
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- bank-statement, cibil-report
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INTEGER,
  mime_type TEXT,
  parsed_data JSONB, -- extracted transactions or score
  parsing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  parsing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Credit Score History Table
CREATE TABLE IF NOT EXISTS credit_score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 300 AND score <= 900),
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'manual', -- manual, cibil-report
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Education Articles Table
CREATE TABLE IF NOT EXISTS education_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- markdown
  category TEXT NOT NULL, -- basics, cibil, rewards, fees, security, tips
  difficulty TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  read_time_minutes INTEGER,
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  author TEXT DEFAULT 'CardSense Team',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_credit_cards_bank ON credit_cards(bank);
CREATE INDEX IF NOT EXISTS idx_credit_cards_type ON credit_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_credit_cards_active ON credit_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_user_date ON spending_transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_spending_category ON spending_transactions(category);
CREATE INDEX IF NOT EXISTS idx_documents_user ON uploaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_score_history_user ON credit_score_history(user_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON education_articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON education_articles(slug);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_articles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Credit Cards: Public read access
CREATE POLICY "Anyone can view active credit cards"
  ON credit_cards FOR SELECT
  USING (is_active = true);

-- Recommendations: Users can only access their own recommendations
CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Spending Transactions: Users can only access their own transactions
CREATE POLICY "Users can view own transactions"
  ON spending_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON spending_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON spending_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON spending_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Uploaded Documents: Users can only access their own documents
CREATE POLICY "Users can view own documents"
  ON uploaded_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON uploaded_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON uploaded_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON uploaded_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Credit Score History: Users can only access their own score history
CREATE POLICY "Users can view own score history"
  ON credit_score_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own score history"
  ON credit_score_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Education Articles: Public read access
CREATE POLICY "Anyone can view published articles"
  ON education_articles FOR SELECT
  USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for credit_cards
CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for education_articles
CREATE TRIGGER update_education_articles_updated_at
  BEFORE UPDATE ON education_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Note: Run these in Supabase Dashboard > Storage or via API

-- Storage bucket for bank statements (private)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false);

-- Storage bucket for card images (public)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('card-images', 'card-images', true);

-- RLS policies for documents bucket
-- CREATE POLICY "Users can upload own documents"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own documents"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own documents"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for card-images bucket (public read)
-- CREATE POLICY "Anyone can view card images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'card-images');
