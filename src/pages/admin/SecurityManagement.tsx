import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const SecurityManagement = () => {
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
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </Button>
      </div>

      {/* Security Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">آمن</div>
            <p className="text-xs text-muted-foreground">جميع الأنظمة تعمل بشكل طبيعي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محاولات الدخول الفاشلة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">في آخر 24 ساعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجلسات النشطة</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">مستخدم متصل حالياً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر مراجعة أمنية</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">منذ ساعتين</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            تنبيهات الأمان
          </CardTitle>
          <CardDescription>التنبيهات والمشاكل الأمنية الحديثة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                type: 'warning', 
                title: 'محاولات دخول مشبوهة', 
                description: 'تم رصد 5 محاولات دخول فاشلة من نفس عنوان IP',
                time: 'منذ 15 دقيقة',
                action: 'حظر IP'
              },
              { 
                type: 'info', 
                title: 'تحديث أمني متاح', 
                description: 'يتوفر تحديث أمني لنظام إدارة البيانات',
                time: 'منذ ساعة',
                action: 'تطبيق التحديث'
              },
              { 
                type: 'success', 
                title: 'مراجعة أمنية مكتملة', 
                description: 'تمت المراجعة الأمنية الدورية بنجاح',
                time: 'منذ ساعتين',
                action: 'عرض التقرير'
              }
            ].map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  {alert.type === 'info' && <Shield className="w-5 h-5 text-blue-500" />}
                  {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Logs */}
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
              {[
                { user: 'admin@wafaa.org', time: 'منذ 5 دقائق', status: 'success', ip: '192.168.1.100' },
                { user: 'lawyer1@wafaa.org', time: 'منذ 15 دقيقة', status: 'success', ip: '192.168.1.101' },
                { user: 'unknown', time: 'منذ 30 دقيقة', status: 'failed', ip: '203.0.113.45' },
                { user: 'client@example.com', time: 'منذ 45 دقيقة', status: 'success', ip: '192.168.1.102' }
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-secondary/10 rounded">
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <div>
                      <p className="font-medium">{log.user}</p>
                      <p className="text-sm text-muted-foreground">{log.ip} • {log.time}</p>
                    </div>
                  </div>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                    {log.status === 'success' ? 'نجح' : 'فشل'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              إدارة الصلاحيات
            </CardTitle>
            <CardDescription>الأدوار والصلاحيات الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { role: 'المدير العام', users: 2, permissions: 'جميع الصلاحيات' },
                { role: 'المحاميات', users: 8, permissions: 'إدارة القضايا والمواعيد' },
                { role: 'المشرفات', users: 3, permissions: 'مراقبة النظام' },
                { role: 'العميلات', users: 156, permissions: 'استخدام الخدمات' }
              ].map((role, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{role.role}</p>
                    <p className="text-sm text-muted-foreground">{role.users} مستخدم</p>
                    <p className="text-xs text-muted-foreground">{role.permissions}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    عرض
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Reports */}
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
            {[
              { name: 'تقرير المراجعة الأمنية الشهرية', date: 'ديسمبر 2024', size: '2.4 MB' },
              { name: 'سجل محاولات الاختراق', date: 'الأسبوع الماضي', size: '856 KB' },
              { name: 'تقرير استخدام الصلاحيات', date: 'آخر 30 يوم', size: '1.2 MB' },
              { name: 'تحليل أنماط الوصول', date: 'الشهر الحالي', size: '3.1 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  تحميل
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityManagement;