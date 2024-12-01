import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'payment' | 'renewal' | 'budget' | 'cancellation';
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

// Shared state for notifications
let globalNotifications: Notification[] = [];
let subscribers = new Set<(notifications: Notification[]) => void>();

const notifySubscribers = () => {
  subscribers.forEach(subscriber => subscriber(globalNotifications));
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(globalNotifications);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Add subscriber
    subscribers.add(setNotifications);

    // Fetch initial notifications if not already loaded
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        globalNotifications = data || [];
        notifySubscribers();
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (globalNotifications.length === 0) {
      fetchNotifications();
    } else {
      setLoading(false);
    }

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            globalNotifications = [payload.new as Notification, ...globalNotifications];
          } else if (payload.eventType === 'UPDATE') {
            globalNotifications = globalNotifications.map(notif =>
              notif.id === payload.new.id ? payload.new as Notification : notif
            );
          } else if (payload.eventType === 'DELETE') {
            globalNotifications = globalNotifications.filter(notif => 
              notif.id !== payload.old.id
            );
          }
          notifySubscribers();
        }
      )
      .subscribe();

    return () => {
      subscribers.delete(setNotifications);
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state immediately
      globalNotifications = globalNotifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      );
      notifySubscribers();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err as Error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state immediately
      globalNotifications = globalNotifications.map(notif => ({
        ...notif,
        is_read: true
      }));
      notifySubscribers();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err as Error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state immediately
      globalNotifications = globalNotifications.filter(
        notif => notif.id !== notificationId
      );
      notifySubscribers();
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err as Error);
    }
  };

  const clearAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      globalNotifications = [];
      notifySubscribers();
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setError(err as Error);
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
}
