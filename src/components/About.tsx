import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Eye, 
  Heart, 
  Shield, 
  Users, 
  Award,
  CheckCircle,
  Star
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "الأمانة",
      description: "نحافظ على سرية وخصوصية جميع المعلومات"
    },
    {
      icon: CheckCircle,
      title: "الحوكمة",
      description: "نلتزم بأعلى معايير الشفافية والمساءلة"
    },
    {
      icon: Users,
      title: "التمكين",
      description: "نسعى لتمكين المرأة وتعزيز قدراتها"
    },
    {
      icon: Heart,
      title: "التشاركية",
      description: "نؤمن بأهمية العمل التشاركي والتعاوني"
    },
    {
      icon: Star,
      title: "الإتقان",
      description: "نسعى للتميز والإتقان في جميع خدماتنا"
    }
  ];

  const achievements = [
    { number: "+1000", label: "مستفيدة" },
    { number: "+500", label: "استشارة قانونية" },
    { number: "+100", label: "قضية مكتملة" },
    { number: "+50", label: "محامية متطوعة" },
    { number: "+20", label: "مبادرة مجتمعية" },
    { number: "24/7", label: "دعم متواصل" }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">من نحن</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6">جمعية وفاء للخدمات القانونية للمرأة</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            جمعية غير ربحية مرخصة من وزارة الموارد البشرية برقم (1778)، وتشرف عليها فنياً وزارة العدل، 
            تهدف إلى توعية المرأة بالجوانب القانونية وتعزيز قدراتها وتمكينها في إطار شرعي وأخلاقي لتحقيق بيئة مستقرة وآمنة.
          </p>
        </div>

        {/* الرؤية والرسالة */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border border-border/50 hover:shadow-lg transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">رؤيتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحو مجتمع حضاري ممكن لحقوق المرأة وقضاياها المعاصرة
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 hover:shadow-lg transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">رسالتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                تمكين الوعي والسلوك الحقوقي تجاه المرأة في إطار شرعي أخلاقي
              </p>
            </CardContent>
          </Card>
        </div>

        {/* القيم */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-primary">قيمنا</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border border-border/50 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* الإنجازات */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-primary">إنجازاتنا</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 mb-2">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">{achievement.number}</div>
                </div>
                <div className="text-sm text-muted-foreground">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* الفئة المستهدفة */}
        <div className="bg-gradient-to-r from-primary/5 via-secondary/10 to-accent/5 rounded-3xl p-8 lg:p-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-primary">نخدم</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">النساء ذوات الدخل المحدود</h4>
              <p className="text-sm text-muted-foreground">المتضررات قانونياً</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">المرأة العاملة</h4>
              <p className="text-sm text-muted-foreground">وسيدة الأعمال</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">الخريجات</h4>
              <p className="text-sm text-muted-foreground">أقسام الشريعة والقانون</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold">المجتمع عموماً</h4>
              <p className="text-sm text-muted-foreground">نشر الثقافة الحقوقية</p>
            </div>
          </div>
        </div>

        {/* دعوة للعمل */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-primary mb-4">انضمي إلى مجتمع وفاء</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            كوني جزءاً من رحلة التمكين والعدالة، احصلي على الدعم الذي تستحقينه
          </p>
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary-light gap-2">
            تواصلي معنا الآن
          </Button>
        </div>
      </div>
    </section>
  );
};

export default About;