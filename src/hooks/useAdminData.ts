import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  userEmail: string;
  ipAddress: string;
  action: string;
  resource: string;
  status: string;
  details: any;
  createdAt: string;
}

export interface SecurityReport {
  id: string;
  name: string;
  reportType: string;
  periodStart: string;
  periodEnd: string;
  fileSize: number;
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
  [key: string]: any;
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

      // Fetch database overview - use any type for new functions
      const { data: dbOverview, error: dbError } = await supabase
        .rpc('get_db_overview' as any);

      if (dbError) throw dbError;

      // Fetch table statistics
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_stats' as any);

      if (tablesError) throw tablesError;

      // Fetch recent backups - use any type for new tables
      const { data: backupData, error: backupError } = await (supabase as any)
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (backupError) throw backupError;

      if (dbOverview && Array.isArray(dbOverview) && dbOverview.length > 0) {
        const overview = dbOverview[0];
        setStats({
          totalTables: overview.total_tables || 0,
          totalRecords: overview.total_records || 0,
          dbSize: overview.db_size || 'غير متاح'
        });
      }

      setTableStats(Array.isArray(tables) ? tables.map((t: any) => ({
        tableName: t.table_name,
        recordCount: t.record_count,
        tableSize: t.table_size
      })) : []);
      
      setBackups(Array.isArray(backupData) ? backupData.map((b: any) => ({
        id: b.id,
        backupType: b.backup_type,
        status: b.status,
        fileSize: b.file_size,
        createdAt: b.created_at,
        completedAt: b.completed_at,
        errorMessage: b.error_message
      })) : []);

    } catch (err: any) {
      console.error('Error fetching database stats:', err);
      setError(err.message);
      toast({
        title: "خطأ في تحميل بيانات قاعدة البيانات",
        description: err.message,
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

      // Fetch audit logs - use any type for new tables
      const { data: logs, error: logsError } = await (supabase as any)
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;

      // Fetch security reports
      const { data: reports, error: reportsError } = await (supabase as any)
        .from('security_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      setAuditLogs(Array.isArray(logs) ? logs.map((l: any) => ({
        id: l.id,
        userEmail: l.user_email,
        ipAddress: l.ip_address,
        action: l.action,
        resource: l.resource,
        status: l.status,
        details: l.details,
        createdAt: l.created_at
      })) : []);
      
      setSecurityReports(Array.isArray(reports) ? reports.map((r: any) => ({
        id: r.id,
        name: r.name,
        reportType: r.report_type,
        periodStart: r.period_start,
        periodEnd: r.period_end,
        fileSize: r.file_size,
        status: r.status,
        createdAt: r.created_at,
        generatedAt: r.generated_at
      })) : []);

    } catch (err: any) {
      console.error('Error fetching security data:', err);
      setError(err.message);
      toast({
        title: "خطأ في تحميل البيانات الأمنية",
        description: err.message,
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

// System Settings Hook
export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await (supabase as any)
        .from('system_settings')
        .select('*');

      if (error) throw error;

      // Convert array to object for easier access
      const settingsObj: SystemSettings = {};
      if (Array.isArray(data)) {
        data.forEach((setting: any) => {
          settingsObj[setting.key] = setting.value;
        });
      }

      setSettings(settingsObj);

    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      toast({
        title: "خطأ في تحميل الإعدادات",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: SystemSettings) => {
    try {
      setIsSaving(true);

      // Update each setting
      for (const [key, value] of Object.entries(newSettings)) {
        const { error } = await (supabase as any)
          .from('system_settings')
          .upsert({ 
            key, 
            value: typeof value === 'string' ? `"${value}"` : JSON.stringify(value)
          });

        if (error) throw error;
      }

      setSettings(newSettings);
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ إعدادات النظام بنجاح",
        variant: "default"
      });

    } catch (err: any) {
      console.error('Error saving settings:', err);
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: err.message,
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