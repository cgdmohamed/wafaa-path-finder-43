import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SkeletonList } from '@/components/ui/skeleton-layouts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  urgency: string;
  created_at: string;
  response?: string;
  responded_at?: string;
}

const messageSchema = z.object({
  subject: z.string().min(1, 'يرجى إدخال موضوع الرسالة'),
  message: z.string().min(10, 'يرجى إدخال محتوى الرسالة (10 أحرف على الأقل)'),
  urgency: z.enum(['low', 'normal', 'high'])
});

type MessageFormData = z.infer<typeof messageSchema>;

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      urgency: 'normal'
    }
  });

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('contact_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          console.log('Message update received:', payload);
          fetchMessages(); // Refetch messages on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "خطأ في تحميل الرسائل",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return 'default';
      case 'new': return 'destructive';
      case 'in_progress': return 'secondary';
      default: return 'secondary';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const handleSendMessage = async (data: MessageFormData) => {
    setIsSending(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('المستخدم غير مصادق عليه');

      const { error } = await supabase
        .from('contact_messages')
        .insert({
          subject: data.subject,
          message: data.message,
          urgency: data.urgency,
          sender_id: user.data.user.id,
          name: 'المستخدم', // Will be replaced with actual user name
          email: user.data.user.email || ''
        });

      if (error) throw error;

      toast({
        title: "تم إرسال الرسالة بنجاح",
        description: "سيتم الرد عليك قريباً"
      });

      setMessageDialogOpen(false);
      reset();
      fetchMessages();
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال الرسالة",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
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
              <BreadcrumbPage>الرسائل</BreadcrumbPage>
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
            <BreadcrumbPage>الرسائل</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الرسائل</h1>
          <p className="text-muted-foreground">إدارة ومراجعة رسائل التواصل</p>
        </div>
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              رسالة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>رسالة جديدة</DialogTitle>
              <DialogDescription>
                أرسلي رسالة للمحاميات والإدارة
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleSendMessage)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">موضوع الرسالة</Label>
                <Input
                  id="subject"
                  placeholder="موضوع الرسالة..."
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="urgency">الأولوية</Label>
                <select
                  id="urgency"
                  {...register('urgency')}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="low">منخفضة</option>
                  <option value="normal">عادية</option>
                  <option value="high">عاجلة</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">محتوى الرسالة</Label>
                <Textarea
                  id="message"
                  placeholder="اكتبي رسالتك هنا..."
                  rows={4}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد رسائل</h3>
            <p className="text-muted-foreground text-center mb-4">
              لم يتم استلام أي رسائل بعد. ستظهر الرسائل الواردة هنا.
            </p>
            <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  كتابة رسالة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>رسالة جديدة</DialogTitle>
                  <DialogDescription>
                    أرسلي رسالة للمحاميات والإدارة
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleSendMessage)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">موضوع الرسالة</Label>
                    <Input
                      id="subject"
                      placeholder="موضوع الرسالة..."
                      {...register('subject')}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="urgency">الأولوية</Label>
                    <select
                      id="urgency"
                      {...register('urgency')}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="low">منخفضة</option>
                      <option value="normal">عادية</option>
                      <option value="high">عاجلة</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">محتوى الرسالة</Label>
                    <Textarea
                      id="message"
                      placeholder="اكتبي رسالتك هنا..."
                      rows={4}
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isSending}>
                      {isSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{message.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span>تاريخ الإرسال: {new Date(message.created_at).toLocaleDateString('ar')}</span>
                      {message.responded_at && (
                        <span>تاريخ الرد: {new Date(message.responded_at).toLocaleDateString('ar')}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(message.status)}>
                      {message.status === 'responded' && 'تم الرد'}
                      {message.status === 'new' && 'جديدة'}
                      {message.status === 'in_progress' && 'قيد المعالجة'}
                    </Badge>
                    <Badge variant={getUrgencyColor(message.urgency)}>
                      {message.urgency === 'high' && 'عاجل'}
                      {message.urgency === 'normal' && 'عادي'}
                      {message.urgency === 'low' && 'منخفض'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.message}
                  </p>
                  {message.response && (
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>الرد:</strong> {message.response}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        عرض التفاصيل
                      </Button>
                      {!message.response && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Send className="w-4 h-4" />
                          رد
                        </Button>
                      )}
                    </div>
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

export default MessagesPage;