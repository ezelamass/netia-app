import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, startOfWeek, addWeeks, isSameDay, startOfMonth, endOfMonth, isBefore, isAfter, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type EventType = 'training' | 'nutrition' | 'mental' | 'tournament' | 'school' | 'rest' | 'alert';
export type AvatarType = 'TINO' | 'ZAHIA' | 'ROMA';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  type: EventType;
  avatar?: AvatarType;
  description?: string;
  isRecurring?: boolean;
  isCompleted?: boolean;
  location?: string;
  /** 'mio' = del usuario; 'club' = evento del club (solo lectura) */
  source?: 'mio' | 'club';
  clubId?: string;
}

export interface EventTypeConfig {
  type: EventType;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const EVENT_TYPES: EventTypeConfig[] = [
  { type: 'training', label: 'Entrenamiento', emoji: '🏋️', color: 'text-blue-600', bgColor: 'bg-blue-500' },
  { type: 'nutrition', label: 'Plan nutricional', emoji: '🍎', color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
  { type: 'mental', label: 'Sesión mental', emoji: '🧠', color: 'text-violet-600', bgColor: 'bg-violet-500' },
  { type: 'tournament', label: 'Torneo', emoji: '🏆', color: 'text-orange-600', bgColor: 'bg-orange-500' },
  { type: 'school', label: 'Escolar', emoji: '📚', color: 'text-gray-600', bgColor: 'bg-gray-500' },
  { type: 'rest', label: 'Descanso', emoji: '🌴', color: 'text-green-600', bgColor: 'bg-green-400' },
  { type: 'alert', label: 'Alerta', emoji: '⚠️', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
];

export const getEventConfig = (type: EventType): EventTypeConfig => {
  return EVENT_TYPES.find(e => e.type === type) || EVENT_TYPES[0];
};

type EventRow = {
  id: string; title: string; start_time: string; end_time: string | null; event_type: string | null;
  description: string | null; is_recurring: boolean | null; location: string | null; club_id: string | null;
};

export const mapEventRow = (row: EventRow, source: 'mio' | 'club'): CalendarEvent => ({
  id: row.id,
  title: row.title,
  date: new Date(row.start_time),
  startTime: row.start_time ? format(new Date(row.start_time), 'HH:mm') : undefined,
  endTime: row.end_time ? format(new Date(row.end_time), 'HH:mm') : undefined,
  type: (row.event_type || 'training') as EventType,
  description: row.description || undefined,
  isRecurring: row.is_recurring || false,
  isCompleted: false,
  location: row.location || undefined,
  source,
  clubId: row.club_id || undefined,
});

const EMPTY: CalendarEvent[] = [];

/** Eventos propios + eventos de mis clubs (dos consultas, compatibles con el mock de la demo). */
async function fetchCalendar(userId: string): Promise<CalendarEvent[]> {
  const [mine, clubIdsRes] = await Promise.all([
    supabase.from('calendar_events').select('*').eq('user_id', userId).order('start_time', { ascending: true }),
    supabase.rpc('get_user_club_ids', { _user_id: userId }),
  ]);
  const own = (mine.data ?? []).map((r) => mapEventRow(r as EventRow, 'mio'));
  const clubIds: string[] = clubIdsRes.data ?? [];
  if (!clubIds.length) return own;
  const club = await supabase.from('calendar_events').select('*').in('club_id', clubIds).order('start_time', { ascending: true });
  const ownIds = new Set(own.map((e) => e.id));
  const fromClub = (club.data ?? [])
    .filter((r) => !ownIds.has(r.id))
    .map((r) => mapEventRow(r as EventRow, 'club'));
  return [...own, ...fromClub].sort((x, y) => x.date.getTime() - y.date.getTime());
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['calendar', user?.id],
    queryFn: () => fetchCalendar(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
  const events = query.data ?? EMPTY;
  const isLoading = !!user && query.isLoading;
  const fetchEvents = useCallback(
    () => qc.invalidateQueries({ queryKey: ['calendar', user?.id] }),
    [qc, user?.id],
  );

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!user) return null;

    const startTime = event.startTime
      ? new Date(`${format(event.date, 'yyyy-MM-dd')}T${event.startTime}:00`).toISOString()
      : event.date.toISOString();
    const endTime = event.endTime
      ? new Date(`${format(event.date, 'yyyy-MM-dd')}T${event.endTime}:00`).toISOString()
      : undefined;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: event.title,
        event_type: event.type,
        start_time: startTime,
        end_time: endTime || null,
        description: event.description || null,
        is_recurring: event.isRecurring || false,
        location: null,
      })
      .select()
      .single();

    if (!error && data) {
      fetchEvents();
      return { ...event, id: data.id } as CalendarEvent;
    }
    return null;
  };

  const isClubEvent = (id: string) => events.find((e) => e.id === id)?.source === 'club';

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (isClubEvent(id)) return;
    const updatePayload: Record<string, any> = {};
    if (updates.title) updatePayload.title = updates.title;
    if (updates.type) updatePayload.event_type = updates.type;
    if (updates.description !== undefined) updatePayload.description = updates.description;

    await supabase.from('calendar_events').update(updatePayload).eq('id', id);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    if (isClubEvent(id)) return;
    await supabase.from('calendar_events').delete().eq('id', id);
    fetchEvents();
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(event.date, date))
      .sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
  };

  const getEventsForWeek = (weekStart: Date): CalendarEvent[] => {
    const weekEnd = addDays(weekStart, 6);
    return events.filter(event => {
      const d = event.date;
      return (isSameDay(d, weekStart) || isAfter(d, weekStart)) &&
             (isSameDay(d, weekEnd) || isBefore(d, weekEnd));
    });
  };

  const getEventsForMonth = (monthDate: Date): CalendarEvent[] => {
    const ms = startOfMonth(monthDate);
    const me = endOfMonth(monthDate);
    return events.filter(event => {
      const d = event.date;
      return (isSameDay(d, ms) || isAfter(d, ms)) && (isSameDay(d, me) || isBefore(d, me));
    });
  };

  const getNextEvent = (): CalendarEvent | null => {
    const now = new Date();
    const upcoming = events
      .filter(e => isAfter(e.date, now) || isSameDay(e.date, now))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] || null;
  };

  const getWeekStats = (weekStart: Date) => {
    const weekEvents = getEventsForWeek(weekStart);
    const trainings = weekEvents.filter(e => e.type === 'training');
    const completed = trainings.filter(e => e.isCompleted).length;
    return { total: trainings.length, completed, pending: trainings.length - completed };
  };

  const getStreak = (): number => {
    const today = new Date();
    let streak = 0;
    let checkDate = today;
    while (true) {
      const dayEvents = getEventsForDate(checkDate);
      const hasCompleted = dayEvents.some(e => e.type === 'training' && e.isCompleted);
      if (hasCompleted) { streak++; checkDate = addDays(checkDate, -1); }
      else if (isSameDay(checkDate, today)) {
        const hasPending = dayEvents.some(e => e.type === 'training' && !e.isCompleted);
        if (!hasPending) { checkDate = addDays(checkDate, -1); continue; }
        break;
      } else break;
    }
    return streak;
  };

  return {
    events, isLoading, addEvent, updateEvent, deleteEvent,
    getEventsForDate, getEventsForWeek, getEventsForMonth,
    getNextEvent, getWeekStats, getStreak,
  };
};
