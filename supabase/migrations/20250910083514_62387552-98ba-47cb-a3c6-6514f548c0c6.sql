-- Create services table for quick and main services
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL DEFAULT 'main', -- 'quick' or 'main'
  icon_name text NOT NULL,
  features text[] DEFAULT NULL,
  price numeric DEFAULT NULL,
  duration_minutes integer DEFAULT NULL,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create events table for upcoming events  
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_type text NOT NULL,
  location text,
  event_date date NOT NULL,
  event_time time,
  max_participants integer,
  current_participants integer DEFAULT 0,
  registration_link text,
  organizer_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create service requests table for handling service inquiries
CREATE TABLE public.service_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid REFERENCES public.services(id),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  urgency text DEFAULT 'normal',
  status text DEFAULT 'pending',
  assigned_to uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create initiative registrations table for participation
CREATE TABLE public.initiative_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id uuid REFERENCES public.initiatives(id),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiative_registrations ENABLE ROW LEVEL SECURITY;

-- Services policies (public read, admin manage)
CREATE POLICY "Anyone can view active services" ON public.services
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- Events policies (public read, admin manage)
CREATE POLICY "Anyone can view active events" ON public.events
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage events" ON public.events
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- Service requests policies
CREATE POLICY "Anyone can create service requests" ON public.service_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own requests" ON public.service_requests
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text)
);

CREATE POLICY "Staff can view all requests" ON public.service_requests
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'lawyer'::user_role) OR 
  has_role(auth.uid(), 'moderator'::user_role)
);

CREATE POLICY "Staff can update requests" ON public.service_requests
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'lawyer'::user_role) OR 
  (auth.uid() = assigned_to)
);

-- Initiative registrations policies
CREATE POLICY "Anyone can register for initiatives" ON public.initiative_registrations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own registrations" ON public.initiative_registrations
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text)
);

CREATE POLICY "Staff can view all registrations" ON public.initiative_registrations
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'lawyer'::user_role) OR 
  has_role(auth.uid(), 'moderator'::user_role)
);

-- Insert default services
INSERT INTO public.services (title, description, type, icon_name, price, duration_minutes) VALUES
('اطلب استشارة', 'استشارة قانونية فورية مع محامية متخصصة', 'quick', 'Phone', 150.00, 30),
('قدم طلب دعم قانوني', 'احصل على دعم قانوني شامل لقضيتك', 'quick', 'FileText', 200.00, 60),
('احجز جلسة صلح', 'جلسات صلح مجتمعي متخصصة', 'quick', 'Users', 100.00, 90),
('إعداد اللوائح والمذكرات', 'صياغة وإعداد المستندات القانونية', 'quick', 'FileText', 300.00, 120);

INSERT INTO public.services (title, description, type, icon_name, features) VALUES
('الاستشارات القانونية', 'استشارات متخصصة في جميع المجالات القانونية المتعلقة بالمرأة', 'main', 'Scale', 
ARRAY['استشارات هاتفية', 'استشارات مكتوبة', 'استشارات عاجلة', 'متابعة قانونية']),
('الدعم في القضايا', 'مرافقة قانونية شاملة في جميع مراحل التقاضي', 'main', 'Gavel',
ARRAY['تمثيل قانوني', 'إعداد المرافعات', 'متابعة الجلسات', 'تنفيذ الأحكام']),
('الصلح المجتمعي', 'حلول ودية للنزاعات الأسرية والمجتمعية', 'main', 'Users',
ARRAY['وساطة متخصصة', 'حلول شرعية', 'اتفاقيات ملزمة', 'متابعة التنفيذ']),
('الدعم النفسي والاجتماعي', 'مرافقة نفسية واجتماعية للمرأة في رحلتها القانونية', 'main', 'Heart',
ARRAY['جلسات دعم فردية', 'مجموعات الدعم', 'برامج التأهيل', 'الإرشاد الأسري']),
('التدريب والتأهيل', 'برامج تدريبية لتمكين المرأة قانونياً ومهنياً', 'main', 'GraduationCap',
ARRAY['دورات قانونية', 'ورش تخصصية', 'شهادات معتمدة', 'تدريب عملي']),
('التوعية القانونية', 'نشر الثقافة القانونية والوعي بالحقوق', 'main', 'BookOpen',
ARRAY['محاضرات توعوية', 'مواد تثقيفية', 'حملات مجتمعية', 'الموسوعة القانونية']);

-- Insert default events
INSERT INTO public.events (title, event_type, location, event_date, event_time, max_participants) VALUES
('ورشة الحقوق الأسرية', 'ورشة تدريبية', 'مقر الجمعية - الرياض', '2024-12-15', '10:00', 50),
('محاضرة حقوق المرأة في العمل', 'محاضرة عامة', 'جامعة الأميرة نورة', '2024-12-20', '14:00', 100),
('معرض الخدمات القانونية', 'معرض', 'مركز الرياض الدولي للمؤتمرات', '2024-12-25', '09:00', 200);

-- Add updated_at triggers
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();