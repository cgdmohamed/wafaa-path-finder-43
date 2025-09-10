-- Fix security issues from linter

-- Enable RLS on initiatives table (addressing ERROR 3)
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for initiatives
CREATE POLICY "Everyone can view active initiatives" ON public.initiatives
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage initiatives" ON public.initiatives
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::user_role)
  );

-- Enable RLS on cases_new table
ALTER TABLE public.cases_new ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cases_new
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

-- Fix function search path issues (addressing WARN 1 and 2)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public;