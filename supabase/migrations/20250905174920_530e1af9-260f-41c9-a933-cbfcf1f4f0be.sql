-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('case-documents', 'case-documents', false),
  ('profile-avatars', 'profile-avatars', true),
  ('legal-resources', 'legal-resources', true);

-- Storage policies for case documents (private)
CREATE POLICY "Users can view their own case documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'case-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own case documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'case-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Lawyers can access assigned case documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'case-documents' AND
    (public.has_role(auth.uid(), 'lawyer') OR public.has_role(auth.uid(), 'admin'))
  );

-- Storage policies for profile avatars (public)
CREATE POLICY "Anyone can view profile avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for legal resources (public)
CREATE POLICY "Anyone can view legal resources" ON storage.objects
  FOR SELECT USING (bucket_id = 'legal-resources');

CREATE POLICY "Lawyers can upload legal resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'legal-resources' AND
    (public.has_role(auth.uid(), 'lawyer') OR public.has_role(auth.uid(), 'admin'))
  );