import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay, isSameDay, subDays, isAfter, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoGuard } from '@/hooks/useDemoGuard';

export interface DailyLog {
  id: string;
  date: Date;
  sleep: number;
  hydration: number;
  energy: 1 | 2 | 3 | 4 | 5;
  pain: number;
  painLocation?: string;
  trained?: boolean;
  trainingDurationMin?: number;
  completedAt: Date;
}

export interface TodayAction {
  id: string;
  type: 'training' | 'nutrition' | 'mental' | 'rest';
  avatar: 'TINO' | 'ZAHIA' | 'ROMA';
  title: string;
  description: string;
  duration?: string;
  isCompleted: boolean;
}

const getTodayAction = (): TodayAction => {
  const actions: TodayAction[] = [
    { id: 'action-training', type: 'training', avatar: 'TINO', title: 'Entrenamiento con TINO', description: 'Calentá 10\' + 3 bloques de 6\'', duration: '45 min', isCompleted: false },
    { id: 'action-nutrition', type: 'nutrition', avatar: 'ZAHIA', title: 'Plan de hidratación', description: 'Llevá 2L de agua al entreno', isCompleted: false },
    { id: 'action-mental', type: 'mental', avatar: 'ROMA', title: 'Visualización pre-torneo', description: '10 minutos de respiración y enfoque', duration: '10 min', isCompleted: false },
  ];
  return actions[Math.floor(Math.random() * actions.length)];
};

const EMPTY_LOGS: DailyLog[] = [];

async function fetchDailyLogs(userId: string): Promise<DailyLog[]> {
  const cutoff = subDays(new Date(), 60);
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', format(cutoff, 'yyyy-MM-dd'))
    .order('log_date', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    date: new Date(row.log_date),
    sleep: Number(row.sleep_hours) || 0,
    hydration: Number(row.hydration_liters) || 0,
    energy: (row.energy_level || 3) as 1 | 2 | 3 | 4 | 5,
    pain: row.pain_level || 0,
    painLocation: row.pain_location || undefined,
    trained: row.trained || false,
    trainingDurationMin: row.training_duration_min || 0,
    completedAt: new Date(row.created_at),
  }));
}

export const useDailyLog = () => {
  const { user } = useAuth();
  const { blockIfDemo } = useDemoGuard();
  const qc = useQueryClient();
  const [todayAction, setTodayAction] = useState<TodayAction>(() => {
    const stored = localStorage.getItem('netia-today-action');
    if (stored) { try { return JSON.parse(stored); } catch { return getTodayAction(); } }
    return getTodayAction();
  });

  useEffect(() => {
    localStorage.setItem('netia-today-action', JSON.stringify(todayAction));
  }, [todayAction]);

  // Con caché: al volver a Inicio los datos aparecen al instante y se refrescan de fondo.
  const logsQuery = useQuery({
    queryKey: ['daily_logs', user?.id],
    queryFn: () => fetchDailyLogs(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
  const logs = logsQuery.data ?? EMPTY_LOGS;
  const isLoading = !!user && logsQuery.isLoading;
  const fetchLogs = () => qc.invalidateQueries({ queryKey: ['daily_logs', user?.id] });

  const today = startOfDay(new Date());

  const todayLog = useMemo(() => logs.find(log => isSameDay(log.date, today)), [logs, today]);
  const hasLoggedToday = !!todayLog;

  const addLog = async (logData: Omit<DailyLog, 'id' | 'date' | 'completedAt'>) => {
    if (!user) return;
    if (blockIfDemo('No podés guardar logs en modo demo. Registrate para empezar a trackear.')) return;

    const { data, error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: user.id,
        log_date: format(today, 'yyyy-MM-dd'),
        sleep_hours: logData.sleep,
        hydration_liters: logData.hydration,
        energy_level: logData.energy,
        pain_level: logData.pain,
        pain_location: logData.painLocation || null,
        trained: logData.trained || false,
        training_duration_min: logData.trainingDurationMin || 0,
      }, { onConflict: 'user_id,log_date' })
      .select()
      .single();

    if (!error && data) {
      // Re-count total logs for accurate XP (avoids stale state race condition)
      try {
        const { count } = await supabase
          .from('daily_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        const totalLogs = count ?? 0;
        await supabase
          .from('player_stats')
          .update({ xp: totalLogs * 10, total_logs: totalLogs })
          .eq('user_id', user.id);
      } catch (e) {
        console.error('Error updating XP:', e);
      }
      fetchLogs();
    }
  };

  const updateTodayLog = async (updates: Partial<Omit<DailyLog, 'id' | 'date' | 'completedAt'>>) => {
    if (!user || !todayLog) return;
    if (blockIfDemo('No podés modificar logs en modo demo.')) return;

    const updatePayload: Record<string, any> = {};
    if (updates.sleep !== undefined) updatePayload.sleep_hours = updates.sleep;
    if (updates.hydration !== undefined) updatePayload.hydration_liters = updates.hydration;
    if (updates.energy !== undefined) updatePayload.energy_level = updates.energy;
    if (updates.pain !== undefined) updatePayload.pain_level = updates.pain;
    if (updates.painLocation !== undefined) updatePayload.pain_location = updates.painLocation;
    if (updates.trained !== undefined) updatePayload.trained = updates.trained;
    if (updates.trainingDurationMin !== undefined) updatePayload.training_duration_min = updates.trainingDurationMin;

    await supabase.from('daily_logs').update(updatePayload).eq('id', todayLog.id);
    fetchLogs();
  };

  const completeTodayAction = () => {
    setTodayAction(prev => ({ ...prev, isCompleted: true }));
  };

  const getLogsForDays = (days: number): DailyLog[] => {
    const cutoff = subDays(today, days);
    return logs
      .filter(log => isAfter(log.date, cutoff) || isSameDay(log.date, cutoff))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getStreak = (): number => {
    let streak = 0;
    let checkDate = hasLoggedToday ? today : subDays(today, 1);
    while (true) {
      const hasLog = logs.some(log => isSameDay(log.date, checkDate));
      if (hasLog) { streak++; checkDate = subDays(checkDate, 1); }
      else break;
    }
    return streak;
  };

  const getXP = (): number => {
    const baseXP = logs.length * 10;
    const streakBonus = getStreak() * 5;
    return baseXP + streakBonus;
  };

  return {
    logs, todayLog, hasLoggedToday, todayAction, isLoading,
    addLog, updateTodayLog, completeTodayAction, getLogsForDays, getStreak, getXP,
  };
};
