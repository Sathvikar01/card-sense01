-- CardSense India - Initial Schema Migration
-- Creates all core tables with proper constraints, types, and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,

    -- Financial Information
    annual_income INTEGER CHECK (annual_income >= 0),
    employment_type TEXT CHECK (employment_type IN ('salaried', 'self_employed', 'student', 'retired', 'unemployed', 'other')),
    employer_name TEXT,
    city TEXT,

    -- Credit Information
    credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 900),
    credit_score_date TIMESTAMPTZ,

    -- Banking Information
    primary_bank TEXT,
    has_fixed_deposit BOOLEAN DEFAULT false,
    fd_amount INTEGER CHECK (fd_amount >= 0),

    -- Existing Credit Cards (array of card IDs)
    existing_card_ids UUID[] DEFAULT ARRAY[]::UUID[],

    -- User Preferences
    preferred_spending_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    financial_goals TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Profile Completeness
    is_beginner BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_credit_score ON public.profiles(credit_score);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- ============================================
-- CREDIT CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Information
    bank TEXT NOT NULL,
    card_name TEXT NOT NULL,
    card_type TEXT NOT NULL CHECK (card_type IN ('entry_level', 'premium', 'super_premium', 'business', 'fuel', 'cashback', 'rewards', 'travel', 'shopping', 'lifestyle')),
    network TEXT NOT NULL CHECK (network IN ('visa', 'mastercard', 'rupay', 'amex', 'diners')),

    -- Fees
    annual_fee INTEGER NOT NULL DEFAULT 0 CHECK (annual_fee >= 0),
    first_year_fee INTEGER CHECK (first_year_fee >= 0),
    fee_waiver_condition TEXT,

    -- Eligibility Criteria
    min_income INTEGER CHECK (min_income >= 0),
    min_credit_score INTEGER CHECK (min_credit_score >= 300 AND min_credit_score <= 900),
    min_age INTEGER DEFAULT 18 CHECK (min_age >= 18),
    max_age INTEGER DEFAULT 65 CHECK (max_age >= min_age),
    eligible_employment_types TEXT[] DEFAULT ARRAY['salaried', 'self_employed']::TEXT[],

    -- Reward Structure (JSONB for flexibility)
    -- Example: {"default": 1, "categories": {"dining": 5, "travel": 3, "shopping": 2}, "caps": {"dining": 1000, "travel": 2000}}
    reward_rate_categories JSONB DEFAULT '{}'::JSONB,
    reward_point_value DECIMAL(10, 4) DEFAULT 0.25, -- Value of 1 reward point in INR

    -- Welcome Benefits (JSONB)
    -- Example: {"bonus_points": 5000, "milestone_spend": 50000, "validity_days": 90, "other_benefits": ["lounge access"]}
    welcome_benefits JSONB DEFAULT '{}'::JSONB,

    -- Benefits & Features
    benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
    lounge_access_details TEXT,
    fuel_surcharge_waiver BOOLEAN DEFAULT false,

    -- Pros & Cons
    pros TEXT[] DEFAULT ARRAY[]::TEXT[],
    cons TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Targeting
    best_for TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g., ['dining', 'travel', 'beginners']

    -- Media
    card_image_url TEXT,

    -- Meta
    is_active BOOLEAN DEFAULT true,
    popularity_score INTEGER DEFAULT 0 CHECK (popularity_score >= 0 AND popularity_score <= 100),

    -- Additional Details
    description TEXT,
    application_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for credit_cards
CREATE INDEX idx_credit_cards_bank ON public.credit_cards(bank);
CREATE INDEX idx_credit_cards_card_type ON public.credit_cards(card_type);
CREATE INDEX idx_credit_cards_network ON public.credit_cards(network);
CREATE INDEX idx_credit_cards_annual_fee ON public.credit_cards(annual_fee);
CREATE INDEX idx_credit_cards_min_income ON public.credit_cards(min_income);
CREATE INDEX idx_credit_cards_min_credit_score ON public.credit_cards(min_credit_score);
CREATE INDEX idx_credit_cards_is_active ON public.credit_cards(is_active);
CREATE INDEX idx_credit_cards_popularity_score ON public.credit_cards(popularity_score);
CREATE INDEX idx_credit_cards_best_for ON public.credit_cards USING GIN(best_for);

-- ============================================
-- RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Recommendation Type
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('beginner', 'experienced', 'optimization')),

    -- Input Snapshot (JSONB)
    -- Stores the user's profile and preferences at the time of recommendation
    input_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Recommended Cards (JSONB array)
    -- Example: [{"card_id": "uuid", "rank": 1, "estimated_rewards": 15000, "net_annual_value": 13500, "reasoning": "..."}]
    recommended_cards JSONB NOT NULL DEFAULT '[]'::JSONB,

    -- AI Analysis
    ai_analysis_text TEXT,
    application_guide TEXT,
    portfolio_strategy TEXT,

    -- Additional Insights
    spending_optimization_tips JSONB DEFAULT '[]'::JSONB,

    -- Metadata
    model_used TEXT DEFAULT 'gemini-pro',
    processing_time_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for recommendations
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_type ON public.recommendations(recommendation_type);
CREATE INDEX idx_recommendations_created_at ON public.recommendations(created_at DESC);

