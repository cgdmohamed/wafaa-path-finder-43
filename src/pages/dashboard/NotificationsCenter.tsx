import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, MessageSquare, Scale, Settings, Search, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SkeletonList } from '@/components/ui/skeleton-layouts';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return Calendar;
    case 'case':
      return Scale;
    case 'document':
      return FileText;
    case 'message':
      return MessageSquare;
    default:
      return Settings;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'appointment':
      return 'text-blue-500';
    case 'case':
      return 'text-purple-500';
    case 'document':
      return 'text-green-500';
    case 'message':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'appointment':
      return 'المواعيد';
    case 'case':
      return 'القضايا';
    case 'document':
      return 'المستندات';
    case 'message':
      return 'الرسائل';
    case 'system':
      return 'النظام';
    default:
      return 'أخرى';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'منذ دقائق';
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
  if (diffInHours < 48) return 'أمس';
  return date.toLocaleDateString('ar-SA');
};

const NotificationsCenter = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount, isLoading } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unread') return !notification.is_read && matchesSearch;
    return notification.type === activeTab && matchesSearch;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
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
              <BreadcrumbPage>الإشعارات</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <SkeletonList count={5} />
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
            <BreadcrumbPage>الإشعارات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مركز الإشعارات</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `لديك ${unreadCount} إشعار غير مقروء` 
              : 'جميع الإشعارات مقروءة'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="w-4 h-4" />
            تمييز الكل كمقروء
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في الإشعارات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">الكل ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">غير مقروء ({unreadCount})</TabsTrigger>
          <TabsTrigger value="appointment">المواعيد</TabsTrigger>
          <TabsTrigger value="case">القضايا</TabsTrigger>
          <TabsTrigger value="document">المستندات</TabsTrigger>
          <TabsTrigger value="message">الرسائل</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Settings className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery 
                    ? `لم يتم العثور على إشعارات تطابق "${searchQuery}"`
                    : activeTab === 'unread' 
                      ? 'جميع الإشعارات مقروءة'
                      : 'لا توجد إشعارات في هذه الفئة'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-all hover:shadow-md ${
                      !notification.is_read ? 'border-r-4 border-primary bg-primary/5' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${iconColor}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {notification.title}
                              {!notification.is_read && (
                                <Badge variant="secondary" className="text-xs">جديد</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-4">
                              <Badge variant="outline">{getTypeLabel(notification.type)}</Badge>
                              <span>{formatDate(notification.created_at)}</span>
                            </CardDescription>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="gap-2"
                          >
                            <Check className="w-4 h-4" />
                            تمييز كمقروء
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.body}
                      </p>
                      {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                        <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
                          <p className="text-xs text-muted-foreground">معلومات إضافية</p>
                          <pre className="text-xs mt-1 text-muted-foreground">
                            {JSON.stringify(notification.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsCenter;