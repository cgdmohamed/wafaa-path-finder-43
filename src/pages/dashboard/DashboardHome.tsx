import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, MessageSquare, Scale, Plus, Clock, User, Upload, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SkeletonCard } from '@/components/ui/skeleton-layouts';

interface DashboardStats {
  appointments: number;
  cases: number;
  documents: number;
  messages: number;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    appointments: 0,
    cases: 0,
    documents: 0,
    messages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch appointments count
      const { count: appointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id);

      // Fetch cases count
      const { count: casesCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id);

      // Fetch documents count
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', user.id);

      // Fetch messages count
      const { count: messagesCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id);

      setStats({
        appointments: appointmentsCount || 0,
        cases: casesCount || 0,
        documents: documentsCount || 0,
        messages: messagesCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "خطأ في تحميل الإحصائيات",
        description: "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>الرئيسية</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>الرئيسية</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div>
        <h1 className="text-3xl font-bold">مرحباً بك</h1>
        <p className="text-muted-foreground">نظرة عامة على حسابك وخدماتك</p>
      </div>

      {/* Stats Cards - Now Clickable */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/dashboard/appointments">
          <Card className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-primary/20 hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المواعيد</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointments}</div>
              <p className="text-xs text-muted-foreground">
                المواعيد المحجوزة
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/dashboard/cases">
          <Card className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-primary/20 hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">القضايا</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cases}</div>
              <p className="text-xs text-muted-foreground">
                القضايا المفتوحة
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/dashboard/documents">
          <Card className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-primary/20 hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستندات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documents}</div>
              <p className="text-xs text-muted-foreground">
                المستندات المرفوعة
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/dashboard/messages">
          <Card className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer border-primary/20 hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الرسائل</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">
                الرسائل المرسلة
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>
              الإجراءات الأكثر استخداماً
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link to="/dashboard/appointments/new">
              <Button className="w-full justify-start gap-2" size="lg">
                <Calendar className="w-4 h-4" />
                حجز موعد جديد
              </Button>
            </Link>
            <Link to="/dashboard/requests/new">
              <Button className="w-full justify-start gap-2" size="lg" variant="outline">
                <Plus className="w-4 h-4" />
                طلب خدمة جديدة
              </Button>
            </Link>
            <Button className="w-full justify-start gap-2" size="lg" variant="outline" 
              onClick={() => {
                // Trigger document upload dialog
                const event = new CustomEvent('open-document-upload');
                window.dispatchEvent(event);
              }}>
              <Upload className="w-4 h-4" />
              رفع مستند
            </Button>
            <Button className="w-full justify-start gap-2" size="lg" variant="outline"
              onClick={() => {
                // Trigger message dialog
                const event = new CustomEvent('open-message-dialog');
                window.dispatchEvent(event);
              }}>
              <Send className="w-4 h-4" />
              إرسال رسالة
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>
              آخر التحديثات على حسابك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">تم إنشاء الحساب</p>
                <p className="text-xs text-muted-foreground">
                  مرحباً بك في جمعية وفاء للحقوق النسائية
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">أكملي ملفك الشخصي</p>
                <p className="text-xs text-muted-foreground">
                  أضيفي معلوماتك لتحصلي على خدمة أفضل
                </p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="link" size="sm" className="h-auto p-0">
                عرض جميع الأنشطة ←
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;