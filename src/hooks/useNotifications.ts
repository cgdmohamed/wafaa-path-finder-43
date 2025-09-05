import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Match the actual database schema for notifications
interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Transform data to match interface (existing table uses 'message' not 'body')
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        type: item.type,
        title: item.title || '',
        body: item.message || '', // Map 'message' to 'body'
        metadata: {}, // Empty metadata for existing schema
        is_read: item.is_read,
        created_at: item.created_at
      }));

      setNotifications(transformedData);
      setUnreadCount(transformedData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      toast({
        title: "تم تحديث الإشعارات",
        description: "تم تمييز جميع الإشعارات كمقروءة"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification update received:', payload);
          
          // Handle new notifications
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as any;
            const newNotification: Notification = {
              id: newItem.id,
              user_id: newItem.user_id,
              type: newItem.type,
              title: newItem.title || '',
              body: newItem.message || '', // Map 'message' to 'body'
              metadata: {},
              is_read: newItem.is_read,
              created_at: newItem.created_at
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.body,
              duration: 5000
            });
          }
          
          // Handle updates (mark as read)
          if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as any;
            const updatedNotification: Notification = {
              id: updatedItem.id,
              user_id: updatedItem.user_id,
              type: updatedItem.type,
              title: updatedItem.title || '',
              body: updatedItem.message || '', // Map 'message' to 'body'
              metadata: {},
              is_read: updatedItem.is_read,
              created_at: updatedItem.created_at
            };
            
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
            
            // Update unread count if notification was marked as read
            if (updatedNotification.is_read && payload.old?.is_read === false) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};