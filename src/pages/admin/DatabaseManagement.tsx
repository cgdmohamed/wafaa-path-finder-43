import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const DatabaseManagement = () => {
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
        <Button variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">جداول نشطة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">سجل في النظام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حجم قاعدة البيانات</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 MB</div>
            <p className="text-xs text-muted-foreground">من أصل 10 GB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر نسخة احتياطية</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23:45</div>
            <p className="text-xs text-muted-foreground">منذ 2 ساعة</p>
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
            {[
              { name: 'المستخدمين (profiles)', records: 156, status: 'healthy' },
              { name: 'القضايا (cases)', records: 89, status: 'healthy' },
              { name: 'المواعيد (appointments)', records: 234, status: 'healthy' },
              { name: 'المستندات (documents)', records: 567, status: 'warning' },
              { name: 'الرسائل (messages)', records: 201, status: 'healthy' }
            ].map((table) => (
              <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{table.name}</p>
                    <p className="text-sm text-muted-foreground">{table.records} سجل</p>
                  </div>
                </div>
                <Badge variant={table.status === 'healthy' ? 'default' : 'secondary'}>
                  {table.status === 'healthy' ? 'سليم' : 'تحذير'}
                </Badge>
              </div>
            ))}
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
            <div className="space-y-2">
              <p className="text-sm font-medium">آخر نسخة احتياطية تلقائية</p>
              <p className="text-sm text-muted-foreground">اليوم 23:45 - مكتملة بنجاح</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">النسخة التالية</p>
              <p className="text-sm text-muted-foreground">غداً 23:45 - مجدولة</p>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                نسخة احتياطية يدوية
              </Button>
              <Button variant="outline" size="sm">
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
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">وقت الاستجابة</span>
                <span className="text-sm font-medium">45ms</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-[75%]"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">استخدام المعالج</span>
                <span className="text-sm font-medium">23%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-[23%]"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">استخدام الذاكرة</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full w-[67%]"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>آخر العمليات على قاعدة البيانات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'نسخة احتياطية تلقائية', time: 'منذ ساعتين', status: 'success' },
              { action: 'تحديث جدول المستخدمين', time: 'منذ 4 ساعات', status: 'success' },
              { action: 'إضافة فهرس جديد', time: 'منذ 6 ساعات', status: 'success' },
              { action: 'تنظيف السجلات المؤقتة', time: 'منذ 8 ساعات', status: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-secondary/10 rounded">
                <div className="flex items-center gap-3">
                  {activity.status === 'success' ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                  {activity.status === 'success' ? 'نجح' : 'تحذير'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManagement;