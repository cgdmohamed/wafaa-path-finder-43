import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const Services = () => {
  const quickServices = [
    {
      icon: Phone,
      title: "اطلب استشارة",
      description: "استشارة قانونية فورية مع محامية متخصصة",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: FileText,
      title: "قدم طلب دعم قانوني",
      description: "احصل على دعم قانوني شامل لقضيتك",
      color: "bg-secondary/20 text-primary"
    },
    {
      icon: Users,
      title: "احجز جلسة صلح",
      description: "جلسات صلح مجتمعي متخصصة",
      color: "bg-accent/20 text-primary"
    },
    {
      icon: FileText,
      title: "إعداد اللوائح والمذكرات",
      description: "صياغة وإعداد المستندات القانونية",
      color: "bg-primary/10 text-primary"
    }
  ];

  const mainServices = [
    {
      icon: Scale,
      title: "الاستشارات القانونية",
      description: "استشارات متخصصة في جميع المجالات القانونية المتعلقة بالمرأة",
      features: ["استشارات هاتفية", "استشارات مكتوبة", "استشارات عاجلة", "متابعة قانونية"]
    },
    {
      icon: Gavel,
      title: "الدعم في القضايا",
      description: "مرافقة قانونية شاملة في جميع مراحل التقاضي",
      features: ["تمثيل قانوني", "إعداد المرافعات", "متابعة الجلسات", "تنفيذ الأحكام"]
    },
    {
      icon: Users,
      title: "الصلح المجتمعي",
      description: "حلول ودية للنزاعات الأسرية والمجتمعية",
      features: ["وساطة متخصصة", "حلول شرعية", "اتفاقيات ملزمة", "متابعة التنفيذ"]
    },
    {
      icon: Heart,
      title: "الدعم النفسي والاجتماعي",
      description: "مرافقة نفسية واجتماعية للمرأة في رحلتها القانونية",
      features: ["جلسات دعم فردية", "مجموعات الدعم", "برامج التأهيل", "الإرشاد الأسري"]
    },
    {
      icon: GraduationCap,
      title: "التدريب والتأهيل",
      description: "برامج تدريبية لتمكين المرأة قانونياً ومهنياً",
      features: ["دورات قانونية", "ورش تخصصية", "شهادات معتمدة", "تدريب عملي"]
    },
    {
      icon: BookOpen,
      title: "التوعية القانونية",
      description: "نشر الثقافة القانونية والوعي بالحقوق",
      features: ["محاضرات توعوية", "مواد تثقيفية", "حملات مجتمعية", "الموسوعة القانونية"]
    }
  ];

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
            {quickServices.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-all cursor-pointer border border-border/50">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{service.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <Button className="w-full">ابدأ الآن</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* الخدمات الرئيسية */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-12 text-primary">خدماتنا الرئيسية</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainServices.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border border-border/50">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-right">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-right leading-relaxed">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">{feature}</span>
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6 hover:bg-primary hover:text-primary-foreground">
                    تعرف على المزيد
                  </Button>
                </CardContent>
              </Card>
            ))}
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
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light gap-2">
                <Phone className="w-5 h-5" />
                اتصل الآن
              </Button>
              <Button variant="outline" size="lg" className="gap-2 border-primary hover:bg-primary hover:text-primary-foreground">
                <MessageSquare className="w-5 h-5" />
                محادثة فورية
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;