import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { SkeletonList } from '@/components/ui/skeleton-layouts';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "خطأ في المصادقة",
          description: "يرجى تسجيل الدخول مرة أخرى",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message || "حدث خطأ أثناء جلب الطلبات",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const statusColors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      'initial': 'outline',
      'under_review': 'secondary',
      'active': 'default',
      'in_court': 'destructive',
      'settled': 'secondary',
      'closed': 'outline'
    };
    return statusColors[status] || 'outline';
  };

  const getStatusText = (status: string): string => {
    const statusTexts: Record<string, string> = {
      'initial': 'جديدة',
      'under_review': 'قيد المراجعة', 
      'active': 'نشطة',
      'in_court': 'في المحكمة',
      'settled': 'محلولة',
      'closed': 'مغلقة'
    };
    return statusTexts[status] || status;
  };

  const getCaseTypeText = (caseType: string): string => {
    const caseTypes: Record<string, string> = {
      'family': 'قضايا أسرية',
      'inheritance': 'قضايا ميراث',
      'commercial': 'قضايا تجارية',
      'labor': 'قضايا عمالية',
      'civil': 'قضايا مدنية',
      'criminal': 'قضايا جنائية'
    };
    return caseTypes[caseType] || caseType;
  };

  const getPriorityText = (priority: number): string => {
    const priorities: Record<number, string> = {
      1: 'عاجل جداً',
      2: 'عاجل',
      3: 'عادي',
      4: 'منخفض',
      5: 'منخفض جداً'
    };
    return priorities[priority] || 'عادي';
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStatusText(request.status).includes(searchTerm) ||
    getCaseTypeText(request.case_type).includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            طلباتي
          </h1>
          <p className="text-muted-foreground">عرض وإدارة جميع الطلبات والقضايا الخاصة بك</p>
        </div>
        <Link to="/dashboard/requests/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            طلب جديد
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="البحث في الطلبات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <Badge variant={getStatusColor(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {request.case_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(request.created_at), 'dd MMM yyyy', { locale: ar })}
                      </span>
                      <span>{getCaseTypeText(request.case_type)}</span>
                      <span>الأولوية: {getPriorityText(request.priority)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      عرض التفاصيل
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      تحديث
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'لم يتم العثور على طلبات تطابق البحث' : 'لم تقومي بإنشاء أي طلبات بعد'}
            </p>
            <Link to="/dashboard/requests/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إنشاء طلب جديد
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            مساعدة ونصائح
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">كيفية إنشاء طلب فعال:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• اكتبي عنواناً واضحاً ومحدداً</li>
                <li>• اختاري نوع القضية المناسب</li>
                <li>• قدمي وصفاً مفصلاً للمشكلة</li>
                <li>• حددي الأولوية حسب الحاجة</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">ماذا بعد إنشاء الطلب:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• سيتم مراجعة طلبك خلال 24 ساعة</li>
                <li>• ستصلك إشعارات بالتحديثات</li>
                <li>• يمكنك متابعة الحالة من هنا</li>
                <li>• <Link to="/dashboard/messages" className="text-primary hover:underline">تواصلي معنا</Link> للاستفسار</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestsPage;