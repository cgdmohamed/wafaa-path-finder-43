-- Enable realtime for contact_messages table
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;

-- Add contact_messages to realtime publication
INSERT INTO supabase_realtime.subscription (subscription_id, entity, filters) 
VALUES (
  gen_random_uuid(),
  'public.contact_messages',
  '[]'::jsonb
) ON CONFLICT DO NOTHING;

-- Create storage policies for case-documents bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-documents',
  'case-documents',
  false,
  52428800, -- 50MB limit
  '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/jpeg","image/png","image/jpg"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/jpeg","image/png","image/jpg"}'::jsonb;

-- Storage policies for case-documents bucket
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'case-documents' AND 
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.file_path = name AND documents.uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'case-documents' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Lawyers and admins can view all case documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'case-documents' AND (
    has_role(auth.uid(), 'lawyer'::user_role) OR 
    has_role(auth.uid(), 'admin'::user_role) OR
    has_role(auth.uid(), 'moderator'::user_role)
  )
);

-- Update documents table RLS policies for better security
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" ON public.documents
FOR SELECT USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Clients can view case documents" ON public.documents;
CREATE POLICY "Clients can view case documents" ON public.documents
FOR SELECT USING (
  case_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE cases.id = documents.case_id AND cases.client_id = auth.uid()
  )
);

-- Ensure consultation_types has some default data
INSERT INTO public.consultation_types (name, description, duration_minutes, price, is_active, is_emergency)
VALUES 
  ('استشارة عامة', 'استشارة قانونية عامة', 60, 200.00, true, false),
  ('استشارة عاجلة', 'استشارة قانونية عاجلة', 30, 300.00, true, true),
  ('استشارة أسرية', 'قضايا الأحوال الشخصية والأسرة', 90, 250.00, true, false),
  ('استشارة عمالية', 'قضايا العمال والموظفين', 60, 200.00, true, false)
ON CONFLICT (name) DO NOTHING;