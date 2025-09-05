import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Phone, Video, MessageSquare, User, AlertCircle } from 'lucide-react';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ConsultationType {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_emergency: boolean;
  is_active: boolean;
}

const AppointmentBooking = () => {
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    method: 'in_person',
    urgency_level: '3'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const consultationMethods = [
    { value: 'in_person', label: 'حضور شخصي', icon: User, description: 'في مكتب الجمعية' },
    { value: 'phone', label: 'مكالمة هاتفية', icon: Phone, description: 'عبر الهاتف' },
    { value: 'video', label: 'مكالمة مرئية', icon: Video, description: 'عبر تطبيق الفيديو' },
    { value: 'chat', label: 'محادثة كتابية', icon: MessageSquare, description: 'عبر الرسائل النصية' }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const urgencyLevels = [
    { value: '1', label: 'منخفضة', color: 'text-green-600' },
    { value: '2', label: 'عادية', color: 'text-blue-600' },
    { value: '3', label: 'متوسطة', color: 'text-yellow-600' },
    { value: '4', label: 'عالية', color: 'text-orange-600' },
    { value: '5', label: 'عاجلة', color: 'text-red-600' }
  ];

  useEffect(() => {
    const initializeBooking = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchConsultationTypes();
        }
      } catch (error) {
        console.error('Booking initialization error:', error);
      }
    };

    initializeBooking();
  }, []);

  const fetchConsultationTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setConsultationTypes(data || []);
    } catch (error) {
      console.error('Error fetching consultation types:', error);
      toast({
        title: "خطأ في تحميل أنواع الاستشارات",
        description: "حدث خطأ أثناء تحميل أنواع الاستشارات المتاحة",
        variant: "destructive"
      });
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      // Skip Fridays (5) and Saturdays (6) for business days
      if (date.getDay() !== 5 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    
    return dates.slice(0, 14); // Show next 14 available business days
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!selectedType) {
      toast({
        title: "يرجى اختيار نوع الاستشارة",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedDate) {
      toast({
        title: "يرجى اختيار التاريخ",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedTime) {
      toast({
        title: "يرجى اختيار الوقت",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "يرجى إدخال موضوع الاستشارة",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          consultation_type_id: selectedType,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          method: formData.method as 'in_person' | 'phone' | 'video' | 'chat',
          subject: formData.subject,
          description: formData.description,
          urgency_level: parseInt(formData.urgency_level),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "تم حجز الموعد بنجاح",
        description: "سيتم التواصل معك قريباً لتأكيد الموعد"
      });

      navigate('/dashboard/appointments');
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "خطأ في حجز الموعد",
        description: error.message || "حدث خطأ أثناء حجز الموعد",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedConsultationType = consultationTypes.find(type => type.id === selectedType);
  const availableDates = generateAvailableDates();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">حجز موعد استشارة</h1>
        <p className="text-muted-foreground">احجزي استشارة قانونية متخصصة مع فريقنا المختص</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Consultation Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                نوع الاستشارة
              </CardTitle>
              <CardDescription>اختاري نوع الاستشارة القانونية المناسبة لاحتياجك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {consultationTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedType === type.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{type.name}</h3>
                      {type.is_emergency && (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {type.duration_minutes} دقيقة
                      </span>
                      {type.price > 0 && (
                        <span className="font-medium text-primary">{type.price} ريال</span>
                      )}
                      {type.price === 0 && (
                        <span className="font-medium text-green-600">مجانية</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>اختيار التاريخ</CardTitle>
              <CardDescription>اختاري التاريخ المناسب للاستشارة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                {availableDates.map((date) => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  const isSelected = selectedDate === dateString;
                  const dayName = format(date, 'EEEE', { locale: ar });
                  const dayNumber = format(date, 'd');
                  const monthName = format(date, 'MMM', { locale: ar });

                  return (
                    <div
                      key={dateString}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                        isSelected 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                      onClick={() => setSelectedDate(dateString)}
                    >
                      <div className="text-xs font-medium">{dayName}</div>
                      <div className="text-lg font-bold">{dayNumber}</div>
                      <div className="text-xs">{monthName}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>اختيار الوقت</CardTitle>
              <CardDescription>اختاري الوقت المناسب للاستشارة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      className="justify-center"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Consultation Method */}
          <Card>
            <CardHeader>
              <CardTitle>طريقة الاستشارة</CardTitle>
              <CardDescription>اختاري الطريقة المفضلة لإجراء الاستشارة</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.method}
                onValueChange={(value) => handleInputChange('method', value)}
                className="grid gap-4 md:grid-cols-2"
              >
                {consultationMethods.map((method) => (
                  <div key={method.value} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Label htmlFor={method.value} className="flex items-center gap-3 cursor-pointer flex-1">
                      <method.icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">{method.label}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الاستشارة</CardTitle>
              <CardDescription>أضيفي تفاصيل حول الاستشارة المطلوبة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">موضوع الاستشارة *</Label>
                <Input
                  id="subject"
                  placeholder="أدخلي موضوع الاستشارة بشكل مختصر"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف مفصل (اختياري)</Label>
                <Textarea
                  id="description"
                  placeholder="أضيفي تفاصيل أكثر عن الموضوع والمساعدة المطلوبة"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="text-right min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">مستوى الأولوية</Label>
                <Select
                  value={formData.urgency_level}
                  onValueChange={(value) => handleInputChange('urgency_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختاري مستوى الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <span className={level.color}>{level.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>ملخص الحجز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedConsultationType && (
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <div className="font-medium text-sm">{selectedConsultationType.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedConsultationType.duration_minutes} دقيقة
                  </div>
                  {selectedConsultationType.is_emergency && (
                    <div className="flex items-center gap-1 mt-2 text-orange-600 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      استشارة عاجلة
                    </div>
                  )}
                </div>
              )}

              {selectedDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-medium">
                    {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: ar })}
                  </span>
                </div>
              )}

              {selectedTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الوقت:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              )}

              {formData.method && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">طريقة الاستشارة:</span>
                  <span className="font-medium">
                    {consultationMethods.find(m => m.value === formData.method)?.label}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between font-medium">
                  <span>التكلفة:</span>
                  <span className="text-primary">
                    {selectedConsultationType?.price === 0 ? 'مجانية' : `${selectedConsultationType?.price || 0} ريال`}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !selectedType || !selectedDate || !selectedTime}
                className="w-full bg-gradient-to-r from-primary to-primary-light"
              >
                {isLoading ? "جاري الحجز..." : "تأكيد الحجز"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                سيتم التواصل معك خلال 24 ساعة لتأكيد الموعد
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;