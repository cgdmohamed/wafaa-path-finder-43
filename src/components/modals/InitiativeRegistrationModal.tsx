import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';

interface InitiativeRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'volunteer' | 'suggest';
}

const InitiativeRegistrationModal = ({ isOpen, onClose, type }: InitiativeRegistrationModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getModalContent = () => {
    if (type === 'volunteer') {
      return {
        title: 'تطوعي معنا',
        description: 'انضمي إلى فريق المتطوعات وكوني جزءاً من التغيير الإيجابي',
        messagePlaceholder: 'أخبرينا عن خبراتك واهتماماتك والأوقات المناسبة للتطوع...'
      };
    } else {
      return {
        title: 'اقترحي مبادرة',
        description: 'شاركينا أفكارك لمبادرات جديدة تخدم المجتمع',
        messagePlaceholder: 'اكتبي تفاصيل المبادرة المقترحة، أهدافها، والفئة المستهدفة...'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Create a general initiative registration (we can create a separate table for suggestions later)
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          sender_id: user.user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: type === 'volunteer' ? 'طلب تطوع' : 'اقتراح مبادرة',
          message: formData.message,
          urgency: 'normal'
        });

      if (error) throw error;

      toast({
        title: "تم إرسال طلبك بنجاح",
        description: "سيتم مراجعة طلبك والتواصل معك قريباً"
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
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

  const content = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl flex items-center gap-2 justify-end">
            <Heart className="w-5 h-5 text-primary" />
            {content.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-primary/5 rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-right">{content.description}</p>
          </div>

          {/* Form */}
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
              <Textarea
                placeholder={content.messagePlaceholder}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={4}
                className="text-right"
                required
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

export default InitiativeRegistrationModal;