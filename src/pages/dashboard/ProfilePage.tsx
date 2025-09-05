import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_language: string;
}

interface UserRole {
  role: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "خطأ في المصادقة",
          description: "لم يتم العثور على بيانات المستخدم",
          variant: "destructive"
        });
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('granted_at', { ascending: false })
        .limit(1)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Role fetch error:', roleError);
      } else {
        setUserRole(roleData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast({
          title: "خطأ في حفظ البيانات",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم حفظ البيانات",
          description: "تم تحديث الملف الشخصي بنجاح"
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'client': 'عميلة',
      'lawyer': 'محامية',
      'admin': 'مديرة',
      'moderator': 'مشرفة'
    };
    return roleNames[role as keyof typeof roleNames] || 'عميلة';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الملف الشخصي</h1>
          <p className="text-muted-foreground">إدارة وتحديث بياناتك الشخصية</p>
        </div>
        {userRole && (
          <Badge variant="outline" className="text-sm">
            {getRoleDisplayName(userRole.role)}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الأساسية
            </CardTitle>
            <CardDescription>البيانات الشخصية الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                placeholder="أدخلي اسمك الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="national_id">رقم الهوية الوطنية</Label>
              <Input
                id="national_id"
                value={profile?.national_id || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, national_id: e.target.value } : null)}
                placeholder="أدخلي رقم هويتك الوطنية"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={profile?.date_of_birth || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, date_of_birth: e.target.value } : null)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              معلومات التواصل
            </CardTitle>
            <CardDescription>بيانات التواصل والعنوان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={profile?.phone || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="أدخلي رقم هاتفك"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={profile?.address || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="أدخلي عنوانك"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_language">اللغة المفضلة</Label>
              <Input
                id="preferred_language"
                value={profile?.preferred_language || 'ar'}
                onChange={(e) => setProfile(prev => prev ? { ...prev, preferred_language: e.target.value } : null)}
                placeholder="اللغة المفضلة"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              جهة الاتصال في حالات الطوارئ
            </CardTitle>
            <CardDescription>بيانات شخص للتواصل معه في حالات الطوارئ</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">اسم جهة الاتصال</Label>
              <Input
                id="emergency_contact"
                value={profile?.emergency_contact || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, emergency_contact: e.target.value } : null)}
                placeholder="اسم الشخص للتواصل في الطوارئ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">رقم هاتف الطوارئ</Label>
              <Input
                id="emergency_phone"
                value={profile?.emergency_phone || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, emergency_phone: e.target.value } : null)}
                placeholder="رقم هاتف جهة الاتصال"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;