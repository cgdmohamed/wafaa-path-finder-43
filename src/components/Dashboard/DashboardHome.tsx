import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  ArrowRight,
  Bell,
  Briefcase,
  Users,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  activeCases: number;
  unreadMessages: number;
  notifications: any[];
  recentAppointments: any[];
  recentCases: any[];
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    activeCases: 0,
    unreadMessages: 0,
    notifications: [],
    recentAppointments: [],
    recentCases: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchDashboardData(session.user.id);
        }
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [toast]);

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          consultation_types (name, duration_minutes)
        `)
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (appointmentsError) throw appointmentsError;

      // Fetch cases
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (casesError) throw casesError;

      // Fetch contact messages
      const { data: messages, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('sender_id', userId)
        .eq('status', 'new')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Fetch notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsError) throw notificationsError;

      // Calculate stats
      const pendingAppointments = appointments?.filter(app => app.status === 'pending').length || 0;
      const activeCases = cases?.filter(case_ => ['active', 'under_review', 'in_court'].includes(case_.status)).length || 0;

      setStats({
        totalAppointments: appointments?.length || 0,
        pendingAppointments,
        activeCases,
        unreadMessages: messages?.length || 0,
        notifications: notifications || [],
        recentAppointments: appointments || [],
        recentCases: cases || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusBadge = (status: string, type: 'appointment' | 'case') => {
    if (type === 'appointment') {
      const statusMap = {
        pending: { label: 'في الانتظار', variant: 'outline' as const },
        confirmed: { label: 'مؤكد', variant: 'default' as const },
        completed: { label: 'مكتمل', variant: 'secondary' as const },
        cancelled: { label: 'ملغي', variant: 'destructive' as const }
      };
      return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    } else {
      const statusMap = {
        initial: { label: 'جديدة', variant: 'outline' as const },
        under_review: { label: 'قيد المراجعة', variant: 'secondary' as const },
        active: { label: 'نشطة', variant: 'default' as const },
        in_court: { label: 'في المحكمة', variant: 'destructive' as const },
        settled: { label: 'محلولة', variant: 'secondary' as const },
        closed: { label: 'مغلقة', variant: 'outline' as const }
      };
      return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ar });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">مرحباً بك</h1>
          <p className="text-muted-foreground">إليك نظرة سريعة على حسابك وقضاياك</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/appointments/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              حجز موعد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المواعيد</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingAppointments} في الانتظار
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القضايا النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              قضايا قيد المتابعة
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرسائل الجديدة</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              رسائل غير مقروءة
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإشعارات</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              إشعارات جديدة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/dashboard/appointments/new">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto p-4">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <div className="font-medium">حجز موعد</div>
                  <div className="text-xs text-muted-foreground">احجزي استشارة قانونية</div>
                </div>
              </Button>
            </Link>

            <Link to="/dashboard/cases/new">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto p-4">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <div className="font-medium">إنشاء قضية</div>
                  <div className="text-xs text-muted-foreground">ابدئي قضية جديدة</div>
                </div>
              </Button>
            </Link>

            <Link to="/dashboard/documents">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto p-4">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <div className="font-medium">رفع مستندات</div>
                  <div className="text-xs text-muted-foreground">ارفعي المستندات المطلوبة</div>
                </div>
              </Button>
            </Link>

            <Link to="/dashboard/messages">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto p-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <div className="font-medium">التواصل</div>
                  <div className="text-xs text-muted-foreground">تواصلي مع الفريق</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              المواعيد الحديثة
            </CardTitle>
            <Link to="/dashboard/appointments">
              <Button variant="ghost" size="sm" className="gap-1">
                عرض الكل
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {stats.recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{appointment.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(appointment.scheduled_date)} - {appointment.scheduled_time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.consultation_types?.name}
                      </p>
                    </div>
                    <Badge {...getStatusBadge(appointment.status, 'appointment')}>
                      {getStatusBadge(appointment.status, 'appointment').label}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد مواعيد حالياً</p>
                <Link to="/dashboard/appointments/new">
                  <Button variant="outline" size="sm" className="mt-2">
                    احجزي موعدك الأول
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              القضايا الحديثة
            </CardTitle>
            <Link to="/dashboard/cases">
              <Button variant="ghost" size="sm" className="gap-1">
                عرض الكل
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentCases.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCases.map((case_) => (
                  <div key={case_.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{case_.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {case_.case_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(case_.created_at)}
                      </p>
                    </div>
                    <Badge {...getStatusBadge(case_.status, 'case')}>
                      {getStatusBadge(case_.status, 'case').label}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد قضايا حالياً</p>
                <Link to="/dashboard/cases/new">
                  <Button variant="outline" size="sm" className="mt-2">
                    ابدئي قضية جديدة
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {stats.notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              الإشعارات الجديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHome;