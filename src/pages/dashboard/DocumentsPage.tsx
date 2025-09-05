import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, Download, Eye, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SkeletonList } from '@/components/ui/skeleton-layouts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Document {
  id: string;
  file_name: string;
  document_type: string;
  status: string;
  file_size?: number;
  created_at: string;
  is_confidential: boolean;
}

const uploadSchema = z.object({
  file: z.any().refine((files) => files?.length > 0, 'يرجى اختيار ملف'),
  document_type: z.string().min(1, 'يرجى تحديد نوع المستند'),
  description: z.string().optional()
});

type UploadFormData = z.infer<typeof uploadSchema>;

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema)
  });
  
  const selectedFile = watch('file');

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

  const handleFileUpload = async (data: UploadFormData) => {
    if (!data.file?.[0]) return;
    
    setIsUploading(true);
    try {
      const file = data.file[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save document record to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_path: filePath,
          document_type: data.document_type,
          description: data.description,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "تم رفع المستند بنجاح",
        description: "تم رفع المستند وسيتم مراجعته قريباً"
      });

      setUploadDialogOpen(false);
      reset();
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "خطأ في رفع المستند",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">الرئيسية</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>المستندات</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>المستندات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المستندات</h1>
          <p className="text-muted-foreground">إدارة ومراجعة المستندات والملفات</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              رفع مستند
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>رفع مستند جديد</DialogTitle>
              <DialogDescription>
                اختاري الملف ونوع المستند لرفعه
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleFileUpload)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">الملف</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  {...register('file')}
                  ref={fileInputRef}
                />
                {errors.file && (
                  <p className="text-sm text-destructive">{errors.file.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document_type">نوع المستند</Label>
                <select
                  id="document_type"
                  {...register('document_type')}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="">اختاري نوع المستند</option>
                  <option value="identity">هوية شخصية</option>
                  <option value="contract">عقد</option>
                  <option value="court_document">مستند محكمة</option>
                  <option value="evidence">دليل</option>
                  <option value="other">أخرى</option>
                </select>
                {errors.document_type && (
                  <p className="text-sm text-destructive">{errors.document_type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف (اختياري)</Label>
                <Input
                  id="description"
                  placeholder="وصف قصير للمستند..."
                  {...register('description')}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'جاري الرفع...' : 'رفع المستند'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مستندات</h3>
            <p className="text-muted-foreground text-center mb-4">
              لم يتم رفع أي مستندات بعد. ابدئي برفع مستندك الأول.
            </p>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  رفع مستند جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>رفع مستند جديد</DialogTitle>
                  <DialogDescription>
                    اختاري الملف ونوع المستند لرفعه
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFileUpload)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">الملف</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      {...register('file')}
                    />
                    {errors.file && (
                      <p className="text-sm text-destructive">{errors.file.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document_type">نوع المستند</Label>
                    <select
                      id="document_type"
                      {...register('document_type')}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="">اختاري نوع المستند</option>
                      <option value="identity">هوية شخصية</option>
                      <option value="contract">عقد</option>
                      <option value="court_document">مستند محكمة</option>
                      <option value="evidence">دليل</option>
                      <option value="other">أخرى</option>
                    </select>
                    {errors.document_type && (
                      <p className="text-sm text-destructive">{errors.document_type.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف (اختياري)</Label>
                    <Input
                      id="description"
                      placeholder="وصف قصير للمستند..."
                      {...register('description')}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? 'جاري الرفع...' : 'رفع المستند'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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