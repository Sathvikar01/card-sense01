-- Harden privileged functions and make education counters atomic.

DO $$
BEGIN
  IF to_regprocedure('public.handle_updated_at()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC;
  END IF;

  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, auth, pg_temp;
    REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
  END IF;

  IF to_regprocedure('public.sync_credit_score_to_profile()') IS NOT NULL THEN
    ALTER FUNCTION public.sync_credit_score_to_profile() SET search_path = public, pg_temp;
    REVOKE ALL ON FUNCTION public.sync_credit_score_to_profile() FROM PUBLIC;
  END IF;

  IF to_regprocedure('public.get_user_documents_folder()') IS NOT NULL THEN
    ALTER FUNCTION public.get_user_documents_folder() SET search_path = public, auth, pg_temp;
    REVOKE ALL ON FUNCTION public.get_user_documents_folder() FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.get_user_documents_folder() TO authenticated;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.education_articles
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = article_id
    AND is_published = TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_article_views(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_article_views(UUID) TO service_role;

-- This legacy helper returned an unsigned storage path despite its name.
DROP FUNCTION IF EXISTS public.get_document_signed_url(TEXT, INTEGER);
