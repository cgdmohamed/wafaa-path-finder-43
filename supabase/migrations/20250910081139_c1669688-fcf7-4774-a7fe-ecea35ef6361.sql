-- Create missing core tables for the application

-- Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'closed')),
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Consultation types table for appointment pricing
CREATE TABLE IF NOT EXISTS public.consultation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  consultation_type_id UUID NOT NULL REFERENCES public.consultation_types(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('in_person', 'phone', 'video', 'chat')),
  subject TEXT NOT NULL,
  description TEXT,
  urgency_level INTEGER NOT NULL DEFAULT 3 CHECK (urgency_level BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  assigned_lawyer_id UUID,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Initiatives table for projects and events
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('project', 'event', 'campaign', 'program')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  start_date DATE,
  end_date DATE,
  location TEXT,
  organizer_id UUID,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  image_url TEXT,
  registration_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cases table for legal cases management
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'on_hold')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_lawyer_id UUID,
  court_reference TEXT,
  next_hearing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
CREATE POLICY "Users can view their own messages" ON public.contact_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create messages" ON public.contact_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can update messages" ON public.contact_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for consultation_types
CREATE POLICY "Everyone can view active consultation types" ON public.consultation_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage consultation types" ON public.consultation_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = client_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Users can create their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Lawyers and admins can update appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'lawyer'))
  );

-- RLS Policies for initiatives
CREATE POLICY "Everyone can view active initiatives" ON public.initiatives
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage initiatives" ON public.initiatives
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for cases
CREATE POLICY "Users can view their own cases" ON public.cases
  FOR SELECT USING (
    auth.uid() = client_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Users can create their own cases" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Lawyers and admins can update cases" ON public.cases
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'lawyer'))
  );

-- Insert sample consultation types
INSERT INTO public.consultation_types (name, description, duration_minutes, price, is_emergency) VALUES
  ('استشارة قانونية عامة', 'استشارة قانونية عامة في مختلف المجالات', 60, 0, false),
  ('استشارة أحوال شخصية', 'استشارة في قضايا الأحوال الشخصية والأسرة', 45, 0, false),
  ('استشارة عمالية', 'استشارة في قضايا العمل وحقوق العاملين', 45, 0, false),
  ('استشارة عاجلة', 'استشارة فورية للحالات العاجلة', 30, 0, true),
  ('مراجعة عقد', 'مراجعة وتحليل العقود القانونية', 90, 200, false);

-- Insert sample initiatives
INSERT INTO public.initiatives (title, description, type, status, start_date, end_date, max_participants) VALUES
  ('مبادرة الصلح ودياً', 'برنامج متخصص في الوساطة والصلح المجتمعي لحل النزاعات الأسرية', 'program', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 200),
  ('مبادرة درع', 'مبادرة لحماية ودعم النساء المعرضات للعنف الأسري', 'program', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 150),
  ('المعسكر القانوني الصيفي', 'برنامج تدريبي مكثف للطالبات والخريجات الجدد', 'event', 'active', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 100),
  ('ورشة الحقوق الأسرية', 'ورشة تدريبية حول الحقوق الأسرية', 'event', 'active', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 50);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_types_updated_at
  BEFORE UPDATE ON public.consultation_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();