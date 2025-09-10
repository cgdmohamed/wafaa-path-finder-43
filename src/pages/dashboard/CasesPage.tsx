import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Case {
  id: string;
  case_number: string;
  title: string;
  status: string;
  case_type: string;
  priority: number;
  created_at: string;
  next_hearing_date?: string;
}

const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "خطأ في تحميل القضايا",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setCases(data || []);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
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

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'destructive';
    if (priority <= 3) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">جاري تحميل القضايا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">القضايا</h1>
          <p className="text-muted-foreground">إدارة ومتابعة القضايا القانونية</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          قضية جديدة
        </Button>
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد قضايا</h3>
            <p className="text-muted-foreground text-center mb-4">
              لم يتم إنشاء أي قضايا بعد. ابدئي بإنشاء قضية جديدة.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              قضية جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem) => (
            <Card key={caseItem.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span>رقم القضية: {caseItem.case_number}</span>
                      <span>النوع: {caseItem.case_type}</span>
                      {caseItem.next_hearing_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          الجلسة القادمة: {new Date(caseItem.next_hearing_date).toLocaleDateString('ar')}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(caseItem.status)}>
                      {caseItem.status === 'active' && 'نشطة'}
                      {caseItem.status === 'initial' && 'مبدئية'}
                      {caseItem.status === 'closed' && 'مغلقة'}
                      {caseItem.status === 'on_hold' && 'معلقة'}
                    </Badge>
                    <Badge variant={getPriorityColor(caseItem.priority)}>
                      أولوية {caseItem.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    تم الإنشاء: {new Date(caseItem.created_at).toLocaleDateString('ar')}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // TODO: Navigate to case details page when implemented
                        console.log('View case details:', caseItem.id);
                      }}
                      data-testid={`view-case-${caseItem.id}`}
                    >
                      عرض التفاصيل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // TODO: Open case update modal when implemented
                        console.log('Update case:', caseItem.id);
                      }}
                      data-testid={`update-case-${caseItem.id}`}
                    >
                      تحديث
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CasesPage;