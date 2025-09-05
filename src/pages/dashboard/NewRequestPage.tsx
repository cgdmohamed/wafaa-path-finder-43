import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Scale, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';

const NewRequestPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    case_type: '',
    description: '',
    priority: 3
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "عنوان الطلب مطلوب",
        variant: "destructive"
      });
      return false;
    }

    if (formData.title.length < 5) {
      toast({
        title: "خطأ في البيانات",
        description: "العنوان يجب أن يكون 5 أحرف على الأقل",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.case_type) {
      toast({
        title: "خطأ في البيانات",
        description: "نوع القضية مطلوب",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "وصف القضية مطلوب",
        variant: "destructive"
      });
      return false;
    }

    if (formData.description.length < 20) {
      toast({
        title: "خطأ في البيانات",
        description: "الوصف يجب أن يكون 20 حرفاً على الأقل",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
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

      // Generate a simple case number since we don't have the auto-generate function
      const caseNumber = `CASE-${Date.now()}`;

      const { error } = await supabase
        .from('cases')
        .insert({
          case_number: caseNumber,
          client_id: user.id,
          title: formData.title,
          case_type: formData.case_type as any, // Type assertion for enum
          description: formData.description,
          priority: formData.priority,
          status: 'initial'
        });

      if (error) {
        toast({
          title: "خطأ في تقديم الطلب",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم تقديم الطلب بنجاح",
          description: "سيتم مراجعة طلبك والتواصل معك قريباً"
        });
        navigate('/dashboard/requests');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تقديم الطلب",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/requests">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">طلب استشارة جديد</h1>
          <p className="text-muted-foreground">املئي النموذج أدناه لتقديم طلب استشارة قانونية</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            تفاصيل طلب الاستشارة
          </CardTitle>
          <CardDescription>
            يرجى تقديم معلومات مفصلة عن القضية للحصول على أفضل استشارة قانونية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الطلب *</Label>
            <Input
              id="title"
              placeholder="مثال: استشارة حول عقد العمل"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="case_type">نوع القضية *</Label>
            <Select onValueChange={(value) => handleInputChange('case_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختاري نوع القضية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment">قضايا العمل</SelectItem>
                <SelectItem value="divorce">قضايا الطلاق</SelectItem>
                <SelectItem value="custody">قضايا الحضانة</SelectItem>
                <SelectItem value="domestic_violence">العنف الأسري</SelectItem>
                <SelectItem value="inheritance">قضايا الميراث</SelectItem>
                <SelectItem value="property">قضايا عقارية</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">مستوى الأولوية</Label>
            <Select onValueChange={(value) => handleInputChange('priority', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="اختاري مستوى الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">عاجل جداً</SelectItem>
                <SelectItem value="2">عاجل</SelectItem>
                <SelectItem value="3">عادي</SelectItem>
                <SelectItem value="4">غير عاجل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف تفصيلي للقضية *</Label>
            <Textarea
              id="description"
              placeholder="يرجى وصف القضية بالتفصيل، مع ذكر جميع الوقائع والظروف المتعلقة بها..."
              className="min-h-32"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التقديم...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  تقديم الطلب
                </>
              )}
            </Button>
            <Link to="/dashboard/requests">
              <Button variant="outline" type="button">
                إلغاء
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">إرشادات لتقديم طلب فعال</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li>• كوني دقيقة ومفصلة في وصف القضية</li>
            <li>• اذكري جميع الوقائع والأدلة المتاحة</li>
            <li>• حددي الهدف المطلوب من الاستشارة</li>
            <li>• في حالة الطوارئ، اتصلي بنا مباشرة</li>
            <li>• ستتم مراجعة طلبك خلال 24-48 ساعة</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequestPage;