import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const EMPTY_HISTORY: RawDashboard['diagnosticHistory'] = [];

interface DashboardData {
  profile: {
    fullName: string;
    sport: string;
    age: number;
  } | null;
  stats: {
    streak: number;
    xp: number;
    level: string;
    totalLogs: number;
    totalTrainingMin: number;
  } | null;
  health: {
    hydration: number;
    sleepHours: number;
    painLevel: number;
    energyLevel: number;
    recovery: 'optimal' | 'good' | 'needs-rest';
  } | null;
  weeklyCompliance: number;
  diagnosticScores: {
    physical: number;
    technique: number;
    mental: number;
  };
  isLoading: boolean;
}

interface RawDashboard {
  profile: DashboardData['profile'];
  stats: DashboardData['stats'];
  latestLog: { hydration_liters?: number; sleep_hours?: number; pain_level?: number; energy_level?: number } | null;
  weeklyLogs: number;
  diagnosticHistory: Array<{ axis: string | null; score: number | string | null }>;
}

async function fetchDashboard(userId: string): Promise<RawDashboard> {
  const [profileRes, statsRes, latestLogRes, weeklyLogsRes, diagnosticRes] = await Promise.all([
    supabase.from('profiles').select('full_name, sport, date_of_birth').eq('id', userId).single(),
    supabase.from('player_stats').select('current_streak, xp, level, total_logs, total_training_min').eq('user_id', userId).single(),
    supabase.from('daily_logs').select('hydration_liters, sleep_hours, pain_level, energy_level, log_date')
      .eq('user_id', userId).order('log_date', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('daily_logs').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('log_date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]),
    supabase.from('diagnostic_history').select('axis, score, recorded_at')
      .eq('user_id', userId).order('recorded_at', { ascending: false }).limit(20),
  ]);

  let profile: RawDashboard['profile'] = null;
  if (profileRes.data) {
    const dob = profileRes.data.date_of_birth;
    const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000)) : 0;
    profile = { fullName: profileRes.data.full_name, sport: profileRes.data.sport || 'Deporte', age };
  }
  const stats: RawDashboard['stats'] = statsRes.data ? {
    streak: statsRes.data.current_streak,
    xp: statsRes.data.xp,
    level: statsRes.data.level,
    totalLogs: statsRes.data.total_logs,
    totalTrainingMin: statsRes.data.total_training_min,
  } : null;

  return {
    profile,
    stats,
    latestLog: latestLogRes.data ?? null,
    weeklyLogs: weeklyLogsRes.count ?? 0,
    diagnosticHistory: diagnosticRes.data ?? [],
  };
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => fetchDashboard(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });
  const profile = query.data?.profile ?? null;
  const stats = query.data?.stats ?? null;
  const latestLog = query.data?.latestLog ?? null;
  const weeklyLogs = query.data?.weeklyLogs ?? 0;
  const diagnosticHistory = query.data?.diagnosticHistory ?? EMPTY_HISTORY;
  const isLoading = !!user?.id && query.isLoading;

  // Compute health from latest log
  const health = useMemo<DashboardData['health']>(() => {
    if (!latestLog) return null;
    const painLevel = latestLog.pain_level ?? 0;
    const energyLevel = latestLog.energy_level ?? 5;
    let recovery: 'optimal' | 'good' | 'needs-rest' = 'optimal';
    if (painLevel >= 5 || energyLevel <= 2) recovery = 'needs-rest';
    else if (painLevel >= 3 || energyLevel <= 3) recovery = 'good';

    return {
      hydration: latestLog.hydration_liters ?? 0,
      sleepHours: latestLog.sleep_hours ?? 0,
      painLevel,
      energyLevel,
      recovery,
    };
  }, [latestLog]);

  // Compute weekly compliance (out of 7 days)
  const weeklyCompliance = useMemo(() => {
    return Math.round((weeklyLogs / 7) * 100);
  }, [weeklyLogs]);

  // Compute diagnostic scores - latest per axis
  const diagnosticScores = useMemo(() => {
    const axisMap: Record<string, number> = {};
    for (const entry of diagnosticHistory) {
      const axis = (entry.axis || '').toLowerCase();
      if (!axisMap[axis]) {
        axisMap[axis] = Number(entry.score) || 0;
      }
    }
    return {
      physical: axisMap['físico'] ?? axisMap['fisico'] ?? 0,
      technique: axisMap['técnico'] ?? axisMap['tecnico'] ?? 0,
      mental: axisMap['mental'] ?? 0,
    };
  }, [diagnosticHistory]);

  return {
    profile,
    stats,
    health,
    weeklyCompliance,
    diagnosticScores,
    isLoading,
  };
}
