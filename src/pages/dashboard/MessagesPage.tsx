import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الرسائل</h1>
          <p className="text-muted-foreground">إدارة ومراجعة رسائل التواصل</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          رسالة جديدة
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد رسائل</h3>
            <p className="text-muted-foreground text-center mb-4">
              لم يتم استلام أي رسائل بعد. ستظهر الرسائل الواردة هنا.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              كتابة رسالة جديدة
            </Button>
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