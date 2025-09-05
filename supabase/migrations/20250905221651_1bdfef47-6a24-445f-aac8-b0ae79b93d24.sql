-- Ensure case_number is auto-generated
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

-- Add trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION public.set_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := public.generate_case_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_case_number
  BEFORE INSERT ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.set_case_number();