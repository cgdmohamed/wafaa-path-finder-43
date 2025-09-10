import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Settings, Calendar, Users } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  type: string;
  icon_name: string;
  features?: string[];
  price?: number;
  duration_minutes?: number;
  is_active: boolean;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  location?: string;
  event_date: string;
  event_time?: string;
  max_participants?: number;
  current_participants: number;
  is_active: boolean;
  created_at: string;
}

const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { toast } = useToast();

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    type: 'main',
    icon_name: 'FileText',
    features: '',
    price: '',
    duration_minutes: '',
    is_active: true,
    is_featured: false,
    order_index: 0
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: '',
    location: '',
    event_date: '',
    event_time: '',
    max_participants: '',
    is_active: true
  });

  useEffect(() => {
    fetchServices();
    fetchEvents();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "خطأ في تحميل الخدمات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "خطأ في تحميل الفعاليات",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceData = {
        title: serviceForm.title,
        description: serviceForm.description,
        type: serviceForm.type,
        icon_name: serviceForm.icon_name,
        features: serviceForm.features ? serviceForm.features.split('\n').filter(f => f.trim()) : null,
        price: serviceForm.price ? parseFloat(serviceForm.price) : null,
        duration_minutes: serviceForm.duration_minutes ? parseInt(serviceForm.duration_minutes) : null,
        is_active: serviceForm.is_active,
        is_featured: serviceForm.is_featured,
        order_index: serviceForm.order_index
      };

      let error;
      if (editingService) {
        ({ error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id));
      } else {
        ({ error } = await supabase
          .from('services')
          .insert(serviceData));
      }

      if (error) throw error;

      toast({
        title: editingService ? "تم تحديث الخدمة" : "تم إضافة الخدمة",
        description: "تم حفظ التغييرات بنجاح"
      });

      resetServiceForm();
      setIsServiceModalOpen(false);
      fetchServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast({
        title: "خطأ في حفظ الخدمة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        event_type: eventForm.event_type,
        location: eventForm.location,
        event_date: eventForm.event_date,
        event_time: eventForm.event_time || null,
        max_participants: eventForm.max_participants ? parseInt(eventForm.max_participants) : null,
        is_active: eventForm.is_active
      };

      let error;
      if (editingEvent) {
        ({ error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id));
      } else {
        ({ error } = await supabase
          .from('events')
          .insert({ ...eventData, current_participants: 0 }));
      }

      if (error) throw error;

      toast({
        title: editingEvent ? "تم تحديث الفعالية" : "تم إضافة الفعالية",
        description: "تم حفظ التغييرات بنجاح"
      });

      resetEventForm();
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: "خطأ في حفظ الفعالية",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      title: '',
      description: '',
      type: 'main',
      icon_name: 'FileText',
      features: '',
      price: '',
      duration_minutes: '',
      is_active: true,
      is_featured: false,
      order_index: 0
    });
    setEditingService(null);
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: '',
      location: '',
      event_date: '',
      event_time: '',
      max_participants: '',
      is_active: true
    });
    setEditingEvent(null);
  };

  const editService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      type: service.type,
      icon_name: service.icon_name,
      features: service.features?.join('\n') || '',
      price: service.price?.toString() || '',
      duration_minutes: service.duration_minutes?.toString() || '',
      is_active: service.is_active,
      is_featured: service.is_featured,
      order_index: service.order_index
    });
    setIsServiceModalOpen(true);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      location: event.location || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      max_participants: event.max_participants?.toString() || '',
      is_active: event.is_active
    });
    setIsEventModalOpen(true);
  };

  const deleteService = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم حذف الخدمة",
        description: "تم حذف الخدمة بنجاح"
      });

      fetchServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "خطأ في حذف الخدمة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفعالية؟')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم حذف الفعالية",
        description: "تم حذف الفعالية بنجاح"
      });

      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "خطأ في حذف الفعالية",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Services Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إدارة الخدمات
            </CardTitle>
            <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetServiceForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة خدمة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>العنوان</Label>
                      <Input
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                        required
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label>النوع</Label>
                      <Select value={serviceForm.type} onValueChange={(value) => setServiceForm({...serviceForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quick">خدمة سريعة</SelectItem>
                          <SelectItem value="main">خدمة رئيسية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      required
                      className="text-right"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>السعر (ريال)</Label>
                      <Input
                        type="number"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label>المدة (دقيقة)</Label>
                      <Input
                        type="number"
                        value={serviceForm.duration_minutes}
                        onChange={(e) => setServiceForm({...serviceForm, duration_minutes: e.target.value})}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>المميزات (سطر واحد لكل ميزة)</Label>
                    <Textarea
                      value={serviceForm.features}
                      onChange={(e) => setServiceForm({...serviceForm, features: e.target.value})}
                      placeholder="ميزة أولى\nميزة ثانية\nميزة ثالثة"
                      className="text-right"
                    />
                  </div>

                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        checked={serviceForm.is_active}
                        onCheckedChange={(checked) => setServiceForm({...serviceForm, is_active: checked})}
                      />
                      <Label>نشطة</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        checked={serviceForm.is_featured}
                        onCheckedChange={(checked) => setServiceForm({...serviceForm, is_featured: checked})}
                      />
                      <Label>مميزة</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsServiceModalOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      {editingService ? 'تحديث' : 'إضافة'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{service.title}</h3>
                    <Badge variant={service.type === 'quick' ? 'default' : 'secondary'}>
                      {service.type === 'quick' ? 'سريعة' : 'رئيسية'}
                    </Badge>
                    {!service.is_active && <Badge variant="destructive">غير نشطة</Badge>}
                    {service.is_featured && <Badge variant="outline">مميزة</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  {service.price && (
                    <p className="text-sm text-primary">{service.price} ريال - {service.duration_minutes} دقيقة</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editService(service)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteService(service.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              إدارة الفعاليات
            </CardTitle>
            <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetEventForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة فعالية
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'تعديل فعالية' : 'إضافة فعالية جديدة'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>العنوان</Label>
                      <Input
                        value={eventForm.title}
                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        required
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label>نوع الفعالية</Label>
                      <Input
                        value={eventForm.event_type}
                        onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}
                        required
                        className="text-right"
                        placeholder="ورشة، محاضرة، معرض..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      className="text-right"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>التاريخ</Label>
                      <Input
                        type="date"
                        value={eventForm.event_date}
                        onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>الوقت</Label>
                      <Input
                        type="time"
                        value={eventForm.event_time}
                        onChange={(e) => setEventForm({...eventForm, event_time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>المكان</Label>
                      <Input
                        value={eventForm.location}
                        onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                        className="text-right"
                      />
                    </div>
                    <div>
                      <Label>العدد الأقصى للمشاركين</Label>
                      <Input
                        type="number"
                        value={eventForm.max_participants}
                        onChange={(e) => setEventForm({...eventForm, max_participants: e.target.value})}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch
                      checked={eventForm.is_active}
                      onCheckedChange={(checked) => setEventForm({...eventForm, is_active: checked})}
                    />
                    <Label>نشطة</Label>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      {editingEvent ? 'تحديث' : 'إضافة'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge variant="outline">{event.event_type}</Badge>
                    {!event.is_active && <Badge variant="destructive">غير نشطة</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📅 {new Date(event.event_date).toLocaleDateString('ar')} {event.event_time && `- ${event.event_time}`}</p>
                    {event.location && <p>📍 {event.location}</p>}
                    {event.max_participants && (
                      <p>👥 {event.current_participants} / {event.max_participants} مشارك</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editEvent(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesManagement;