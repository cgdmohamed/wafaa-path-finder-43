import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    confirmPassword: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (isSignUp: boolean) => {
    if (!formData.email || !formData.password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء البريد الإلكتروني وكلمة المرور",
        variant: "destructive"
      });
      return false;
    }

    if (isSignUp) {
      if (!formData.fullName) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال الاسم الكامل",
          variant: "destructive"
        });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "خطأ في كلمة المرور",
          description: "كلمة المرور وتأكيدها غير متطابقان",
          variant: "destructive"
        });
        return false;
      }
      if (formData.password.length < 6) {
        toast({
          title: "كلمة مرور ضعيفة",
          description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "البريد الإلكتروني مسجل بالفعل",
            description: "يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر",
            variant: "destructive"
          });
        } else {
          toast({
            title: "خطأ في التسجيل",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm(false)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "بيانات دخول خاطئة",
            description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
            variant: "destructive"
          });
        } else {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "مرحباً بك",
          description: "تم تسجيل الدخول بنجاح"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary">جمعية وفاء</h1>
          <p className="text-muted-foreground">للخدمات القانونية للمرأة</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-center text-primary">الدخول إلى حسابك</CardTitle>
            <CardDescription className="text-center">
              احصلي على استشارات قانونية متخصصة ومتابعة شاملة لقضاياك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  إنشاء حساب
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="أدخلي بريدك الإلكتروني"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="text-right"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخلي كلمة المرور"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="text-right pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-primary-light"
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">الاسم الكامل</Label>
                  <Input
                    id="signup-name"
                    placeholder="أدخلي اسمك الكامل"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">رقم الهاتف (اختياري)</Label>
                  <Input
                    id="signup-phone"
                    placeholder="05xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="text-right"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="أدخلي بريدك الإلكتروني"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="text-right"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخلي كلمة مرور قوية (6 أحرف على الأقل)"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="text-right pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">تأكيد كلمة المرور</Label>
                  <Input
                    id="signup-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="أعيدي كتابة كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="text-right"
                    dir="ltr"
                  />
                </div>
                <Button
                  onClick={handleSignUp}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-primary-light"
                >
                  {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-muted-foreground"
              >
                العودة إلى الموقع الرئيسي
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;