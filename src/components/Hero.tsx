import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Heart, Shield, MessageCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-accent/20 py-20 lg:py-32">
      {/* العناصر التزيينية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* المحتوى النصي */}
          <div className="text-right space-y-8">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-primary leading-tight">
                وفاء..
                <span className="block text-3xl lg:text-5xl text-foreground mt-2">
                  نحو عدالة مجتمعية
                </span>
                <span className="block text-2xl lg:text-4xl text-primary-light mt-2">
                  بخطى ثابتة
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mt-6 leading-relaxed">
                جمعية غير ربحية مرخصة من وزارة الموارد البشرية، تهدف إلى توعية المرأة بالجوانب القانونية وتعزيز قدراتها وتمكينها في إطار شرعي وأخلاقي لتحقيق بيئة مستقرة وآمنة.
              </p>
            </div>

            {/* الإحصائيات السريعة */}
            <div className="grid grid-cols-3 gap-6 py-8">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">+1000</div>
                <div className="text-sm text-muted-foreground">مستفيدة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">+500</div>
                <div className="text-sm text-muted-foreground">استشارة قانونية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">دعم متواصل</div>
              </div>
            </div>

            {/* أزرار العمل */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-lg px-8 py-6 gap-3 shadow-lg hover:shadow-xl transition-all"
                asChild
                data-testid="hero-main-cta"
              >
                <Link to="/auth">
                  ابدئي رحلة العدالة
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 gap-3 border-primary hover:bg-primary hover:text-primary-foreground"
                asChild
                data-testid="hero-consultation-cta"
              >
                <Link to="/auth">
                  استشارة عاجلة
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* الرسوم التوضيحية */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {/* بطاقة الخدمات القانونية */}
              <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-border/50">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-right mb-2">خدمات قانونية</h3>
                <p className="text-sm text-muted-foreground text-right">استشارات ومرافعة قانونية متخصصة</p>
              </div>

              {/* بطاقة الدعم النفسي */}
              <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-border/50 mt-8">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-right mb-2">دعم نفسي</h3>
                <p className="text-sm text-muted-foreground text-right">مرافقة نفسية واجتماعية متكاملة</p>
              </div>

              {/* بطاقة الحماية */}
              <div className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-border/50 -mt-4 col-span-2">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-right mb-2">حماية الحقوق</h3>
                <p className="text-sm text-muted-foreground text-right">ضمان وحماية حقوق المرأة في إطار شرعي وقانوني</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;