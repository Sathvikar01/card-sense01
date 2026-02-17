-- CardSense India - Database Triggers
-- Handles auto-profile creation on signup and updated_at timestamp management

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-create profile on auth.users insert
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGERS: Auto-update updated_at on UPDATE
-- ============================================

-- Profiles table
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Credit cards table
DROP TRIGGER IF EXISTS set_updated_at_credit_cards ON public.credit_cards;
CREATE TRIGGER set_updated_at_credit_cards
    BEFORE UPDATE ON public.credit_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Recommendations table
DROP TRIGGER IF EXISTS set_updated_at_recommendations ON public.recommendations;
CREATE TRIGGER set_updated_at_recommendations
    BEFORE UPDATE ON public.recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Spending transactions table
DROP TRIGGER IF EXISTS set_updated_at_spending_transactions ON public.spending_transactions;
CREATE TRIGGER set_updated_at_spending_transactions
    BEFORE UPDATE ON public.spending_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Uploaded documents table
DROP TRIGGER IF EXISTS set_updated_at_uploaded_documents ON public.uploaded_documents;
CREATE TRIGGER set_updated_at_uploaded_documents
    BEFORE UPDATE ON public.uploaded_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Credit score history table
DROP TRIGGER IF EXISTS set_updated_at_credit_score_history ON public.credit_score_history;
CREATE TRIGGER set_updated_at_credit_score_history
    BEFORE UPDATE ON public.credit_score_history
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Education articles table
DROP TRIGGER IF EXISTS set_updated_at_education_articles ON public.education_articles;
CREATE TRIGGER set_updated_at_education_articles
    BEFORE UPDATE ON public.education_articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCTION: Sync credit score to profile
-- ============================================
CREATE OR REPLACE FUNCTION public.sync_credit_score_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile with the latest credit score
    UPDATE public.profiles
    SET
        credit_score = NEW.credit_score,
        credit_score_date = NEW.score_date,
        updated_at = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Sync credit score to profile on insert/update
-- ============================================
DROP TRIGGER IF EXISTS on_credit_score_change ON public.credit_score_history;
CREATE TRIGGER on_credit_score_change
    AFTER INSERT OR UPDATE ON public.credit_score_history
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_credit_score_to_profile();

-- ============================================
-- FUNCTION: Increment article view count
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.education_articles
    SET view_count = view_count + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION public.handle_updated_at() IS 'Automatically updates the updated_at timestamp on row modification';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a new user signs up';
COMMENT ON FUNCTION public.sync_credit_score_to_profile() IS 'Syncs credit score changes from history table to profile';
COMMENT ON FUNCTION public.increment_article_views(UUID) IS 'Increments view count for education articles';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Creates profile automatically on user signup';
COMMENT ON TRIGGER set_updated_at_profiles ON public.profiles IS 'Auto-updates updated_at timestamp';
COMMENT ON TRIGGER on_credit_score_change ON public.credit_score_history IS 'Syncs latest credit score to user profile';
