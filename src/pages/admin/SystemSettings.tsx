import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, 
  Globe, 
  Bell,
  Clock,
  Lock,
  Database,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useSystemSettings } from '@/hooks/useAdminData';

const SystemSettings = () => {
  const { settings, isLoading, isSaving, error, saveSettings, refetch } = useSystemSettings();
  
  // Local form state
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    contact_email: '',
    contact_phone: '',
    site_description: '',
    address: '',
    notifications: {
      email: true,
      sms: true,
      appointments: true,
      case_updates: true
    },
    working_hours: {
      start_day: 'الأحد',
      end_day: 'الخميس',
      start_time: '08:00',
      end_time: '16:00',
      allow_outside_hours: false
    },
    security: {
      two_factor: false,
      data_encryption: true,
      audit_log: true,
      session_timeout: 30,
      max_login_attempts: 5
    },
    maintenance: {
      auto_backup: true,
      cleanup_temp: true,
      backup_time: '23:45',
      retention_days: 30
    }
  });

  // Update form data when settings load
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        site_name: typeof settings.site_name === 'string' ? settings.site_name : (settings.site_name || ''),
        site_url: typeof settings.site_url === 'string' ? settings.site_url : (settings.site_url || ''),
        contact_email: typeof settings.contact_email === 'string' ? settings.contact_email : (settings.contact_email || ''),
        contact_phone: typeof settings.contact_phone === 'string' ? settings.contact_phone : (settings.contact_phone || ''),
        site_description: typeof settings.site_description === 'string' ? settings.site_description : (settings.site_description || ''),
        address: typeof settings.address === 'string' ? settings.address : (settings.address || ''),
        notifications: settings.notifications && typeof settings.notifications === 'object' ? 
          { ...formData.notifications, ...settings.notifications } : formData.notifications,
        working_hours: settings.working_hours && typeof settings.working_hours === 'object' ? 
          { ...formData.working_hours, ...settings.working_hours } : formData.working_hours,
        security: settings.security && typeof settings.security === 'object' ? 
          { ...formData.security, ...settings.security } : formData.security,
        maintenance: settings.maintenance && typeof settings.maintenance === 'object' ? 
          { ...formData.maintenance, ...settings.maintenance } : formData.maintenance
      });
    }
  }, [settings]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedChange = (section: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    await saveSettings(formData);
  };

  if (error) {
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
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">خطأ في تحميل الإعدادات</h3>
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
            <Settings className="w-8 h-8 text-primary" />
            إعدادات النظام
          </h1>
          <p className="text-muted-foreground">تكوين إعدادات النظام العامة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            إعادة تحميل
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={isSaving || isLoading} data-testid="settings-save">
            <Save className="w-4 h-4" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card data-testid="general-settings">
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
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input 
                  id="site_name" 
                  value={formData.site_name}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_url">رابط الموقع</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input 
                  id="site_url" 
                  value={formData.site_url}
                  onChange={(e) => handleInputChange('site_url', e.target.value)}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">البريد الإلكتروني</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input 
                  id="contact_email" 
                  type="email" 
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">رقم الهاتف</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input 
                  id="contact_phone" 
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">وصف الموقع</Label>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <Textarea 
                id="site_description" 
                rows={3}
                value={formData.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input 
                id="address" 
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            )}
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
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">إرسال إشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch 
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات الرسائل النصية</Label>
                    <p className="text-sm text-muted-foreground">إرسال إشعارات عبر الرسائل النصية</p>
                  </div>
                  <Switch 
                    checked={formData.notifications.sms}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'sms', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات المواعيد</Label>
                    <p className="text-sm text-muted-foreground">تذكير المستخدمين بالمواعيد القادمة</p>
                  </div>
                  <Switch 
                    checked={formData.notifications.appointments}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'appointments', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات تحديثات القضايا</Label>
                    <p className="text-sm text-muted-foreground">إشعار العملاء بتحديثات قضاياهم</p>
                  </div>
                  <Switch 
                    checked={formData.notifications.case_updates}
                    onCheckedChange={(checked) => handleNestedChange('notifications', 'case_updates', checked)}
                  />
                </div>
              </>
            )}
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
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>من يوم</Label>
                  <Input 
                    value={formData.working_hours.start_day}
                    onChange={(e) => handleNestedChange('working_hours', 'start_day', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>إلى يوم</Label>
                  <Input 
                    value={formData.working_hours.end_day}
                    onChange={(e) => handleNestedChange('working_hours', 'end_day', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>من الساعة</Label>
                  <Input 
                    type="time" 
                    value={formData.working_hours.start_time}
                    onChange={(e) => handleNestedChange('working_hours', 'start_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>إلى الساعة</Label>
                  <Input 
                    type="time" 
                    value={formData.working_hours.end_time}
                    onChange={(e) => handleNestedChange('working_hours', 'end_time', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.working_hours.allow_outside_hours}
                  onCheckedChange={(checked) => handleNestedChange('working_hours', 'allow_outside_hours', checked)}
                />
                <Label>السماح بالحجز خارج ساعات العمل</Label>
              </div>
            </>
          )}
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
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>المصادقة الثنائية</Label>
                    <p className="text-sm text-muted-foreground">تفعيل المصادقة الثنائية للمدراء</p>
                  </div>
                  <Switch 
                    checked={formData.security.two_factor}
                    onCheckedChange={(checked) => handleNestedChange('security', 'two_factor', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تشفير البيانات الحساسة</Label>
                    <p className="text-sm text-muted-foreground">تشفير المستندات والمعلومات الشخصية</p>
                  </div>
                  <Switch 
                    checked={formData.security.data_encryption}
                    onCheckedChange={(checked) => handleNestedChange('security', 'data_encryption', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>سجل المراجعة</Label>
                    <p className="text-sm text-muted-foreground">تسجيل جميع العمليات الحساسة</p>
                  </div>
                  <Switch 
                    checked={formData.security.audit_log}
                    onCheckedChange={(checked) => handleNestedChange('security', 'audit_log', checked)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>مدة انتهاء الجلسة (بالدقائق)</Label>
                  <Input 
                    type="number" 
                    value={formData.security.session_timeout}
                    onChange={(e) => handleNestedChange('security', 'session_timeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>عدد محاولات تسجيل الدخول المسموحة</Label>
                  <Input 
                    type="number" 
                    value={formData.security.max_login_attempts}
                    onChange={(e) => handleNestedChange('security', 'max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}
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
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>النسخ الاحتياطية التلقائية</Label>
                    <p className="text-sm text-muted-foreground">نسخ احتياطية يومية لقاعدة البيانات</p>
                  </div>
                  <Switch 
                    checked={formData.maintenance.auto_backup}
                    onCheckedChange={(checked) => handleNestedChange('maintenance', 'auto_backup', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تنظيف الملفات المؤقتة</Label>
                    <p className="text-sm text-muted-foreground">حذف الملفات المؤقتة القديمة تلقائياً</p>
                  </div>
                  <Switch 
                    checked={formData.maintenance.cleanup_temp}
                    onCheckedChange={(checked) => handleNestedChange('maintenance', 'cleanup_temp', checked)}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>وقت النسخ الاحتياطي اليومي</Label>
                  <Input 
                    type="time" 
                    value={formData.maintenance.backup_time}
                    onChange={(e) => handleNestedChange('maintenance', 'backup_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>مدة الاحتفاظ بالنسخ (أيام)</Label>
                  <Input 
                    type="number" 
                    value={formData.maintenance.retention_days}
                    onChange={(e) => handleNestedChange('maintenance', 'retention_days', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;