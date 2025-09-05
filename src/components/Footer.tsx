import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Scale,
  FileText,
  Users,
  BookOpen
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: "الاستشارات القانونية", href: "#legal-consultation" },
    { name: "الدعم في القضايا", href: "#case-support" },
    { name: "الصلح المجتمعي", href: "#community-mediation" },
    { name: "التدريب والتأهيل", href: "#training" }
  ];

  const legalLinks = [
    { name: "حقوق المرأة", href: "#womens-rights" },
    { name: "القوانين السعودية", href: "#saudi-laws" },
    { name: "الأسئلة الشائعة", href: "#faq" },
    { name: "النماذج القانونية", href: "#legal-forms" }
  ];

  const aboutLinks = [
    { name: "من نحن", href: "#about" },
    { name: "رؤيتنا ورسالتنا", href: "#vision-mission" },
    { name: "فريق العمل", href: "#team" },
    { name: "التقارير السنوية", href: "#reports" }
  ];

  return (
    <footer className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* الجزء العلوي */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* معلومات الجمعية */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">جمعية وفاء</h3>
                <p className="text-sm opacity-80">للخدمات القانونية للمرأة</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              جمعية غير ربحية مرخصة من وزارة الموارد البشرية برقم (1778)، 
              تهدف إلى تمكين المرأة قانونياً في إطار شرعي وأخلاقي.
            </p>
            <div className="flex gap-3">
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 hover:bg-primary-foreground/20">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 hover:bg-primary-foreground/20">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 hover:bg-primary-foreground/20">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button size="sm" variant="ghost" className="w-10 h-10 p-0 hover:bg-primary-foreground/20">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              خدماتنا
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* الموسوعة القانونية */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              الموسوعة القانونية
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* معلومات التواصل */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              تواصل معنا
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 opacity-80" />
                <span className="text-sm">+966 11 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 opacity-80" />
                <span className="text-sm">info@wafa-legal.org</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 opacity-80 mt-1 flex-shrink-0" />
                <span className="text-sm">الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
            
            {/* أوقات العمل */}
            <div className="mt-4 p-3 bg-primary-foreground/10 rounded-lg">
              <h5 className="text-sm font-semibold mb-2">أوقات العمل</h5>
              <div className="text-xs space-y-1 opacity-90">
                <div className="flex justify-between">
                  <span>الأحد - الخميس</span>
                  <span>8:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>الطوارئ</span>
                  <span>24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-20" />

        {/* الجزء السفلي */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm opacity-80 text-center md:text-right">
            © 2024 جمعية وفاء للخدمات القانونية للمرأة. جميع الحقوق محفوظة.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#privacy" className="opacity-80 hover:opacity-100 transition-opacity">
              سياسة الخصوصية
            </a>
            <a href="#terms" className="opacity-80 hover:opacity-100 transition-opacity">
              شروط الاستخدام
            </a>
            <a href="#sitemap" className="opacity-80 hover:opacity-100 transition-opacity">
              خريطة الموقع
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;