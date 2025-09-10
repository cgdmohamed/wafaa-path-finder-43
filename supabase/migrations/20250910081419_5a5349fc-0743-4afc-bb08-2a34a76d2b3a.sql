-- Create only missing tables (initiatives and cases) and insert sample data

-- Initiatives table for projects and events (only if not exists)
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

-- Cases table for legal cases management (only if not exists)
CREATE TABLE IF NOT EXISTS public.cases_new (
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

-- Enable Row Level Security only for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'initiatives') THEN
    ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies for initiatives
    CREATE POLICY "Everyone can view active initiatives" ON public.initiatives
      FOR SELECT USING (true);

    CREATE POLICY "Admins can manage initiatives" ON public.initiatives
      FOR ALL USING (
        has_role(auth.uid(), 'admin'::user_role)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cases_new') THEN
    ALTER TABLE public.cases_new ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policies for cases_new
    CREATE POLICY "Users can view their own cases_new" ON public.cases_new
      FOR SELECT USING (
        auth.uid() = client_id OR 
        has_role(auth.uid(), 'admin'::user_role) OR
        has_role(auth.uid(), 'lawyer'::user_role)
      );

    CREATE POLICY "Users can create their own cases_new" ON public.cases_new
      FOR INSERT WITH CHECK (auth.uid() = client_id);

    CREATE POLICY "Lawyers and admins can update cases_new" ON public.cases_new
      FOR UPDATE USING (
        has_role(auth.uid(), 'admin'::user_role) OR
        has_role(auth.uid(), 'lawyer'::user_role)
      );
  END IF;
END $$;

-- Insert sample initiatives (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.initiatives LIMIT 1) THEN
    INSERT INTO public.initiatives (title, description, type, status, start_date, end_date, max_participants) VALUES
      ('مبادرة الصلح ودياً', 'برنامج متخصص في الوساطة والصلح المجتمعي لحل النزاعات الأسرية', 'program', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 200),
      ('مبادرة درع', 'مبادرة لحماية ودعم النساء المعرضات للعنف الأسري', 'program', 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 150),
      ('المعسكر القانوني الصيفي', 'برنامج تدريبي مكثف للطالبات والخريجات الجدد', 'event', 'active', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 100),
      ('ورشة الحقوق الأسرية', 'ورشة تدريبية حول الحقوق الأسرية', 'event', 'active', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 50);
  END IF;
END $$;

-- Insert sample consultation types (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.consultation_types LIMIT 1) THEN
    INSERT INTO public.consultation_types (name, description, duration_minutes, price, is_emergency) VALUES
      ('استشارة قانونية عامة', 'استشارة قانونية عامة في مختلف المجالات', 60, 0, false),
      ('استشارة أحوال شخصية', 'استشارة في قضايا الأحوال الشخصية والأسرة', 45, 0, false),
      ('استشارة عمالية', 'استشارة في قضايا العمل وحقوق العاملين', 45, 0, false),
      ('استشارة عاجلة', 'استشارة فورية للحالات العاجلة', 30, 0, true),
      ('مراجعة عقد', 'مراجعة وتحليل العقود القانونية', 90, 200, false);
  END IF;
END $$;

-- Create updated_at triggers for new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Only create triggers if tables exist and don't have triggers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'initiatives') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_initiatives_updated_at') THEN
      CREATE TRIGGER update_initiatives_updated_at
        BEFORE UPDATE ON public.initiatives
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cases_new') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cases_new_updated_at') THEN
      CREATE TRIGGER update_cases_new_updated_at
        BEFORE UPDATE ON public.cases_new
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
END $$;