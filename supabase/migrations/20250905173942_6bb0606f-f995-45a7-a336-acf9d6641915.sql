-- Create comprehensive database schema for legal services platform

-- 1. User Profiles Table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  national_id TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  preferred_language TEXT DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. User Roles and Permissions
CREATE TYPE public.user_role AS ENUM ('client', 'lawyer', 'admin', 'moderator');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Consultation Types and Services
CREATE TABLE public.consultation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) DEFAULT 0,
  is_emergency BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Appointments/Consultations
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE public.consultation_method AS ENUM ('in_person', 'phone', 'video', 'chat');

CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id),
  consultation_type_id UUID NOT NULL REFERENCES public.consultation_types(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  method consultation_method NOT NULL DEFAULT 'in_person',
  status appointment_status NOT NULL DEFAULT 'pending',
  subject TEXT NOT NULL,
  description TEXT,
  urgency_level INTEGER CHECK (urgency_level >= 1 AND urgency_level <= 5) DEFAULT 3,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Cases Management
CREATE TYPE public.case_status AS ENUM ('initial', 'under_review', 'active', 'pending_documents', 'in_court', 'settled', 'closed');
CREATE TYPE public.case_type AS ENUM ('divorce', 'custody', 'domestic_violence', 'inheritance', 'property', 'employment', 'other');

CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_lawyer_id UUID REFERENCES auth.users(id),
  case_type case_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'initial',
  priority INTEGER CHECK (priority >= 1 AND priority <= 5) DEFAULT 3,
  court_reference TEXT,
  next_hearing_date TIMESTAMP WITH TIME ZONE,
  estimated_duration_months INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Case Updates and Timeline
CREATE TABLE public.case_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  update_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_client_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Documents Management
CREATE TYPE public.document_type AS ENUM ('contract', 'evidence', 'court_filing', 'identification', 'medical', 'financial', 'other');
CREATE TYPE public.document_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');

CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  document_type document_type NOT NULL,
  status document_status NOT NULL DEFAULT 'pending',
  description TEXT,
  is_confidential BOOLEAN DEFAULT true,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Contact Messages and Support
CREATE TYPE public.message_status AS ENUM ('new', 'read', 'in_progress', 'resolved');
CREATE TYPE public.message_priority AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency message_priority NOT NULL DEFAULT 'normal',
  status message_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Legal Resources/Knowledge Base
CREATE TABLE public.legal_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  author_id UUID NOT NULL REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Notifications System
CREATE TYPE public.notification_type AS ENUM ('appointment', 'case_update', 'document', 'message', 'reminder', 'system');

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Insert default consultation types
INSERT INTO public.consultation_types (name, description, duration_minutes, price, is_emergency) VALUES
('استشارة قانونية عامة', 'استشارة قانونية عامة لجميع القضايا', 60, 0, false),
('استشارة أسرية', 'استشارة متخصصة في قضايا الأحوال الشخصية', 90, 0, false),
('استشارة عاجلة', 'استشارة قانونية عاجلة على مدار الساعة', 30, 0, true),
('استشارة عبر الهاتف', 'استشارة قانونية عبر الهاتف', 45, 0, false),
('استشارة مرئية', 'استشارة قانونية عبر الفيديو', 60, 0, false);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate case numbers
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  case_count INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COUNT(*) + 1 INTO case_count
  FROM public.cases 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  sequence_part := LPAD(case_count::TEXT, 4, '0');
  
  RETURN 'WAFAA-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_resources_updated_at
  BEFORE UPDATE ON public.legal_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();