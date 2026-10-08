import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Notification, 
  getTimeGroup, 
  TimeGroup,
  TIME_GROUP_LABELS,
  NotificationGroup,
  normalizeNotificationType,
  normalizeNotificationPriority,
} from '@/types/notification';

const MAX_NOTIFICATIONS = 50;

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  groupedNotifications: NotificationGroup[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); return; }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(MAX_NOTIFICATIONS);

    if (!error && data) {
      setNotifications(data.map((row: any) => ({
        id: row.id,
        type: normalizeNotificationType(row.type),
        title: row.title,
        description: row.description,
        timestamp: new Date(row.created_at),
        isRead: row.is_read,
        avatar: row.avatar || undefined,
        actionUrl: row.action_url || undefined,
        priority: normalizeNotificationPriority(row.priority),
        metadata: row.metadata || undefined,
      })));
    }
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<TimeGroup, Notification[]> = {
      today: [], yesterday: [], this_week: [], this_month: [], older: [],
    };

    const sorted = [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sorted.forEach(notification => {
      const group = getTimeGroup(new Date(notification.timestamp));
      groups[group].push(notification);
    });

    const groupOrder: TimeGroup[] = ['today', 'yesterday', 'this_week', 'this_month', 'older'];
    return groupOrder
      .filter(group => groups[group].length > 0)
      .map(group => ({ group, label: TIME_GROUP_LABELS[group], notifications: groups[group] }));
  }, [notifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  }, [user]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  }, []);

  const clearAllRead = useCallback(async () => {
    if (!user) return;
    setNotifications(prev => prev.filter(n => !n.isRead));
    await supabase.from('notifications').delete().eq('user_id', user.id).eq('is_read', true);
  }, [user]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: notification.type,
        title: notification.title,
        description: notification.description,
        avatar: notification.avatar || null,
        action_url: notification.actionUrl || null,
        priority: notification.priority,
        metadata: (notification.metadata || {}) as any,
      } as any)
      .select()
      .single();

    if (!error && data) {
      const newNotif: Notification = {
        id: data.id,
        type: normalizeNotificationType(data.type),
        title: data.title,
        description: data.description,
        timestamp: new Date(data.created_at),
        isRead: false,
        avatar: data.avatar as any,
        actionUrl: data.action_url || undefined,
        priority: normalizeNotificationPriority(data.priority),
        metadata: data.metadata as any,
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS));
    }
  }, [user]);

  return {
    notifications, unreadCount, groupedNotifications,
    markAsRead, markAllAsRead, deleteNotification, clearAllRead, addNotification,
  };
};
