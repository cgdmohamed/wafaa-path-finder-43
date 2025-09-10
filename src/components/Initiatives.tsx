import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Shield, 
  GraduationCap, 
  Megaphone, 
  Heart,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  max_participants: number | null;
  current_participants: number;
  registration_link: string | null;
  image_url: string | null;
  is_featured: boolean;
  organizer_id: string | null;
  created_at: string;
  updated_at: string;
}

const Initiatives = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInitiatives(data || []);
    } catch (error: any) {
      console.error('Error fetching initiatives:', error);
      toast({
        title: "خطأ في تحميل المبادرات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const staticInitiatives = [
    {
      icon: Users,
      title: "مبادرة الصلح ودياً",
      description: "برنامج متخصص في الوساطة والصلح المجتمعي لحل النزاعات الأسرية بطرق ودية وشرعية",
      status: "نشطة",
      participants: "+200 حالة",
      features: ["وساطة متخصصة", "حلول شرعية", "متابعة مستمرة", "خصوصية تامة"],
      color: "bg-primary/10"
    },
    {
      icon: Shield,
      title: "مبادرة درع",
      description: "مبادرة لحماية ودعم النساء المعرضات للعنف الأسري وتقديم الدعم القانوني والنفسي",
      status: "نشطة",
      participants: "+150 مستفيدة",
      features: ["دعم عاجل", "مأوى آمن", "استشارة قانونية", "تأهيل نفسي"],
      color: "bg-red-100"
    },
    {
      icon: GraduationCap,
      title: "المعسكر القانوني الصيفي",
      description: "برنامج تدريبي مكثف للطالبات والخريجات الجدد في مجال القانون والخدمات القانونية",
      status: "موسمية",
      participants: "+100 متدربة",
      features: ["تدريب عملي", "شهادات معتمدة", "فرص توظيف", "شبكة تواصل"],
      color: "bg-green-100"
    },
    {
      icon: Megaphone,
      title: "حملات التوعية",
      description: "حملات مجتمعية لنشر الوعي القانوني وتعريف المرأة بحقوقها في المجتمع",
      status: "مستمرة",
      participants: "+5000 مستفيدة",
      features: ["ورش توعوية", "مواد تثقيفية", "محاضرات عامة", "حملات إعلامية"],
      color: "bg-blue-100"
    }
  ];

  const upcomingEvents = [
    {
      title: "ورشة الحقوق الأسرية",
      date: "15 ديسمبر 2024",
      location: "مقر الجمعية - الرياض",
      type: "ورشة تدريبية"
    },
    {
      title: "محاضرة حقوق المرأة في العمل",
      date: "20 ديسمبر 2024",
      location: "جامعة الأميرة نورة",
      type: "محاضرة عامة"
    },
    {
      title: "معرض الخدمات القانونية",
      date: "25 ديسمبر 2024",
      location: "مركز الرياض الدولي للمؤتمرات",
      type: "معرض"
    }
  ];

  return (
    <section id="initiatives" className="py-20 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">مبادراتنا</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6">المبادرات والمشاريع</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            نفخر بتقديم مجموعة من المبادرات والمشاريع التنموية التي تهدف إلى تمكين المرأة وحماية حقوقها في المجتمع
          </p>
        </div>

        {/* المبادرات الرئيسية */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : initiatives.length > 0 ? (
            initiatives.map((initiative) => (
            <Card key={initiative.id} className="border border-border/50 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-right">{initiative.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={initiative.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {initiative.status === 'active' ? 'نشطة' : 'غير نشطة'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {initiative.current_participants} مشارك
                          {initiative.max_participants && ` من ${initiative.max_participants}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-right leading-relaxed">
                  {initiative.description}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">نوع: {initiative.type}</span>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  {initiative.location && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">{initiative.location}</span>
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                  {initiative.start_date && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(initiative.start_date).toLocaleDateString('ar')}
                      </span>
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                  {initiative.end_date && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        حتى {new Date(initiative.end_date).toLocaleDateString('ar')}
                      </span>
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
                {initiative.registration_link ? (
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-primary hover:text-primary-foreground"
                    onClick={() => window.open(initiative.registration_link!, '_blank')}
                  >
                    سجل الآن
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground">
                    تعرف على التفاصيل
                  </Button>
                )}
              </CardContent>
            </Card>
            ))
          ) : (
            staticInitiatives.map((initiative, index) => (
              <Card key={index} className="border border-border/50 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${initiative.color} rounded-xl flex items-center justify-center`}>
                        <initiative.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-right">{initiative.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={initiative.status === 'نشطة' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {initiative.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{initiative.participants}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-right leading-relaxed">
                    {initiative.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {initiative.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">{feature}</span>
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground">
                    تعرف على التفاصيل
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* الفعاليات القادمة */}
        <div className="bg-gradient-to-r from-primary/5 via-secondary/10 to-accent/5 rounded-3xl p-8 lg:p-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-primary">الفعاليات القادمة</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="border border-border/50 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">{event.type}</Badge>
                  <h4 className="text-lg font-semibold mb-3 text-right">{event.title}</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">{event.date}</span>
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">{event.location}</span>
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    سجل الآن
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* دعوة للمشاركة */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-primary mb-4">شاركي في مبادراتنا</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            كوني جزءاً من التغيير الإيجابي في المجتمع، شاركي في مبادراتنا أو اقترحي مبادرة جديدة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light gap-2">
              <Heart className="w-5 h-5" />
              تطوعي معنا
            </Button>
            <Button variant="outline" size="lg" className="gap-2 border-primary hover:bg-primary hover:text-primary-foreground">
              <Megaphone className="w-5 h-5" />
              اقترحي مبادرة
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Initiatives;