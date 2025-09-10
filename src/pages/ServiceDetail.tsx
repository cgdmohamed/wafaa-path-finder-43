import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Clock, DollarSign, FileText, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import ServiceRequestModal from '@/components/modals/ServiceRequestModal';

interface Service {
  id: string;
  title: string;
  description: string;
  type: string;
  icon_name: string;
  features?: string[];
  price?: number;
  duration_minutes?: number;
  is_featured: boolean;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error: any) {
      console.error('Error fetching service:', error);
      toast({
        title: "خطأ في تحميل تفاصيل الخدمة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-32 bg-muted rounded mb-6 animate-pulse"></div>
            <div className="h-12 w-2/3 bg-muted rounded mb-4 animate-pulse"></div>
            <div className="h-6 w-full bg-muted rounded mb-8 animate-pulse"></div>
            <Card>
              <CardHeader>
                <div className="h-8 w-1/3 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">الخدمة غير موجودة</h1>
            <p className="text-muted-foreground mb-8">لم يتم العثور على الخدمة المطلوبة</p>
            <Button asChild>
              <Link to="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* التنقل */}
          <nav className="flex items-center gap-2 mb-8 text-sm">
            <Link to="/" className="text-primary hover:underline">الرئيسية</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/#services" className="text-primary hover:underline">الخدمات</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{service.title}</span>
          </nav>

          {/* عنوان الخدمة */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {service.type === 'quick' ? 'خدمة سريعة' : 'خدمة رئيسية'}
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-4">{service.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{service.description}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2 space-y-8">
              {/* تفاصيل الخدمة */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">تفاصيل الخدمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-right leading-relaxed">
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>

                  {service.features && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-right">ما يشمله:</h3>
                      <div className="space-y-3">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-end gap-3">
                            <span className="text-muted-foreground">{feature}</span>
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* معلومات إضافية */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">كيف تعمل الخدمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div className="text-right">
                        <h4 className="font-semibold mb-1">تقديم الطلب</h4>
                        <p className="text-sm text-muted-foreground">املأي النموذج وقدمي طلبك بسهولة</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div className="text-right">
                        <h4 className="font-semibold mb-1">المراجعة والتقييم</h4>
                        <p className="text-sm text-muted-foreground">سيقوم فريقنا بمراجعة طلبك وتقييم الحالة</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div className="text-right">
                        <h4 className="font-semibold mb-1">التواصل والمتابعة</h4>
                        <p className="text-sm text-muted-foreground">سنتواصل معك لتحديد الخطوات التالية</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الشريط الجانبي */}
            <div className="space-y-6">
              {/* معلومات الخدمة */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-right">معلومات الخدمة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.price && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{service.price} ريال</span>
                      </div>
                      <span className="text-sm text-muted-foreground">التكلفة</span>
                    </div>
                  )}
                  
                  {service.duration_minutes && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{service.duration_minutes} دقيقة</span>
                      </div>
                      <span className="text-sm text-muted-foreground">المدة</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{service.type === 'quick' ? 'فورية' : 'تفصيلية'}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">النوع</span>
                  </div>

                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-primary to-primary-light"
                    onClick={() => setIsModalOpen(true)}
                  >
                    طلب الخدمة الآن
                  </Button>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground text-center mb-4">تحتاجين مساعدة؟</p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Phone className="w-4 h-4" />
                        اتصلي بنا
                      </Button>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <MessageSquare className="w-4 h-4" />
                        محادثة فورية
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* العودة للخدمات */}
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link to="/#services" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                عودة إلى جميع الخدمات
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <ServiceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={service}
      />
    </div>
  );
};

export default ServiceDetail;