import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  subject: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  method: string;
  duration_minutes: number;
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) {
        toast({
          title: "خطأ في تحميل المواعيد",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">جاري تحميل المواعيد...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المواعيد</h1>
          <p className="text-muted-foreground">إدارة مواعيد الاستشارات والجلسات</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          موعد جديد
        </Button>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مواعيد</h3>
            <p className="text-muted-foreground text-center mb-4">
              لم يتم حجز أي مواعيد بعد. احجزي موعدك الأول الآن.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              حجز موعد جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{appointment.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {appointment.scheduled_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.scheduled_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {appointment.method === 'in_person' ? 'حضوري' : 'عن بعد'}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(appointment.status)}>
                    {appointment.status === 'confirmed' && 'مؤكد'}
                    {appointment.status === 'pending' && 'في الانتظار'}
                    {appointment.status === 'cancelled' && 'ملغي'}
                    {appointment.status === 'completed' && 'مكتمل'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    المدة: {appointment.duration_minutes} دقيقة
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">تعديل</Button>
                    <Button variant="outline" size="sm">إلغاء</Button>
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

export default AppointmentsPage;