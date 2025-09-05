import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Eye,
  UserCheck,
  Key,
  Activity,
  Clock,
  FileText,
  RefreshCw,
  Download
} from 'lucide-react';
import { useSecurityData } from '@/hooks/useAdminData';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const SecurityManagement = () => {
  const { auditLogs, securityReports, isLoading, error, refetch } = useSecurityData();

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'failed':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">نجح</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      default:
        return <Badge variant="secondary">جاري</Badge>;
    }
  };

  const failedLogins = auditLogs.filter(log => 
    log.action === 'login' && log.status === 'failed'
  );

  const recentFailedLogins = failedLogins.filter(log => 
    new Date(log.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              إدارة الأمان
            </h1>
            <p className="text-muted-foreground">مراقبة الأمان وإدارة الصلاحيات</p>
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
            <Shield className="w-8 h-8 text-primary" />
            إدارة الأمان
          </h1>
          <p className="text-muted-foreground">مراقبة الأمان وإدارة الصلاحيات</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* Security Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
            <Shield className={`h-4 w-4 ${recentFailedLogins.length > 10 ? 'text-yellow-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${recentFailedLogins.length > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
              {recentFailedLogins.length > 10 ? 'تحذير' : 'آمن'}
            </div>
            <p className="text-xs text-muted-foreground">
              {recentFailedLogins.length > 10 ? 'مراقبة محاولات الدخول' : 'جميع الأنظمة تعمل بشكل طبيعي'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محاولات الدخول الفاشلة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{recentFailedLogins.length}</div>
            )}
            <p className="text-xs text-muted-foreground">في آخر 24 ساعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{auditLogs.length}</div>
            )}
            <p className="text-xs text-muted-foreground">سجل مراجعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقارير الأمنية</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{securityReports.length}</div>
            )}
            <p className="text-xs text-muted-foreground">تقرير متاح</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            تنبيهات الأمان الحديثة
          </CardTitle>
          <CardDescription>التنبيهات المستندة إلى سجلات المراجعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))
            ) : failedLogins.length > 0 ? (
              failedLogins.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">محاولة دخول فاشلة</p>
                      <p className="text-sm text-muted-foreground">
                        من عنوان IP: {log.ipAddress || 'غير معروف'}
                        {log.userEmail && ` • المستخدم: ${log.userEmail}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ar })}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    تحقق
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>لا توجد تنبيهات أمنية</p>
                <p className="text-sm">جميع محاولات الدخول ناجحة</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Access Logs and Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              سجل الوصول
            </CardTitle>
            <CardDescription>آخر عمليات تسجيل الدخول</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-secondary/10 rounded">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : auditLogs.length > 0 ? (
                auditLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-secondary/10 rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">{log.userEmail || 'مستخدم غير معروف'}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.ipAddress} • {log.action} • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد سجلات وصول
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              التقارير الأمنية
            </CardTitle>
            <CardDescription>تقارير الأمان والمراجعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-5 h-5" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              ) : securityReports.length > 0 ? (
                securityReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString('ar')} • {formatFileSize(report.fileSize)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                        {report.status === 'completed' ? 'مكتمل' : 'جاري'}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-2" disabled={report.status !== 'completed'}>
                        <Download className="w-4 h-4" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد تقارير أمنية</p>
                  <p className="text-sm">سيتم إنشاء التقارير تلقائياً</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityManagement;