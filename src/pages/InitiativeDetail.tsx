import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, MapPin, Users, ExternalLink, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import InitiativeRegistrationModal from "@/components/modals/InitiativeRegistrationModal";

const InitiativeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const { data: initiative, isLoading } = useQuery({
    queryKey: ["initiative", id],
    queryFn: async () => {
      if (!id) return null;
      
      // Check if it's a static initiative (starts with "static-")
      if (id.startsWith("static-")) {
        const staticIndex = parseInt(id.replace("static-", ""));
        const staticInitiatives = [
          {
            id: "static-0",
            title: "برنامج الدعم القانوني للمرأة",
            description: "برنامج شامل يهدف إلى تقديم الدعم القانوني والاستشارات المجانية للنساء في مختلف القضايا القانونية",
            type: "دعم قانوني",
            status: "active",
            location: "مكاتب الجمعية",
            start_date: "2024-01-15",
            end_date: "2024-12-31",
            max_participants: 200,
            current_participants: 85,
            is_featured: true,
            image_url: "/lovable-uploads/7e113086-7b5a-4d72-a9ed-62d1caf0ffec.png",
            features: [
              "استشارات قانونية مجانية",
              "ورش توعية قانونية",
              "مرافقة قانونية في المحاكم",
              "دورات تدريبية حول الحقوق"
            ]
          },
          {
            id: "static-1",
            title: "مشروع الوساطة المجتمعية",
            description: "مشروع يهدف إلى تسوية النزاعات بطرق ودية وبديلة عن التقاضي لتحقيق العدالة الاجتماعية",
            type: "وساطة",
            status: "active",
            location: "مراكز الوساطة",
            start_date: "2024-02-01",
            end_date: "2024-11-30",
            max_participants: 150,
            current_participants: 67,
            is_featured: false,
            image_url: "/lovable-uploads/f87299db-9394-4207-bc82-e805818f0d0b.png",
            features: [
              "جلسات وساطة مجانية",
              "تدريب الوسطاء",
              "حل النزاعات الأسرية",
              "التوفيق في القضايا المدنية"
            ]
          }
        ];
        
        return staticInitiatives[staticIndex] || null;
      }

      const { data, error } = await supabase
        .from("initiatives")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleRegistration = () => {
    if (initiative && 'registration_link' in initiative && initiative.registration_link) {
      window.open(initiative.registration_link, "_blank");
    } else {
      setIsRegistrationModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!initiative) {
    return (
    <div className="min-h-screen" dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">المبادرة غير موجودة</h1>
            <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على المبادرة المطلوبة</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      
      <main className="py-20">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة للمبادرات
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              {initiative.image_url && (
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                  <img
                    src={initiative.image_url}
                    alt={initiative.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4">
                    <Badge variant="secondary" className="mb-2">
                      {initiative.type}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold text-white text-right">
                      {initiative.title}
                    </h1>
                  </div>
                </div>
              )}

              {/* Title for initiatives without image */}
              {!initiative.image_url && (
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit">
                    {initiative.type}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {initiative.title}
                  </h1>
                </div>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>نبذة عن المبادرة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-right">
                    {initiative.description}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              {initiative && 'features' in initiative && initiative.features && initiative.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>ما نقدمه</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {initiative.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-right">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">انضم إلينا</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {initiative.max_participants && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">المشاركون:</span>
                      <span className="font-medium">
                        {initiative.current_participants || 0} / {initiative.max_participants}
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleRegistration}
                    className="w-full"
                    size="lg"
                  >
                    <ExternalLink className="ml-2 h-4 w-4" />
                    سجل الآن
                  </Button>
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل المبادرة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {initiative.start_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">تاريخ البداية</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(initiative.start_date), "d MMMM yyyy", { locale: ar })}
                        </p>
                      </div>
                    </div>
                  )}

                  {initiative.end_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">تاريخ النهاية</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(initiative.end_date), "d MMMM yyyy", { locale: ar })}
                        </p>
                      </div>
                    </div>
                  )}

                  {initiative.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">الموقع</p>
                        <p className="text-sm text-muted-foreground">
                          {initiative.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {initiative.max_participants && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">الحد الأقصى للمشاركين</p>
                        <p className="text-sm text-muted-foreground">
                          {initiative.max_participants} مشارك
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Badge 
                      variant={initiative.status === 'active' ? 'default' : 'secondary'}
                      className="w-full justify-center"
                    >
                      {initiative.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Registration Modal */}
      <InitiativeRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        type="initiative"
        initiativeId={initiative?.id}
        initiativeTitle={initiative?.title}
      />
    </div>
  );
};

export default InitiativeDetail;