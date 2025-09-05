import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Palette,
  Bell,
  Lock,
  Database,
  Save,
  RefreshCw
} from 'lucide-react';

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            إعدادات النظام
          </h1>
          <p className="text-muted-foreground">تكوين إعدادات النظام العامة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            إعادة تحميل
          </Button>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>إعدادات المعلومات الأساسية للنظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="site_name">اسم الموقع</Label>
              <Input id="site_name" defaultValue="جمعية وفاء للخدمات القانونية للمرأة" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_url">رابط الموقع</Label>
              <Input id="site_url" defaultValue="https://wafaa-legal.org" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">البريد الإلكتروني</Label>
              <Input id="contact_email" type="email" defaultValue="info@wafaa-legal.org" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">رقم الهاتف</Label>
              <Input id="contact_phone" defaultValue="+966 11 234 5678" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">وصف الموقع</Label>
            <Textarea 
              id="site_description" 
              rows={3}
              defaultValue="جمعية وفاء للخدمات القانونية للمرأة - نقدم المساعدة القانونية والاستشارات المتخصصة للنساء في المملكة العربية السعودية"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input id="address" defaultValue="الرياض، المملكة العربية السعودية" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            إعدادات الإشعارات
          </CardTitle>
          <CardDescription>تكوين الإشعارات والتنبيهات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات البريد الإلكتروني</Label>
                <p className="text-sm text-muted-foreground">إرسال إشعارات عبر البريد الإلكتروني</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات الرسائل النصية</Label>
                <p className="text-sm text-muted-foreground">إرسال إشعارات عبر الرسائل النصية</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات المواعيد</Label>
                <p className="text-sm text-muted-foreground">تذكير المستخدمين بالمواعيد القادمة</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>إشعارات تحديثات القضايا</Label>
                <p className="text-sm text-muted-foreground">إشعار العملاء بتحديثات قضاياهم</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            ساعات العمل
          </CardTitle>
          <CardDescription>تحديد ساعات العمل الرسمية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>من يوم</Label>
              <Input defaultValue="الأحد" />
            </div>
            <div className="space-y-2">
              <Label>إلى يوم</Label>
              <Input defaultValue="الخميس" />
            </div>
            <div className="space-y-2">
              <Label>من الساعة</Label>
              <Input type="time" defaultValue="08:00" />
            </div>
            <div className="space-y-2">
              <Label>إلى الساعة</Label>
              <Input type="time" defaultValue="16:00" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch />
            <Label>السماح بالحجز خارج ساعات العمل</Label>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            إعدادات الأمان
          </CardTitle>
          <CardDescription>تكوين إعدادات الأمان والخصوصية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>المصادقة الثنائية</Label>
                <p className="text-sm text-muted-foreground">تفعيل المصادقة الثنائية للمدراء</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تشفير البيانات الحساسة</Label>
                <p className="text-sm text-muted-foreground">تشفير المستندات والمعلومات الشخصية</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>سجل المراجعة</Label>
                <p className="text-sm text-muted-foreground">تسجيل جميع العمليات الحساسة</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>مدة انتهاء الجلسة (بالدقائق)</Label>
              <Input type="number" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label>عدد محاولات تسجيل الدخول المسموحة</Label>
              <Input type="number" defaultValue="5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            صيانة النظام
          </CardTitle>
          <CardDescription>إعدادات صيانة النظام والنسخ الاحتياطية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>النسخ الاحتياطية التلقائية</Label>
                <p className="text-sm text-muted-foreground">نسخ احتياطية يومية لقاعدة البيانات</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تنظيف الملفات المؤقتة</Label>
                <p className="text-sm text-muted-foreground">حذف الملفات المؤقتة القديمة تلقائياً</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>وقت النسخ الاحتياطي اليومي</Label>
              <Input type="time" defaultValue="23:45" />
            </div>
            <div className="space-y-2">
              <Label>مدة الاحتفاظ بالنسخ (أيام)</Label>
              <Input type="number" defaultValue="30" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;