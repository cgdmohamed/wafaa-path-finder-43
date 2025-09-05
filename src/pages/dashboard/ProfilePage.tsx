import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SkeletonCard } from '@/components/ui/skeleton-layouts';

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
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    national_id: '',
    date_of_birth: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    preferred_language: 'ar'
  });
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
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast({
          title: "خطأ في تحميل الملف الشخصي",
          description: profileError.message,
          variant: "destructive"
        });
      } else if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          national_id: profileData.national_id || '',
          date_of_birth: profileData.date_of_birth || '',
          address: profileData.address || '',
          emergency_contact: profileData.emergency_contact || '',
          emergency_phone: profileData.emergency_phone || '',
          preferred_language: profileData.preferred_language || 'ar'
        });
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('granted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roleError) {
        console.error('Role fetch error:', roleError);
      } else {
        setUserRole(roleData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "الاسم الكامل مطلوب",
        variant: "destructive"
      });
      return false;
    }

    if (formData.phone && !/^(05|5)[0-9]{8}$/.test(formData.phone)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام",
        variant: "destructive"
      });
      return false;
    }

    if (formData.national_id && !/^[1-2][0-9]{9}$/.test(formData.national_id)) {
      toast({
        title: "خطأ في رقم الهوية",
        description: "رقم الهوية يجب أن يتكون من 10 أرقام ويبدأ بـ 1 أو 2",
        variant: "destructive"
      });
      return false;
    }

    if (formData.emergency_phone && !/^(05|5)[0-9]{8}$/.test(formData.emergency_phone)) {
      toast({
        title: "خطأ في رقم هاتف الطوارئ",
        description: "رقم هاتف الطوارئ يجب أن يبدأ بـ 05 ويتكون من 10 أرقام",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "خطأ في المصادقة",
          description: "يرجى تسجيل الدخول مرة أخرى",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...formData,
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
        // Re-fetch profile to update state
        fetchProfile();
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground">إدارة وتحديث بياناتك الشخصية</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard className="md:col-span-2" />
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
              <Label htmlFor="full_name">الاسم الكامل *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="أدخلي اسمك الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="national_id">رقم الهوية الوطنية</Label>
              <Input
                id="national_id"
                value={formData.national_id}
                onChange={(e) => handleInputChange('national_id', e.target.value)}
                placeholder="أدخلي رقم هويتك الوطنية"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
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
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="05xxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="أدخلي عنوانك"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_language">اللغة المفضلة</Label>
              <Input
                id="preferred_language"
                value={formData.preferred_language}
                onChange={(e) => handleInputChange('preferred_language', e.target.value)}
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
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                placeholder="اسم الشخص للتواصل في الطوارئ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">رقم هاتف الطوارئ</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency_phone}
                onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                placeholder="05xxxxxxxx"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;