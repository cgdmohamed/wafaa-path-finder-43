import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, MessageSquare, Plus, Scale, User, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SkeletonCard } from '@/components/ui/skeleton-layouts';
import { Link } from 'react-router-dom';

interface DashboardStats {
  appointments: number;
  cases: number;
  documents: number;
  messages: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'case' | 'document' | 'message';
  title: string;
  date: string;
  status?: string;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    appointments: 0,
    cases: 0,
    documents: 0,
    messages: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      // Fetch stats
      const [appointmentsResult, casesResult, documentsResult, messagesResult] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact' }).eq('client_id', user.data.user.id),
        supabase.from('cases').select('id', { count: 'exact' }).eq('client_id', user.data.user.id),
        supabase.from('documents').select('id', { count: 'exact' }).eq('uploaded_by', user.data.user.id),
        supabase.from('contact_messages').select('id', { count: 'exact' }).eq('sender_id', user.data.user.id)
      ]);

      setStats({
        appointments: appointmentsResult.count || 0,
        cases: casesResult.count || 0,
        documents: documentsResult.count || 0,
        messages: messagesResult.count || 0
      });

      // Fetch recent activity
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('id, subject, scheduled_date, status')
        .eq('client_id', user.data.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentCases } = await supabase
        .from('cases')
        .select('id, title, created_at, status')
        .eq('client_id', user.data.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const activity: RecentActivity[] = [];
      
      recentAppointments?.forEach(appointment => {
        activity.push({
          id: appointment.id,
          type: 'appointment',
          title: appointment.subject,
          date: appointment.scheduled_date,
          status: appointment.status
        });
      });

      recentCases?.forEach(case_ => {
        activity.push({
          id: case_.id,
          type: 'case',
          title: case_.title,
          date: case_.created_at,
          status: case_.status
        });
      });

      // Sort by date descending
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activity.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات اللوحة",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'case': return Scale;
      case 'document': return FileText;
      case 'message': return MessageSquare;
      default: return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'text-blue-600';
      case 'case': return 'text-purple-600';
      case 'document': return 'text-green-600';
      case 'message': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      'pending': { label: 'في الانتظار', variant: 'secondary' },
      'confirmed': { label: 'مؤكد', variant: 'default' },
      'completed': { label: 'مكتمل', variant: 'outline' },
      'cancelled': { label: 'ملغي', variant: 'destructive' },
      'initial': { label: 'مبدئي', variant: 'secondary' },
      'in_progress': { label: 'قيد المعالجة', variant: 'default' },
      'closed': { label: 'مغلق', variant: 'outline' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };
    
    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.label}
      </Badge>
    );
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
            <SkeletonCard key={i} />
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مرحباً بك</h1>
          <p className="text-muted-foreground">نظرة عامة على حالتك والخدمات المتاحة</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المواعيد</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/dashboard/appointments" className="text-primary hover:underline">
                عرض جميع المواعيد
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القضايا</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cases}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/dashboard/cases" className="text-primary hover:underline">
                عرض جميع القضايا
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستندات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/dashboard/documents" className="text-primary hover:underline">
                عرض جميع المستندات
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرسائل</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/dashboard/messages" className="text-primary hover:underline">
                عرض جميع الرسائل
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>الخدمات الأكثر استخداماً</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/dashboard/appointments/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="w-4 h-4" />
                حجز موعد جديد
              </Button>
            </Link>
            <Link to="/dashboard/requests/new">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="w-4 h-4" />
                طلب خدمة جديدة
              </Button>
            </Link>
            <Link to="/dashboard/documents">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                رفع مستند
              </Button>
            </Link>
            <Link to="/dashboard/messages">
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageSquare className="w-4 h-4" />
                إرسال رسالة
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>آخر التحديثات والأنشطة</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا يوجد نشاط حديث</p>
                <p className="text-sm text-muted-foreground mt-2">
                  ابدئي بحجز موعد أو طلب خدمة جديدة
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className={`p-2 rounded-full bg-secondary/20 ${getActivityColor(activity.type)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString('ar')}
                          </p>
                          {getStatusBadge(activity.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;