-- Create admin-specific tables for real data

-- Table for system database metrics
CREATE TABLE IF NOT EXISTS public.db_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value text NOT NULL,
  metric_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for db_metrics
ALTER TABLE public.db_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage db_metrics" 
ON public.db_metrics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Table for backup tracking
CREATE TABLE IF NOT EXISTS public.backups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type text NOT NULL DEFAULT 'automatic',
  status text NOT NULL DEFAULT 'pending',
  file_size bigint DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone DEFAULT NULL,
  error_message text DEFAULT NULL
);

-- Enable RLS for backups
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage backups" 
ON public.backups 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Table for audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid DEFAULT NULL,
  user_email text DEFAULT NULL,
  ip_address text DEFAULT NULL,
  action text NOT NULL,
  resource text DEFAULT NULL,
  status text NOT NULL DEFAULT 'success',
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can view audit_logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can create audit_logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Table for security reports
CREATE TABLE IF NOT EXISTS public.security_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  report_type text NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  file_size bigint DEFAULT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  generated_at timestamp with time zone DEFAULT NULL
);

-- Enable RLS for security_reports
ALTER TABLE public.security_reports ENABLE ROW_LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage security_reports" 
ON public.security_reports 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Table for system settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text NOT NULL PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid DEFAULT NULL
);

-- Enable RLS for system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admins can manage system_settings" 
ON public.system_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create function to get database table statistics
CREATE OR REPLACE FUNCTION public.get_table_stats()
RETURNS TABLE (
  table_name text,
  record_count bigint,
  table_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    n_tup_ins - n_tup_del as record_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public'
  ORDER BY record_count DESC;
END;
$$;

-- Create function to get database overview stats
CREATE OR REPLACE FUNCTION public.get_db_overview()
RETURNS TABLE (
  total_tables bigint,
  total_records bigint,
  db_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_tables,
    COALESCE(SUM(n_tup_ins - n_tup_del), 0)::bigint as total_records,
    pg_size_pretty(pg_database_size(current_database())) as db_size
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public';
END;
$$;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid DEFAULT NULL,
  p_user_email text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_action text DEFAULT NULL,
  p_resource text DEFAULT NULL,
  p_status text DEFAULT 'success',
  p_details jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (user_id, user_email, ip_address, action, resource, status, details)
  VALUES (p_user_id, p_user_email, p_ip_address, p_action, p_resource, p_status, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Insert default system settings
INSERT INTO public.system_settings (key, value) VALUES
('site_name', '"جمعية وفاء للخدمات القانونية للمرأة"'::jsonb),
('site_url', '"https://wafaa-legal.org"'::jsonb),
('contact_email', '"info@wafaa-legal.org"'::jsonb),
('contact_phone', '"+966 11 234 5678"'::jsonb),
('site_description', '"جمعية وفاء للخدمات القانونية للمرأة - نقدم المساعدة القانونية والاستشارات المتخصصة للنساء في المملكة العربية السعودية"'::jsonb),
('address', '"الرياض، المملكة العربية السعودية"'::jsonb),
('notifications', '{"email": true, "sms": true, "appointments": true, "case_updates": true}'::jsonb),
('working_hours', '{"start_day": "الأحد", "end_day": "الخميس", "start_time": "08:00", "end_time": "16:00", "allow_outside_hours": false}'::jsonb),
('security', '{"two_factor": false, "data_encryption": true, "audit_log": true, "session_timeout": 30, "max_login_attempts": 5}'::jsonb),
('maintenance', '{"auto_backup": true, "cleanup_temp": true, "backup_time": "23:45", "retention_days": 30}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert sample backup records
INSERT INTO public.backups (backup_type, status, file_size, created_at, completed_at) VALUES
('automatic', 'completed', 47423520, now() - interval '2 hours', now() - interval '2 hours'),
('automatic', 'completed', 46892100, now() - interval '1 day 2 hours', now() - interval '1 day 2 hours'),
('manual', 'completed', 47856200, now() - interval '3 days', now() - interval '3 days')
ON CONFLICT DO NOTHING;

-- Create trigger to update system_settings timestamp
CREATE OR REPLACE FUNCTION public.update_system_settings_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER system_settings_updated_at_trigger
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_system_settings_timestamp();