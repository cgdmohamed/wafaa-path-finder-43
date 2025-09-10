import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Edit, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface ConsultationType {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  is_emergency: boolean;
  created_at: string;
}

const consultationSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم نوع الاستشارة'),
  description: z.string().min(1, 'يرجى إدخال وصف للاستشارة'),
  price: z.number().min(0, 'السعر يجب أن يكون 0 أو أكثر'),
  duration_minutes: z.number().min(15, 'المدة يجب أن تكون 15 دقيقة على الأقل'),
  is_active: z.boolean(),
  is_emergency: z.boolean()
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

const ConsultationManagement = () => {
  const [consultations, setConsultations] = useState<ConsultationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<ConsultationType | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      price: 0,
      duration_minutes: 60,
      is_active: true,
      is_emergency: false
    }
  });

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "خطأ في تحميل أنواع الاستشارات",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setConsultations(data || []);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (consultation?: ConsultationType) => {
    if (consultation) {
      setEditingConsultation(consultation);
      setValue('name', consultation.name);
      setValue('description', consultation.description);
      setValue('price', consultation.price);
      setValue('duration_minutes', consultation.duration_minutes);
      setValue('is_active', consultation.is_active);
      setValue('is_emergency', consultation.is_emergency);
    } else {
      setEditingConsultation(null);
      reset();
    }
    setDialogOpen(true);
  };

  const handleSaveConsultation = async (data: ConsultationFormData) => {
    try {
      if (editingConsultation) {
        const { error } = await supabase
          .from('consultation_types')
          .update(data)
          .eq('id', editingConsultation.id);

        if (error) throw error;

        toast({
          title: "تم تحديث نوع الاستشارة بنجاح",
          description: "تم حفظ التغييرات"
        });
      } else {
        const { error } = await supabase
          .from('consultation_types')
          .insert(data);

        if (error) throw error;

        toast({
          title: "تم إضافة نوع استشارة جديد",
          description: "تم إنشاء النوع بنجاح"
        });
      }

      setDialogOpen(false);
      setEditingConsultation(null);
      reset();
      fetchConsultations();
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ البيانات",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleConsultationStatus = async (consultation: ConsultationType) => {
    try {
      const { error } = await supabase
        .from('consultation_types')
        .update({ is_active: !consultation.is_active })
        .eq('id', consultation.id);

      if (error) throw error;

      toast({
        title: !consultation.is_active ? "تم تفعيل نوع الاستشارة" : "تم إلغاء تفعيل نوع الاستشارة",
        description: "تم تحديث الحالة بنجاح"
      });

      fetchConsultations();
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث الحالة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">جاري تحميل أنواع الاستشارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة أنواع الاستشارات</h1>
          <p className="text-muted-foreground">إدارة وتحديد أسعار أنواع الاستشارات المختلفة</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gap-2" 
              onClick={() => handleOpenDialog()}
              data-testid="add-consultation-type"
            >
              <Plus className="w-4 h-4" />
              نوع استشارة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingConsultation ? 'تعديل نوع الاستشارة' : 'إضافة نوع استشارة جديد'}
              </DialogTitle>
              <DialogDescription>
                املئي البيانات المطلوبة لإضافة أو تعديل نوع الاستشارة
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleSaveConsultation)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم نوع الاستشارة</Label>
                <Input
                  id="name"
                  placeholder="مثال: استشارة قانونية عامة"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الاستشارة</Label>
                <Textarea
                  id="description"
                  placeholder="وصف تفصيلي عن نوع الاستشارة..."
                  rows={3}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (بالريال)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">المدة (بالدقائق)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    step="5"
                    placeholder="60"
                    {...register('duration_minutes', { valueAsNumber: true })}
                  />
                  {errors.duration_minutes && (
                    <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_active"
                    {...register('is_active')}
                  />
                  <Label htmlFor="is_active">مفعل</Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_emergency"
                    {...register('is_emergency')}
                  />
                  <Label htmlFor="is_emergency">استشارة عاجلة</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" data-testid="save-consultation-type">
                  {editingConsultation ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {consultations.map((consultation) => (
          <Card key={consultation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{consultation.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {consultation.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {consultation.is_emergency && (
                    <Badge variant="destructive">عاجل</Badge>
                  )}
                  <Badge variant={consultation.is_active ? 'default' : 'secondary'}>
                    {consultation.is_active ? 'مفعل' : 'معطل'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{consultation.price === 0 ? 'مجانية' : `${consultation.price} ريال`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{consultation.duration_minutes} دقيقة</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(consultation)}
                    data-testid={`edit-consultation-${consultation.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    تعديل
                  </Button>
                  <Button
                    variant={consultation.is_active ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => toggleConsultationStatus(consultation)}
                    data-testid={`toggle-consultation-${consultation.id}`}
                  >
                    {consultation.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {consultations.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Settings className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد أنواع استشارات</h3>
              <p className="text-muted-foreground text-center mb-4">
                لم يتم إنشاء أي أنواع استشارات بعد. ابدئي بإضافة نوع استشارة جديد.
              </p>
              <Button 
                className="gap-2" 
                onClick={() => handleOpenDialog()}
                data-testid="add-first-consultation-type"
              >
                <Plus className="w-4 h-4" />
                إضافة نوع استشارة جديد
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsultationManagement;