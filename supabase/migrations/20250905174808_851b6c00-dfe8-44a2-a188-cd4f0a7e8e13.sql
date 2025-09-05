-- Create comprehensive RLS policies for all tables

-- Helper function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid ORDER BY granted_at DESC LIMIT 1;
$$;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_uuid AND role = required_role);
$$;

-- 1. PROFILES Table Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lawyers and admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'lawyer') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

-- 2. USER_ROLES Table Policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'moderator'));

-- 3. CONSULTATION_TYPES Table Policies (Public read access)
CREATE POLICY "Anyone can view consultation types" ON public.consultation_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage consultation types" ON public.consultation_types
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. APPOINTMENTS Table Policies
CREATE POLICY "Clients can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can view their assigned appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = lawyer_id);

CREATE POLICY "Clients can create their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can update assigned appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = lawyer_id);

CREATE POLICY "Lawyers and admins can view all appointments" ON public.appointments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'lawyer') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Lawyers can update appointment assignments" ON public.appointments
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'lawyer') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- 5. CASES Table Policies
CREATE POLICY "Clients can view their own cases" ON public.cases
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Lawyers can view their assigned cases" ON public.cases
  FOR SELECT USING (auth.uid() = assigned_lawyer_id);

CREATE POLICY "Clients can create their own cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Lawyers and admins can view all cases" ON public.cases
  FOR SELECT USING (
    public.has_role(auth.uid(), 'lawyer') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Lawyers can update assigned cases" ON public.cases
  FOR UPDATE USING (
    auth.uid() = assigned_lawyer_id OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Lawyers can create cases" ON public.cases
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'lawyer') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- 6. CASE_UPDATES Table Policies
CREATE POLICY "Clients can view updates for their cases" ON public.case_updates
  FOR SELECT USING (
    is_client_visible = true AND
    EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
  );

CREATE POLICY "Lawyers can view updates for their cases" ON public.case_updates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND assigned_lawyer_id = auth.uid())
  );

CREATE POLICY "Lawyers can create case updates" ON public.case_updates
  FOR INSERT WITH CHECK (
    auth.uid() = updated_by AND
    (public.has_role(auth.uid(), 'lawyer') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can view all case updates" ON public.case_updates
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 7. DOCUMENTS Table Policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Clients can view case documents" ON public.documents
  FOR SELECT USING (
    case_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
  );

CREATE POLICY "Lawyers can view assigned case documents" ON public.documents
  FOR SELECT USING (
    case_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND assigned_lawyer_id = auth.uid())
  );

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Lawyers can update document status" ON public.documents
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'lawyer') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can view all documents" ON public.documents
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 8. CONTACT_MESSAGES Table Policies
CREATE POLICY "Users can view their own messages" ON public.contact_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Anyone can create contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view all messages" ON public.contact_messages
  FOR SELECT USING (
    public.has_role(auth.uid(), 'lawyer') OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Staff can update assigned messages" ON public.contact_messages
  FOR UPDATE USING (
    auth.uid() = assigned_to OR
    public.has_role(auth.uid(), 'admin')
  );

-- 9. LEGAL_RESOURCES Table Policies
CREATE POLICY "Anyone can view published resources" ON public.legal_resources
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can view their own resources" ON public.legal_resources
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Lawyers can create resources" ON public.legal_resources
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    (public.has_role(auth.uid(), 'lawyer') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Authors can update their own resources" ON public.legal_resources
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all resources" ON public.legal_resources
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 10. NOTIFICATIONS Table Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Fix function search paths
ALTER FUNCTION public.generate_case_number() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;