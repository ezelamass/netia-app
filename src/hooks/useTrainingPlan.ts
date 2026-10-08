import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SessionType } from '@/types/training';

// Types moved from mockTrainingPlan
export type TrainingStage =
  | 'profiling'
  | 'diagnostic'
  | 'objective'
  | 'design'
  | 'validation'
  | 'implementation'
  | 'monitoring';

export interface StageInfo {
  key: TrainingStage;
  label: string;
  shortLabel: string;
  description: string;
}

export const TRAINING_STAGES: StageInfo[] = [
  { key: 'profiling', label: 'Perfilado', shortLabel: '1', description: 'Recopilación de datos del deportista' },
  { key: 'diagnostic', label: 'Diagnóstico', shortLabel: '2', description: 'Evaluación del estado actual' },
  { key: 'objective', label: 'Objetivo', shortLabel: '3', description: 'Definición de metas del ciclo' },
  { key: 'design', label: 'Diseño', shortLabel: '4', description: 'Planificación del mesociclo' },
  { key: 'validation', label: 'Validación', shortLabel: '5', description: 'Revisión del entrenador' },
  { key: 'implementation', label: 'Implementación', shortLabel: '6', description: 'Ejecución del plan' },
  { key: 'monitoring', label: 'Seguimiento', shortLabel: '7', description: 'Control y ajuste continuo' },
];

export interface DiagnosticAxis {
  axis: string;
  score: number;
  maxScore: number;
  detail: string;
}

export interface DaySession {
  id: string;
  dayIndex: number;
  dayLabel: string;
  type: SessionType | 'rest';
  title: string;
  duration: number;
  targetRPE: number;
  status: 'completed' | 'today' | 'upcoming' | 'rest';
  rpeLogged?: number;
  exercises: ExerciseBlock[];
}

export interface ExerciseBlock {
  phase: 'warmup' | 'main' | 'cooldown';
  name: string;
  sets?: string;
  duration?: string;
  notes?: string;
}

export interface CycleObjective {
  main: string;
  secondary: string[];
  progress: number;
}

export interface ComplianceData {
  completedSessions: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  weeklyTrend: number[];
}

export interface LoadRecoveryData {
  status: 'green' | 'yellow' | 'red';
  /** RPE promedio de las sesiones hechas esta semana; null si todavía no hay ninguna */
  avgRpe: number | null;
}

export interface TrainingPlan {
  id: string;
  cycleName: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  currentStage: TrainingStage;
  currentWeek: number;
  totalWeeks: number;
  sport: string;
  category: string;
  diagnostic: DiagnosticAxis[];
  objective: CycleObjective;
  weekSessions: DaySession[];
  compliance: ComplianceData;
  loadRecovery: LoadRecoveryData;
}

const XP_PER_SESSION = 50;

type ExerciseRow = { phase?: ExerciseBlock['phase']; name?: string; sets?: string; duration?: string; notes?: string };

const mapExercises = (raw: unknown): ExerciseBlock[] =>
  Array.isArray(raw)
    ? (raw as ExerciseRow[]).map((e) => ({
        phase: e.phase || 'main',
        name: e.name || '',
        sets: e.sets,
        duration: e.duration,
        notes: e.notes,
      }))
    : [];

