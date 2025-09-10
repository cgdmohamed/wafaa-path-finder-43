import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Scale, 
  FileText, 
  Users, 
  BookOpen, 
  Calendar, 
  Phone,
  MessageSquare,
  UserCheck,
  Gavel,
  Heart,
  GraduationCap,
  Shield
} from 'lucide-react';
import ServiceRequestModal from './modals/ServiceRequestModal';

interface Service {
  id: string;
  title: string;
  description: string;
  type: string;
  icon_name: string;
  features?: string[];
  price?: number;
  duration_minutes?: number;
}

const Services = () => {
  const [quickServices, setQuickServices] = useState<Service[]>([]);
  const [mainServices, setMainServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      const services = data || [];
      setQuickServices(services.filter(s => s.type === 'quick'));
      setMainServices(services.filter(s => s.type === 'main'));
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "خطأ في تحميل الخدمات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Phone, FileText, Users, Scale, Gavel, Heart, GraduationCap, BookOpen, Shield
    };
    return icons[iconName] || FileText;
  };

  const handleServiceRequest = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">خدماتنا</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نقدم مجموعة شاملة من الخدمات القانونية والاجتماعية المتخصصة للمرأة في جميع مراحل حياتها
          </p>
        </div>

        {/* الخدمات السريعة */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-8 text-primary">خدمات سريعة</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl mx-auto mb-4 animate-pulse"></div>
                    <div className="h-6 w-24 bg-muted rounded mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 w-full bg-muted rounded mb-4 animate-pulse"></div>
                    <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              quickServices.map((service, index) => {
                const IconComponent = getIconComponent(service.icon_name);
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-all cursor-pointer border border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{service.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      {service.price && (
                        <Badge variant="secondary" className="mb-3">
                          {service.price} ريال - {service.duration_minutes} دقيقة
                        </Badge>
                      )}
                      <Button 
                        className="w-full"
                        onClick={() => handleServiceRequest(service)}
                      >
                        ابدأ الآن
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* الخدمات الرئيسية */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-12 text-primary">خدماتنا الرئيسية</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border border-border/50">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-muted rounded-xl mb-4 animate-pulse"></div>
                    <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2 mb-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              mainServices.map((service, index) => {
                const IconComponent = getIconComponent(service.icon_name);
                return (
                  <Card key={service.id} className="hover:shadow-xl transition-all border border-border/50">
                    <CardHeader className="pb-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <IconComponent className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl text-right">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6 text-right leading-relaxed">
                        {service.description}
                      </p>
                      {service.features && (
                        <div className="space-y-2">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center justify-end gap-2">
                              <span className="text-sm text-muted-foreground">{feature}</span>
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 hover:bg-primary hover:text-primary-foreground"
                          asChild
                        >
                          <Link to={`/service/${service.id}`}>
                            التفاصيل
                          </Link>
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleServiceRequest(service)}
                        >
                          طلب الخدمة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* دعوة للعمل */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/5 via-secondary/10 to-accent/5 rounded-3xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
              هل تحتاجين استشارة قانونية عاجلة؟
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              فريقنا متاح على مدار الساعة لتقديم الدعم والاستشارة القانونية العاجلة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-light gap-2"
                onClick={() => handleServiceRequest({ 
                  id: 'emergency-call', 
                  title: 'استشارة هاتفية عاجلة',
                  description: 'استشارة قانونية فورية عبر الهاتف',
                  type: 'emergency',
                  icon_name: 'Phone'
                })}
              >
                <Phone className="w-5 h-5" />
                اتصل الآن
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 border-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleServiceRequest({
                  id: 'emergency-chat',
                  title: 'محادثة فورية',
                  description: 'استشارة قانونية فورية عبر المحادثة',
                  type: 'emergency',
                  icon_name: 'MessageSquare'
                })}
              >
                <MessageSquare className="w-5 h-5" />
                محادثة فورية
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ServiceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
      />
    </section>
  );
};

export default Services;