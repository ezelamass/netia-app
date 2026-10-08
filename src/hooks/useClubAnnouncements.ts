import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Announcement {
  id: string;
  clubId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetRoles: string[];
  isPinned: boolean;
  createdAt: Date;
}

const EMPTY: Announcement[] = [];
const EMPTY_IDS: string[] = [];

async function fetchAnnouncementsFor(userId: string): Promise<{ clubIds: string[]; announcements: Announcement[] }> {
  const res = await supabase.rpc('get_user_club_ids', { _user_id: userId });
  const cIds: string[] = res.data || [];
  if (cIds.length === 0) return { clubIds: cIds, announcements: EMPTY };

  const { data, error } = await supabase
    .from('club_announcements')
    .select('*')
    .in('club_id', cIds)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  const authorIds = [...new Set(data?.map(a => a.author_id) || [])];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', authorIds);
  const nameMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

  return {
    clubIds: cIds,
    announcements: (data || []).map(a => ({
      id: a.id,
      clubId: a.club_id,
      authorId: a.author_id,
      authorName: nameMap.get(a.author_id) || 'Coach',
      title: a.title,
      content: a.content,
      priority: a.priority as Announcement['priority'],
      targetRoles: a.target_roles || ['player', 'parent', 'coach'],
      isPinned: a.is_pinned || false,
      createdAt: new Date(a.created_at),
    })),
  };
}

export function useClubAnnouncements() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['club_announcements', user?.id],
    queryFn: () => fetchAnnouncementsFor(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });
  const announcements = query.data?.announcements ?? EMPTY;
  const clubIds = query.data?.clubIds ?? EMPTY_IDS;
  const isLoading = !!user?.id && query.isLoading;
  const fetchAnnouncements = useCallback(
    () => qc.invalidateQueries({ queryKey: ['club_announcements', user?.id] }),
    [qc, user?.id],
  );

  // Realtime subscription
  useEffect(() => {
    if (clubIds.length === 0) return;

    const channel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'club_announcements',
      }, () => {
        fetchAnnouncements();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clubIds, fetchAnnouncements]);

  const createAnnouncement = async (data: {
    title: string;
    content: string;
    priority: string;
    targetRoles: string[];
  }) => {
    if (!user?.id || clubIds.length === 0) return false;

    const { error } = await supabase
      .from('club_announcements')
      .insert({
        club_id: clubIds[0],
        author_id: user.id,
        title: data.title,
        content: data.content,
        priority: data.priority,
        target_roles: data.targetRoles,
      });

    if (error) {
      console.error('Error creating announcement:', error);
      toast.error('Error al crear comunicado');
      return false;
    }

    toast.success('Comunicado publicado');
    return true;
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    const { error } = await supabase
      .from('club_announcements')
      .update({ is_pinned: !currentPinned })
      .eq('id', id);

    if (error) {
      toast.error('Error al fijar comunicado');
      return;
    }
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase
      .from('club_announcements')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al eliminar comunicado');
      return;
    }
    toast.success('Comunicado eliminado');
    fetchAnnouncements();
  };

  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const recentAnnouncements = announcements.filter(a => !a.isPinned);

  return {
    announcements,
    pinnedAnnouncements,
    recentAnnouncements,
    isLoading,
    createAnnouncement,
    togglePin,
    deleteAnnouncement,
    canCreate: user?.role === 'coach' || user?.role === 'club_admin' || user?.role === 'admin',
  };
}
