import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  Headphones,
  Calendar,
  AlertCircle
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const contactMethods = [
    {
      icon: Phone,
      title: "الهاتف",
      description: "للاستشارات العاجلة والدعم الفوري",
      contact: "+966 11 123 4567",
      available: "24/7",
      color: "bg-primary/10"
    },
    {
      icon: MessageCircle,
      title: "واتساب",
      description: "للتواصل السريع والاستشارات المكتوبة",
      contact: "+966 50 123 4567",
      available: "8:00 - 22:00",
      color: "bg-green-100"
    },
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      description: "للاستفسارات التفصيلية والمراسلات الرسمية",
      contact: "info@wafa-legal.org",
      available: "خلال 24 ساعة",
      color: "bg-blue-100"
    },
    {
      icon: Calendar,
      title: "حجز موعد",
      description: "للاستشارات الشخصية والحالات المعقدة",
      contact: "احجز موعدك",
      available: "الأحد - الخميس",
      color: "bg-purple-100"
    }
  ];

  const emergencyContacts = [
    {
      title: "خط الطوارئ القانوني",
      number: "8001234567",
      description: "متاح 24/7 للحالات العاجلة"
    },
    {
      title: "دعم ضحايا العنف",
      number: "8007654321",
      description: "خط مخصص لحالات العنف الأسري"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          urgency: formData.urgency as 'normal' | 'high' | 'low' | 'urgent'
        });

      if (error) throw error;

      toast({
        title: "تم إرسال رسالتك بنجاح",
        description: "سيتم الرد عليك خلال 24 ساعة"
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        urgency: 'normal'
      });
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال الرسالة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2">تواصل معنا</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6">نحن هنا لمساعدتك</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            تواصلي معنا في أي وقت للحصول على الدعم القانوني والاستشارة التي تحتاجينها. فريقنا جاهز لخدمتك على مدار الساعة
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* طرق التواصل */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6">طرق التواصل</h3>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="border border-border/50 hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <method.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 text-right">
                          <h4 className="font-semibold text-lg mb-1">{method.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                          <p className="text-primary font-medium">{method.contact}</p>
                          <p className="text-xs text-muted-foreground">{method.available}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* خطوط الطوارئ */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
              <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                خطوط الطوارئ
              </h4>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-white/50 rounded-lg p-3">
                    <h5 className="font-semibold text-red-800">{contact.title}</h5>
                    <p className="text-red-700 text-lg font-bold">{contact.number}</p>
                    <p className="text-sm text-red-600">{contact.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* معلومات إضافية */}
            <Card className="border border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">موقعنا</h4>
                </div>
                <p className="text-muted-foreground mb-4">
                  الرياض، المملكة العربية السعودية<br />
                  حي الملز، شارع الأمير محمد بن عبدالعزيز
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">أوقات العمل</h4>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>الأحد - الخميس</span>
                    <span>8:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة - السبت</span>
                    <span>مغلق</span>
                  </div>
                  <div className="flex justify-between font-medium text-primary">
                    <span>خط الطوارئ</span>
                    <span>24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* نموذج التواصل */}
          <div className="lg:col-span-2">
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-right flex items-center gap-3">
                  <Send className="w-6 h-6 text-primary" />
                  أرسل رسالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-right block">الاسم الكامل *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-right"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-right block">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="text-right"
                        placeholder="+966 XX XXX XXXX"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="text-right"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-right block">موضوع الرسالة *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="text-right"
                        placeholder="موضوع استفسارك"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="urgency" className="text-right block">مستوى الأولوية</Label>
                      <select
                        id="urgency"
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md text-right"
                      >
                        <option value="normal">عادي</option>
                        <option value="high">هام</option>
                        <option value="urgent">عاجل</option>
                        <option value="low">منخفض</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-right block">تفاصيل الرسالة *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="text-right min-h-32"
                      placeholder="اكتب تفاصيل استفسارك أو طلبك هنا..."
                      required
                    />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-right">
                      <strong>ملاحظة:</strong> جميع المعلومات المرسلة محمية بالكامل وتتم معالجتها وفقاً لسياسة الخصوصية الخاصة بنا. 
                      سيتم الرد على رسالتك خلال 24 ساعة كحد أقصى.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-primary-light gap-2"
                    disabled={isSubmitting}
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;