import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Settings, 
  Shield, 
  Server,
  HardDrive,
  Activity,
  Clock,
  Users,
  FileText,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useDatabaseStats } from '@/hooks/useAdminData';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const DatabaseManagement = () => {
  const { stats, tableStats, backups, isLoading, error, refetch } = useDatabaseStats();

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'غير محدد';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getTableHealth = (recordCount: number) => {
    if (recordCount > 1000) return 'warning';
    return 'healthy';
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="w-8 h-8 text-primary" />
              إدارة قاعدة البيانات
            </h1>
            <p className="text-muted-foreground">مراقبة وإدارة قاعدة بيانات النظام</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
            تحديث البيانات
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">خطأ في تحميل البيانات</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={refetch}>إعادة المحاولة</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-8 h-8 text-primary" />
            إدارة قاعدة البيانات
          </h1>
          <p className="text-muted-foreground">مراقبة وإدارة قاعدة بيانات النظام</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* Database Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الجداول</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalTables || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">جداول نشطة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalRecords?.toLocaleString() || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">سجل في النظام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حجم قاعدة البيانات</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{stats?.dbSize || 'غير متاح'}</div>
            )}
            <p className="text-xs text-muted-foreground">الحجم الحالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر نسخة احتياطية</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : backups.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {new Date(backups[0].createdAt).toLocaleTimeString('ar', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(backups[0].createdAt), { 
                    addSuffix: true, 
                    locale: ar 
                  })}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">لا توجد نسخ احتياطية</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Tables Status */}
      <Card>
        <CardHeader>
          <CardTitle>حالة الجداول</CardTitle>
          <CardDescription>إحصائيات الجداول الرئيسية في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : tableStats.length > 0 ? (
              tableStats.slice(0, 10).map((table) => (
                <div key={table.tableName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{table.tableName}</p>
                      <p className="text-sm text-muted-foreground">{table.recordCount.toLocaleString()} سجل • {table.tableSize}</p>
                    </div>
                  </div>
                  <Badge variant={getTableHealth(table.recordCount) === 'healthy' ? 'default' : 'secondary'}>
                    {getTableHealth(table.recordCount) === 'healthy' ? 'سليم' : 'تحذير'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بيانات متاحة
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              النسخ الاحتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : backups.length > 0 ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">آخر نسخة احتياطية</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(backups[0].createdAt).toLocaleDateString('ar')} - {backups[0].status === 'completed' ? 'مكتملة بنجاح' : backups[0].status}
                  </p>
                  {backups[0].fileSize && (
                    <p className="text-xs text-muted-foreground">الحجم: {formatFileSize(backups[0].fileSize)}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">إجمالي النسخ الاحتياطية</p>
                  <p className="text-sm text-muted-foreground">{backups.length} نسخة متاحة</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد نسخ احتياطية
              </div>
            )}
            
            <div className="flex gap-2">
              <Button size="sm" className="gap-2" disabled>
                <Download className="w-4 h-4" />
                نسخة احتياطية يدوية
              </Button>
              <Button variant="outline" size="sm" disabled>
                إعدادات النسخ
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              مراقبة الأداء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>مراقبة الأداء غير متاحة حالياً</p>
              <p className="text-sm">سيتم إضافة هذه الميزة قريباً</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Backup Activity */}
      <Card>
        <CardHeader>
          <CardTitle>سجل النسخ الاحتياطية</CardTitle>
          <CardDescription>آخر عمليات النسخ الاحتياطي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-secondary/10 rounded">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : backups.length > 0 ? (
              backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-secondary/10 rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      backup.status === 'completed' ? 'bg-green-500' : 
                      backup.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">نسخة احتياطية {backup.backupType === 'automatic' ? 'تلقائية' : 'يدوية'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true, locale: ar })}
                        {backup.fileSize && ` • ${formatFileSize(backup.fileSize)}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={backup.status === 'completed' ? 'default' : backup.status === 'pending' ? 'secondary' : 'destructive'}>
                    {backup.status === 'completed' ? 'مكتملة' : backup.status === 'pending' ? 'جارية' : 'فشلت'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد سجلات للنسخ الاحتياطية
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManagement;