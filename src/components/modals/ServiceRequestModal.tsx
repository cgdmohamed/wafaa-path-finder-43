import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  price?: number;
  duration_minutes?: number;
}

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

const ServiceRequestModal = ({ isOpen, onClose, service }: ServiceRequestModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('service_requests')
        .insert({
          service_id: service.id,
          user_id: user.user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          urgency: formData.urgency
        });

      if (error) throw error;

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم التواصل معك قريباً من قبل فريقنا المختص"
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        urgency: 'normal'
      });
      onClose();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: "خطأ في إرسال الطلب",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">طلب خدمة: {service.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Details */}
          <div className="bg-secondary/10 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3 text-right">{service.description}</p>
            <div className="flex gap-2 justify-end">
              {service.price && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  {service.price} ريال
                </Badge>
              )}
              {service.duration_minutes && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {service.duration_minutes} دقيقة
                </Badge>
              )}
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="الاسم الكامل"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="text-right"
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="text-right"
              />
            </div>

            <div>
              <Input
                type="tel"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="text-right"
              />
            </div>

            <div>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="مستوى الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="normal">عادية</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Textarea
                placeholder="تفاصيل إضافية عن طلبك..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                className="text-right"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestModal;