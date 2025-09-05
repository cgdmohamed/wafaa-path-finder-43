import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Strict TypeScript interfaces for all data structures

export interface DbOverviewResult {
  total_tables: number;
  total_records: number;
  db_size: string | null;
}

export interface TableStatsResult {
  table_name: string;
  record_count: number;
  table_size: string;
}

export interface BackupRecord {
  id: string;
  backup_type: string;
  status: string;
  file_size: number | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface AuditLogRecord {
  id: string;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
  action: string;
  resource: string | null;
  status: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface SecurityReportRecord {
  id: string;
  name: string;
  report_type: string;
  period_start: string;
  period_end: string;
  file_size: number | null;
  status: string;
  created_at: string;
  generated_at: string | null;
}

export interface SystemSettingRecord {
  key: string;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}

// Transformed interfaces for UI consumption
export interface DatabaseStats {
  totalTables: number;
  totalRecords: number;
  dbSize: string;
}

export interface TableStats {
  tableName: string;
  recordCount: number;
  tableSize: string;
}

export interface AuditLog {
  id: string;
  userEmail: string | null;
  ipAddress: string | null;
  action: string;
  resource: string | null;
  status: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface SecurityReport {
  id: string;
  name: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  fileSize: number | null;
  status: string;
  createdAt: string;
  generatedAt: string | null;
}

export interface BackupInfo {
  id: string;
  backupType: string;
  status: string;
  fileSize: number | null;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

export interface SystemSettings {
  site_name: string;
  site_url: string;
  contact_email: string;
  contact_phone: string;
  site_description: string;
  address: string;
  notifications: {
    email: boolean;
    sms: boolean;
    appointments: boolean;
    case_updates: boolean;
  };
  working_hours: {
    start_day: string;
    end_day: string;
    start_time: string;
    end_time: string;
    allow_outside_hours: boolean;
  };
  security: {
    two_factor: boolean;
    data_encryption: boolean;
    audit_log: boolean;
    session_timeout: number;
    max_login_attempts: number;
  };
  maintenance: {
    auto_backup: boolean;
    cleanup_temp: boolean;
    backup_time: string;
    retention_days: number;
  };
}

// Helper functions for data transformation
function transformDbOverview(data: DbOverviewResult[]): DatabaseStats | null {
  if (!data || data.length === 0) return null;
  const overview = data[0];
  return {
    totalTables: overview.total_tables || 0,
    totalRecords: overview.total_records || 0,
    dbSize: overview.db_size || 'غير متاح'
  };
}

function transformTableStats(data: TableStatsResult[]): TableStats[] {
  if (!Array.isArray(data)) return [];
  return data.map(t => ({
    tableName: t.table_name,
    recordCount: t.record_count,
    tableSize: t.table_size
  }));
}

function transformBackups(data: BackupRecord[]): BackupInfo[] {
  if (!Array.isArray(data)) return [];
  return data.map(b => ({
    id: b.id,
    backupType: b.backup_type,
    status: b.status,
    fileSize: b.file_size,
    createdAt: b.created_at,
    completedAt: b.completed_at,
    errorMessage: b.error_message
  }));
}

function transformAuditLogs(data: AuditLogRecord[]): AuditLog[] {
  if (!Array.isArray(data)) return [];
  return data.map(l => ({
    id: l.id,
    userEmail: l.user_email,
    ipAddress: l.ip_address,
    action: l.action,
    resource: l.resource,
    status: l.status,
    details: l.details || {},
    createdAt: l.created_at
  }));
}

function transformSecurityReports(data: SecurityReportRecord[]): SecurityReport[] {
  if (!Array.isArray(data)) return [];
  return data.map(r => ({
    id: r.id,
    name: r.name,
    reportType: r.report_type,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    fileSize: r.file_size,
    status: r.status,
    createdAt: r.created_at,
    generatedAt: r.generated_at
  }));
}

function parseSettingValue(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function stringifySettingValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return value;
}

// Database Management Hook
export function useDatabaseStats() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch database overview with proper typing (fallback for missing types)
      const { data: dbOverview, error: dbError } = await (supabase.rpc as any)('get_db_overview');

      if (dbError) throw dbError;

      // Fetch table statistics
      const { data: tables, error: tablesError } = await (supabase.rpc as any)('get_table_stats');

      if (tablesError) throw tablesError;

      // Fetch recent backups with typed query (fallback for missing types)
      const { data: backupData, error: backupError } = await (supabase as any)
        .from('backups')
        .select('id, backup_type, status, file_size, created_at, completed_at, error_message')
        .order('created_at', { ascending: false })
        .limit(5);

      if (backupError) throw backupError;

      // Transform and set data with proper type checking
      if (Array.isArray(dbOverview)) {
        setStats(transformDbOverview(dbOverview as DbOverviewResult[]));
      } else {
        setStats(null);
      }
      
      if (Array.isArray(tables)) {
        setTableStats(transformTableStats(tables as TableStatsResult[]));
      } else {
        setTableStats([]);
      }
      
      setBackups(transformBackups(backupData || []));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      console.error('Error fetching database stats:', err);
      setError(errorMessage);
      toast({
        title: "خطأ في تحميل بيانات قاعدة البيانات",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    tableStats,
    backups,
    isLoading,
    error,
    refetch: fetchStats
  };
}

// Security Management Hook
export function useSecurityData() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityReports, setSecurityReports] = useState<SecurityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch audit logs with proper typing (fallback for missing types)
      const { data: logs, error: logsError } = await (supabase as any)
        .from('audit_logs')
        .select('id, user_id, user_email, ip_address, action, resource, status, details, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;

      // Fetch security reports
      const { data: reports, error: reportsError } = await (supabase as any)
        .from('security_reports')
        .select('id, name, report_type, period_start, period_end, file_size, status, created_at, generated_at')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Transform and set data
      setAuditLogs(transformAuditLogs(logs || []));
      setSecurityReports(transformSecurityReports(reports || []));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      console.error('Error fetching security data:', err);
      setError(errorMessage);
      toast({
        title: "خطأ في تحميل البيانات الأمنية",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  return {
    auditLogs,
    securityReports,
    isLoading,
    error,
    refetch: fetchSecurityData
  };
}

// System Settings Hook with proper validation
export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateSettings = (settings: Partial<SystemSettings>): string[] => {
    const errors: string[] = [];
    
    if (settings.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact_email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }
    
    if (settings.site_url && !/^https?:\/\/.+/.test(settings.site_url)) {
      errors.push('رابط الموقع غير صحيح');
    }
    
    if (settings.security?.session_timeout && settings.security.session_timeout <= 0) {
      errors.push('مدة انتهاء الجلسة يجب أن تكون أكبر من 0');
    }
    
    if (settings.security?.max_login_attempts && settings.security.max_login_attempts < 1) {
      errors.push('عدد محاولات تسجيل الدخول يجب أن يكون 1 على الأقل');
    }
    
    return errors;
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await (supabase as any)
        .from('system_settings')
        .select('key, value, updated_at, updated_by');

      if (error) throw error;

      // Convert array to typed settings object
      if (Array.isArray(data)) {
        const settingsObj: Partial<SystemSettings> = {};
        
        data.forEach(setting => {
          const parsedValue = parseSettingValue(setting.value);
          (settingsObj as Record<string, unknown>)[setting.key] = parsedValue;
        });

        // Ensure all required fields exist with defaults
        const completeSettings: SystemSettings = {
          site_name: (settingsObj.site_name as string) || '',
          site_url: (settingsObj.site_url as string) || '',
          contact_email: (settingsObj.contact_email as string) || '',
          contact_phone: (settingsObj.contact_phone as string) || '',
          site_description: (settingsObj.site_description as string) || '',
          address: (settingsObj.address as string) || '',
          notifications: {
            email: true,
            sms: true,
            appointments: true,
            case_updates: true,
            ...(settingsObj.notifications as object || {})
          },
          working_hours: {
            start_day: 'الأحد',
            end_day: 'الخميس',
            start_time: '08:00',
            end_time: '16:00',
            allow_outside_hours: false,
            ...(settingsObj.working_hours as object || {})
          },
          security: {
            two_factor: false,
            data_encryption: true,
            audit_log: true,
            session_timeout: 30,
            max_login_attempts: 5,
            ...(settingsObj.security as object || {})
          },
          maintenance: {
            auto_backup: true,
            cleanup_temp: true,
            backup_time: '23:45',
            retention_days: 30,
            ...(settingsObj.maintenance as object || {})
          }
        };

        setSettings(completeSettings);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      console.error('Error fetching settings:', err);
      setError(errorMessage);
      toast({
        title: "خطأ في تحميل الإعدادات",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: SystemSettings) => {
    try {
      setIsSaving(true);

      // Validate settings first
      const validationErrors = validateSettings(newSettings);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('، '));
      }

      // Update each setting with proper value encoding
      const updatePromises = Object.entries(newSettings).map(([key, value]) => {
        const encodedValue = typeof value === 'string' ? stringifySettingValue(value) : value;
        
        return (supabase as any)
          .from('system_settings')
          .upsert({ 
            key, 
            value: encodedValue
          });
      });

      const results = await Promise.all(updatePromises);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e.error?.message).join('، '));
      }

      setSettings(newSettings);
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات النظام بنجاح",
        variant: "default"
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      console.error('Error saving settings:', err);
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    saveSettings,
    refetch: fetchSettings
  };
}