import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  file_name: string;
  document_type: string;
  status: string;
  file_size?: number;
  created_at: string;
  is_confidential: boolean;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "خطأ في تحميل المستندات",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'غير محدد';
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
    return `${(bytes / 1048576).toFixed(1)} ميجابايت`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">جاري تحميل المستندات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المستندات</h1>
          <p className="text-muted-foreground">إدارة ومراجعة المستندات والملفات</p>
        </div>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          رفع مستند
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مستندات</h3>
            <p className="text-muted-foreground text-center mb-4">
              لم يتم رفع أي مستندات بعد. ابدئي برفع مستندك الأول.
            </p>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              رفع مستند جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {document.file_name}
                      {document.is_confidential && (
                        <Badge variant="outline" className="text-xs">سري</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span>النوع: {document.document_type}</span>
                      <span>الحجم: {formatFileSize(document.file_size)}</span>
                      <span>تاريخ الرفع: {new Date(document.created_at).toLocaleDateString('ar')}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(document.status)}>
                    {document.status === 'approved' && 'مقبول'}
                    {document.status === 'pending' && 'قيد المراجعة'}
                    {document.status === 'rejected' && 'مرفوض'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    عرض
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;