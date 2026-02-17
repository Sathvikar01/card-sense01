-- CardSense India - Storage Buckets and Policies
-- Creates storage buckets for documents and card images with appropriate access policies

-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================

-- Bucket for user-uploaded documents (bank statements, credit reports, etc.)
-- Private: Only accessible by the owner
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- Private bucket
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for credit card images
-- Public: Accessible to all for displaying card visuals
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'card-images',
    'card-images',
    true, -- Public bucket
    5242880, -- 5MB limit
    ARRAY[
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/svg+xml'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE RLS POLICIES FOR DOCUMENTS BUCKET
-- ============================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- STORAGE RLS POLICIES FOR CARD-IMAGES BUCKET
-- ============================================

-- Anyone can view card images (public bucket)
CREATE POLICY "Anyone can view card images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'card-images');

-- Only service role can upload card images (admin operation)
CREATE POLICY "Service role can upload card images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'card-images'
    AND auth.role() = 'service_role'
);

-- Only service role can update card images (admin operation)
CREATE POLICY "Service role can update card images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'card-images'
    AND auth.role() = 'service_role'
)
WITH CHECK (
    bucket_id = 'card-images'
    AND auth.role() = 'service_role'
);

-- Only service role can delete card images (admin operation)
CREATE POLICY "Service role can delete card images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'card-images'
    AND auth.role() = 'service_role'
);

-- ============================================
-- HELPER FUNCTION: Get user's document folder path
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_documents_folder()
RETURNS TEXT AS $$
BEGIN
    RETURN auth.uid()::text || '/';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Generate signed URL for document
-- ============================================
CREATE OR REPLACE FUNCTION public.get_document_signed_url(
    file_path TEXT,
    expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
DECLARE
    signed_url TEXT;
BEGIN
    -- Verify the user owns this document
    IF NOT (file_path LIKE auth.uid()::text || '/%') THEN
        RAISE EXCEPTION 'Unauthorized access to document';
    END IF;

    -- This is a placeholder - actual signed URL generation happens in application code
    -- using Supabase client SDK
    RETURN file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION public.get_user_documents_folder() IS 'Returns the storage folder path for the current user';
COMMENT ON FUNCTION public.get_document_signed_url(TEXT, INTEGER) IS 'Validates access and returns document path for signed URL generation';

-- ============================================
-- STORAGE BUCKET USAGE NOTES
-- ============================================

/*
DOCUMENTS BUCKET STRUCTURE:
- documents/
  - {user_id}/
    - bank_statements/
      - {filename}.pdf
    - credit_reports/
      - {filename}.pdf
    - salary_slips/
      - {filename}.pdf

CARD-IMAGES BUCKET STRUCTURE:
- card-images/
  - {bank_name}/
    - {card_name}.png/jpg/webp
  - logos/
    - {bank_name}.svg/png

EXAMPLE FILE PATHS:
- documents/550e8400-e29b-41d4-a716-446655440000/bank_statements/hdfc_jan_2024.pdf
- card-images/hdfc/regalia/card_front.png
- card-images/logos/hdfc.svg

USAGE IN APPLICATION:
1. Upload document:
   const { data } = await supabase.storage
     .from('documents')
     .upload(`${userId}/bank_statements/${filename}`, file)

2. Get signed URL for private document:
   const { data } = await supabase.storage
     .from('documents')
     .createSignedUrl(filePath, 3600)

3. Public card image URL:
   const url = supabase.storage
     .from('card-images')
     .getPublicUrl('hdfc/regalia/card_front.png')
*/
