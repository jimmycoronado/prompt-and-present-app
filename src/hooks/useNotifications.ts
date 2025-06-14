
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  };

  // Show browser notification
  const showBrowserNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'dali-ai-notification'
      });
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) {
      console.log('No user found, skipping notifications fetch');
      return;
    }
    
    console.log('Fetching notifications for user:', user.id);
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        // Solo mostrar error si es un error real de conexión o permisos
        if (error.code && error.code !== 'PGRST116') { // PGRST116 es "no rows found"
          toast({
            title: "Error de conexión",
            description: "No se pudieron cargar las notificaciones. Revisa tu conexión.",
            variant: "destructive"
          });
        }
        return;
      }

      // Type assertion to ensure compatibility with our Notification interface
      const typedNotifications = (data || []).map(item => ({
        ...item,
        type: item.type as Notification['type']
      }));

      console.log('Notifications fetched successfully:', typedNotifications.length);
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Solo mostrar toast para errores de red o conexión
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar las notificaciones. Revisa tu conexión.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Create a new notification (for testing or admin purposes)
  const createNotification = async (title: string, message: string, type: Notification['type'] = 'info') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title,
          message,
          type
        })
        .select()
        .single();

      if (error) throw error;

      // Show browser notification
      showBrowserNotification(title, message);
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    // Pedir permisos de notificación al montar el componente
    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }

    fetchNotifications();

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = {
            ...payload.new,
            type: payload.new.type as Notification['type']
          } as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification
          showBrowserNotification(newNotification.title, newNotification.message);
          
          // Show toast
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'error' ? 'destructive' : 'default'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    requestNotificationPermission,
    showBrowserNotification
  };
};