async function fetchPlan(userId: string): Promise<TrainingPlan | null> {
  const { data: planData } = await supabase
    .from('training_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!planData) return null;

  const [sessionsRes, diagnosticRes, statsRes, totalRes, doneRes] = await Promise.all([
    supabase.from('training_plan_sessions').select('*').eq('plan_id', planData.id).eq('week_number', planData.current_week).order('day_index', { ascending: true }),
    supabase.from('diagnostic_history').select('axis, score, detail').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(10),
    supabase.from('player_stats').select('current_streak, longest_streak').eq('user_id', userId).maybeSingle(),
    supabase.from('training_plan_sessions').select('id', { count: 'exact', head: true }).eq('plan_id', planData.id),
    supabase.from('training_plan_sessions').select('id', { count: 'exact', head: true }).eq('plan_id', planData.id).eq('status', 'completed'),
  ]);
  const sessionsData = sessionsRes.data ?? [];

  const axisMap = new Map<string, DiagnosticAxis>();
  for (const d of diagnosticRes.data ?? []) {
    if (!axisMap.has(d.axis)) {
      axisMap.set(d.axis, { axis: d.axis, score: Number(d.score), maxScore: 10, detail: d.detail || '' });
    }
  }

  const jsDay = new Date().getDay(); // 0 = domingo
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1; // 0 = lunes

  const weekSessions: DaySession[] = sessionsData.map((s) => {
    let status: DaySession['status'] = 'upcoming';
    if (s.status === 'completed') status = 'completed';
    else if (s.day_index === todayIndex) status = 'today';
    if (s.session_type === 'rest') status = 'rest';
    return {
      id: s.id,
      dayIndex: s.day_index,
      dayLabel: s.day_label,
      type: s.session_type as SessionType | 'rest',
      title: s.title,
      duration: s.duration_min,
      targetRPE: s.rpe || 5,
      status,
      rpeLogged: s.status === 'completed' ? (s.rpe || undefined) : undefined,
      exercises: mapExercises(s.exercises),
    };
  });

  const logged = weekSessions.filter((s) => s.rpeLogged);
  const avgRpe = logged.length ? logged.reduce((a, s) => a + (s.rpeLogged ?? 0), 0) / logged.length : null;
  const loadStatus: LoadRecoveryData['status'] = avgRpe === null || avgRpe < 8 ? 'green' : avgRpe < 9 ? 'yellow' : 'red';

  const total = totalRes.count ?? 0;
  const completed = doneRes.count ?? 0;

  return {
    id: planData.id,
    cycleName: planData.cycle_name,
    cycleNumber: 1,
    startDate: planData.start_date || '',
    endDate: planData.end_date || '',
    currentStage: planData.current_stage as TrainingStage,
    currentWeek: planData.current_week,
    totalWeeks: planData.total_weeks,
    sport: planData.sport,
    category: planData.category,
    diagnostic: Array.from(axisMap.values()),
    objective: {
      main: planData.objective || '',
      secondary: [],
      progress: total ? Math.round((completed / total) * 100) : 0,
    },
    weekSessions,
    compliance: {
      completedSessions: completed,
      totalSessions: total,
      currentStreak: statsRes.data?.current_streak ?? 0,
      longestStreak: statsRes.data?.longest_streak ?? 0,
      weeklyTrend: [],
    },
    loadRecovery: { status: loadStatus, avgRpe },
  };
}

export function useTrainingPlan() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['training-plan', user?.id],
    queryFn: () => fetchPlan(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  /** Marca la sesión como hecha con el RPE que contó el chico y suma XP. */
  const completeSession = useCallback(async (sessionId: string, rpe: number) => {
    if (!user?.id) return false;
    const { error } = await supabase
      .from('training_plan_sessions')
      .update({ status: 'completed', rpe })
      .eq('id', sessionId);
    if (error) return false;
    const { data: stats } = await supabase.from('player_stats').select('xp').eq('user_id', user.id).maybeSingle();
    if (stats) {
      await supabase.from('player_stats').update({ xp: (stats.xp || 0) + XP_PER_SESSION }).eq('user_id', user.id);
    }
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['training-plan', user.id] }),
      qc.invalidateQueries({ queryKey: ['gamification', user.id] }),
      qc.invalidateQueries({ queryKey: ['dashboard', user.id] }),
    ]);
    return true;
  }, [qc, user?.id]);

  return {
    plan: query.data ?? null,
    isLoading: !!user?.id && query.isLoading,
    completeSession,
    xpPerSession: XP_PER_SESSION,
  };
}
