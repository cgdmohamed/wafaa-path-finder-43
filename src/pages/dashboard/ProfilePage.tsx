import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, MapPin, Calendar, AlertTriangle, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SkeletonCard } from '@/components/ui/skeleton-layouts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  id: string;
  user_id: string;
  role: 'client' | 'lawyer' | 'admin' | 'moderator';
  granted_by?: string;
  granted_at: string;
}

const profileSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  phone: z.string().regex(/^05\d{8}$/, 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام').optional().or(z.literal('')),
  national_id: z.string().regex(/^\d{10}$/, 'رقم الهوية يجب أن يتكون من 10 أرقام').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().regex(/^05\d{8}$/, 'رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام').optional().or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

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
        // Set form default values
        if (profileData) {
          reset({
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            national_id: profileData.national_id || '',
            date_of_birth: profileData.date_of_birth || '',
            address: profileData.address || '',
            emergency_contact: profileData.emergency_contact || '',
            emergency_phone: profileData.emergency_phone || ''
          });
        }
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
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
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: ProfileFormData) => {
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

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "خطأ في حفظ البيانات",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setProfile(updatedProfile);
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

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      'client': 'secondary',
      'lawyer': 'default',
      'admin': 'destructive',
      'moderator': 'outline'
    };
    return variants[role] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">الرئيسية</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>الملف الشخصي</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>الملف الشخصي</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الملف الشخصي</h1>
          <p className="text-muted-foreground">إدارة بياناتك الشخصية ومعلومات الاتصال</p>
        </div>
        {userRole && (
          <Badge variant={getRoleBadgeVariant(userRole.role)}>
            {getRoleDisplayName(userRole.role)}
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(handleSave)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
              <CardDescription>
                البيانات الشخصية الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  placeholder="الاسم الكامل"
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="national_id">رقم الهوية الوطنية</Label>
                <Input
                  id="national_id"
                  placeholder="1234567890"
                  {...register('national_id')}
                />
                {errors.national_id && (
                  <p className="text-sm text-destructive">{errors.national_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register('date_of_birth')}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                معلومات الاتصال
              </CardTitle>
              <CardDescription>
                بيانات التواصل والعنوان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  placeholder="05xxxxxxxx"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  placeholder="العنوان الكامل"
                  rows={3}
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              جهة الاتصال في حالات الطوارئ
            </CardTitle>
            <CardDescription>
              معلومات شخص للتواصل معه في حالات الطوارئ
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">اسم جهة الاتصال</Label>
              <Input
                id="emergency_contact"
                placeholder="اسم الشخص للتواصل"
                {...register('emergency_contact')}
              />
              {errors.emergency_contact && (
                <p className="text-sm text-destructive">{errors.emergency_contact.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_phone">رقم هاتف الطوارئ</Label>
              <Input
                id="emergency_phone"
                placeholder="05xxxxxxxx"
                {...register('emergency_phone')}
              />
              {errors.emergency_phone && (
                <p className="text-sm text-destructive">{errors.emergency_phone.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;