import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Scale, FileText, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SkeletonList } from '@/components/ui/skeleton-layouts';
import { Link } from 'react-router-dom';

interface Request {
  id: string;
  case_number: string;
  title: string;
  status: string;
  case_type: string;
  created_at: string;
  priority: number;
}

const RequestsPage = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "خطأ في تحميل الطلبات",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تحميل الطلبات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'initial': return 'secondary';
      case 'closed': return 'outline';
      case 'on_hold': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'initial': return 'مبدئي';
      case 'closed': return 'مغلق';
      case 'on_hold': return 'معلق';
      default: return 'غير محدد';
    }
  };

  const getCaseTypeText = (caseType: string) => {
    switch (caseType) {
      case 'employment': return 'قضايا العمل';
      case 'divorce': return 'قضايا الطلاق';
      case 'custody': return 'قضايا الحضانة';
      case 'domestic_violence': return 'العنف الأسري';
      case 'inheritance': return 'قضايا الميراث';
      case 'property': return 'قضايا عقارية';
      case 'other': return 'أخرى';
      default: return caseType;
    }
  };

  const getPriorityText = (priority: number) => {
    if (priority <= 2) return 'عالية';
    if (priority <= 3) return 'متوسطة';
    return 'منخفضة';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">طلبات الاستشارة</h1>
            <p className="text-muted-foreground">عرض وإدارة طلبات الاستشارة القانونية</p>
          </div>
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طلبات الاستشارة</h1>
          <p className="text-muted-foreground">عرض وإدارة طلبات الاستشارة القانونية</p>
        </div>
        <Link to="/dashboard/requests/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            طلب استشارة جديد
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Scale className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد طلبات حالياً</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              لم تقومي بتقديم أي طلبات استشارة بعد. ابدئي الآن للحصول على المساعدة القانونية التي تحتاجينها.
            </p>
            <Link to="/dashboard/requests/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                تقديم طلب استشارة
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>رقم الطلب: {request.case_number || 'غير متاح'}</span>
                      <span>نوع القضية: {getCaseTypeText(request.case_type)}</span>
                      <span>الأولوية: {getPriorityText(request.priority)}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>تم التقديم: {new Date(request.created_at).toLocaleDateString('ar')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      عرض التفاصيل
                    </Button>
                    {request.status === 'initial' && (
                      <Button variant="outline" size="sm">
                        تعديل
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            هل تحتاجين مساعدة؟
          </CardTitle>
          <CardDescription>
            فريقنا القانوني متاح لمساعدتك في أي استفسارات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">دليل تقديم الطلبات</h4>
                <p className="text-sm text-muted-foreground">
                  تعرفي على كيفية تقديم طلب استشارة فعال
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">تحدثي مع مستشارة</h4>
                <p className="text-sm text-muted-foreground">
                  احجزي موعد للحصول على استشارة مباشرة
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestsPage;