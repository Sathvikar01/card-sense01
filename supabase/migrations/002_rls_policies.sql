-- CardSense India - Row Level Security Policies
-- Ensures users can only access their own data, with credit cards being publicly readable

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE RLS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile (created via trigger, but allow manual too)
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- ============================================
-- CREDIT CARDS TABLE RLS POLICIES
-- ============================================

-- Anyone (authenticated) can view active credit cards
CREATE POLICY "Anyone can view active credit cards"
    ON public.credit_cards
    FOR SELECT
    USING (is_active = true);

-- Only authenticated users can view all cards (including inactive)
CREATE POLICY "Authenticated users can view all cards"
    ON public.credit_cards
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only service role can insert credit cards (admin operation)
CREATE POLICY "Service role can insert credit cards"
    ON public.credit_cards
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Only service role can update credit cards (admin operation)
CREATE POLICY "Service role can update credit cards"
    ON public.credit_cards
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Only service role can delete credit cards (admin operation)
CREATE POLICY "Service role can delete credit cards"
    ON public.credit_cards
    FOR DELETE
    USING (auth.role() = 'service_role');

-- ============================================
-- RECOMMENDATIONS TABLE RLS POLICIES
-- ============================================

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
    ON public.recommendations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own recommendations
CREATE POLICY "Users can insert own recommendations"
    ON public.recommendations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own recommendations
CREATE POLICY "Users can update own recommendations"
    ON public.recommendations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own recommendations
CREATE POLICY "Users can delete own recommendations"
    ON public.recommendations
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- SPENDING TRANSACTIONS TABLE RLS POLICIES
-- ============================================

-- Users can view their own spending transactions
CREATE POLICY "Users can view own transactions"
    ON public.spending_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own spending transactions
CREATE POLICY "Users can insert own transactions"
    ON public.spending_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own spending transactions
CREATE POLICY "Users can update own transactions"
    ON public.spending_transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own spending transactions
CREATE POLICY "Users can delete own transactions"
    ON public.spending_transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- UPLOADED DOCUMENTS TABLE RLS POLICIES
-- ============================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
    ON public.uploaded_documents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
    ON public.uploaded_documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
    ON public.uploaded_documents
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
    ON public.uploaded_documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- CREDIT SCORE HISTORY TABLE RLS POLICIES
-- ============================================

-- Users can view their own credit score history
CREATE POLICY "Users can view own credit score history"
    ON public.credit_score_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own credit score history
CREATE POLICY "Users can insert own credit score history"
    ON public.credit_score_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own credit score history
CREATE POLICY "Users can update own credit score history"
    ON public.credit_score_history
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own credit score history
CREATE POLICY "Users can delete own credit score history"
    ON public.credit_score_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- EDUCATION ARTICLES TABLE RLS POLICIES
-- ============================================

-- Anyone (even unauthenticated) can view published articles
CREATE POLICY "Anyone can view published articles"
    ON public.education_articles
    FOR SELECT
    USING (is_published = true);

-- Only service role can insert articles (admin operation)
CREATE POLICY "Service role can insert articles"
    ON public.education_articles
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Only service role can update articles (admin operation)
CREATE POLICY "Service role can update articles"
    ON public.education_articles
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Only service role can delete articles (admin operation)
CREATE POLICY "Service role can delete articles"
    ON public.education_articles
    FOR DELETE
    USING (auth.role() = 'service_role');

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.credit_cards TO anon, authenticated;
GRANT ALL ON public.recommendations TO authenticated;
GRANT ALL ON public.spending_transactions TO authenticated;
GRANT ALL ON public.uploaded_documents TO authenticated;
GRANT ALL ON public.credit_score_history TO authenticated;
GRANT SELECT ON public.education_articles TO anon, authenticated;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Allow users to view their own profile data';
COMMENT ON POLICY "Anyone can view active credit cards" ON public.credit_cards IS 'Public read access to active credit cards';
COMMENT ON POLICY "Users can view own recommendations" ON public.recommendations IS 'Users can only see their own AI recommendations';
COMMENT ON POLICY "Users can view own transactions" ON public.spending_transactions IS 'Users can only see their own spending data';
COMMENT ON POLICY "Users can view own documents" ON public.uploaded_documents IS 'Users can only access their own uploaded documents';
COMMENT ON POLICY "Users can view own credit score history" ON public.credit_score_history IS 'Users can only see their own credit score history';
COMMENT ON POLICY "Anyone can view published articles" ON public.education_articles IS 'Public read access to published educational content';
