-- Fix the get_table_stats function to use correct column names
CREATE OR REPLACE FUNCTION public.get_table_stats()
RETURNS TABLE(table_name text, record_count bigint, table_size text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||relname as table_name,
    n_tup_ins - n_tup_del as record_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) as table_size
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public'
  ORDER BY record_count DESC;
END;
$$;