-- ============================================
-- SPENDING TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.spending_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Transaction Details
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL CHECK (category IN (
        'dining', 'groceries', 'travel', 'fuel', 'shopping', 'entertainment',
        'utilities', 'healthcare', 'education', 'insurance', 'rent',
        'emi', 'investments', 'other'
    )),
    merchant_name TEXT,
    description TEXT,

    -- Card Used
    credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL,

    -- Transaction Date
    transaction_date DATE NOT NULL,

    -- Source (manual entry vs parsed from statement)
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'parsed_statement', 'imported')),

    -- Rewards Earned
    rewards_earned DECIMAL(10, 2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for spending_transactions
CREATE INDEX idx_spending_user_id ON public.spending_transactions(user_id);
CREATE INDEX idx_spending_category ON public.spending_transactions(category);
CREATE INDEX idx_spending_transaction_date ON public.spending_transactions(transaction_date DESC);
CREATE INDEX idx_spending_card_id ON public.spending_transactions(credit_card_id);
CREATE INDEX idx_spending_created_at ON public.spending_transactions(created_at DESC);

-- ============================================
-- UPLOADED DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Document Information
    document_type TEXT NOT NULL CHECK (document_type IN ('bank_statement', 'credit_report', 'salary_slip', 'other')),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    file_size_bytes INTEGER CHECK (file_size_bytes >= 0),
    mime_type TEXT,

    -- Parsing Status
    parsing_status TEXT NOT NULL DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
    parsing_error TEXT,

    -- Parsed Data (JSONB)
    -- For bank statements: {"detected_bank": "HDFC", "transactions": [...], "summary": {...}}
    parsed_data JSONB DEFAULT '{}'::JSONB,

    -- Metadata
    parsed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for uploaded_documents
CREATE INDEX idx_documents_user_id ON public.uploaded_documents(user_id);
CREATE INDEX idx_documents_type ON public.uploaded_documents(document_type);
CREATE INDEX idx_documents_status ON public.uploaded_documents(parsing_status);
CREATE INDEX idx_documents_created_at ON public.uploaded_documents(created_at DESC);

-- ============================================
-- CREDIT SCORE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.credit_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Score Information
    credit_score INTEGER NOT NULL CHECK (credit_score >= 300 AND credit_score <= 900),
    score_date DATE NOT NULL,

    -- Additional Details
    score_source TEXT CHECK (score_source IN ('cibil', 'experian', 'equifax', 'crif', 'manual')),
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique score per user per date
    UNIQUE(user_id, score_date)
);

-- Indexes for credit_score_history
CREATE INDEX idx_credit_score_user_id ON public.credit_score_history(user_id);
CREATE INDEX idx_credit_score_date ON public.credit_score_history(score_date DESC);
CREATE INDEX idx_credit_score_created_at ON public.credit_score_history(created_at DESC);

-- ============================================
-- EDUCATION ARTICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.education_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Article Content
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL, -- Markdown content
    excerpt TEXT,

    -- Categorization
    category TEXT NOT NULL CHECK (category IN ('basics', 'cibil', 'rewards', 'fees', 'security', 'tips', 'advanced')),
    difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

    -- Tags
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Media
    featured_image_url TEXT,

    -- Reading Time
    reading_time_minutes INTEGER DEFAULT 5 CHECK (reading_time_minutes > 0),

    -- Metadata
    author TEXT DEFAULT 'CardSense Team',
    is_published BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),

    -- SEO
    meta_description TEXT,
    meta_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for education_articles
CREATE INDEX idx_articles_slug ON public.education_articles(slug);
CREATE INDEX idx_articles_category ON public.education_articles(category);
CREATE INDEX idx_articles_difficulty ON public.education_articles(difficulty);
CREATE INDEX idx_articles_is_published ON public.education_articles(is_published);
CREATE INDEX idx_articles_published_at ON public.education_articles(published_at DESC);
CREATE INDEX idx_articles_tags ON public.education_articles USING GIN(tags);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.profiles IS 'User profiles with financial information and preferences';
COMMENT ON TABLE public.credit_cards IS 'Credit card catalog with detailed reward structures and eligibility';
COMMENT ON TABLE public.recommendations IS 'AI-generated credit card recommendations history';
COMMENT ON TABLE public.spending_transactions IS 'User spending transactions for tracking and optimization';
COMMENT ON TABLE public.uploaded_documents IS 'Uploaded financial documents with parsing status';
COMMENT ON TABLE public.credit_score_history IS 'Historical tracking of user credit scores';
COMMENT ON TABLE public.education_articles IS 'Educational content about credit cards and financial literacy';
