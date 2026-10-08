export type SessionType = 'technical' | 'physical' | 'tactical' | 'match' | 'recovery';
export type CategoryType = 'U10' | 'U12' | 'U14' | 'U16' | 'adult';

export interface TrainingSession {
  id: string;
  date: Date;
  groupId: string;
  groupName: string;
  category: CategoryType;
  sport: string;
  type: SessionType;
  duration: number;
  rpeGroup: number;
  rpeIndividual?: Record<string, number>;
  attendance: {
    present: string[];
    absent: string[];
    total: number;
  };
  warmupDone: boolean;
  cooldownDone: boolean;
  notes?: string;
  coachId: string;
  createdAt: Date;
}

export interface WeeklyLoadSummary {
  week: string;
  category: string;
  totalSessions: number;
  totalMinutes: number;
  avgRPE: number;
  attendanceRate: number;
  acuteLoad: number;
  chronicLoad: number;
  acuteChronicRatio: number;
}

export interface LoadAlert {
  id: string;
  type: 'high_load' | 'injury_risk' | 'inactivity' | 'overexertion';
  message: string;
  severity: 'warning' | 'critical';
  category?: string;
  playerId?: string;
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  technical: 'Técnica',
  physical: 'Físico',
  tactical: 'Táctico',
  match: 'Partido',
  recovery: 'Recuperación',
};

/** `session_type`/`type` son texto libre en la base: un tipo desconocido se muestra genérico. */
export const getSessionTypeLabel = (type: string): string =>
  Object.prototype.hasOwnProperty.call(SESSION_TYPE_LABELS, type) ? SESSION_TYPE_LABELS[type as SessionType] : 'Entrenamiento';

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  technical: 'bg-blue-500',
  physical: 'bg-orange-500',
  tactical: 'bg-green-500',
  match: 'bg-purple-500',
  recovery: 'bg-gray-500',
};

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  U10: 'U10',
  U12: 'U12',
  U14: 'U14',
  U16: 'U16',
  adult: 'Adultos',
};

// Load calculations
export function calculateLoad(duration: number, rpe: number): number {
  return duration * rpe;
}

export function calculateACRatio(sessions: TrainingSession[]): number {
  const now = new Date();
  
  const daysBetween = (d1: Date, d2: Date) => 
    Math.floor((d2.getTime() - new Date(d1).getTime()) / (1000 * 60 * 60 * 24));
  
  const acuteSessions = sessions.filter(s => daysBetween(s.date, now) <= 7);
  const chronicSessions = sessions.filter(s => daysBetween(s.date, now) <= 28);
  
  const acuteLoad = acuteSessions.reduce(
    (sum, s) => sum + calculateLoad(s.duration, s.rpeGroup), 0
  );
  
  const chronicLoad = chronicSessions.reduce(
    (sum, s) => sum + calculateLoad(s.duration, s.rpeGroup), 0
  ) / 4;
  
  return chronicLoad > 0 ? Number((acuteLoad / chronicLoad).toFixed(2)) : 0;
}

export function getRatioStatus(ratio: number): 'green' | 'yellow' | 'red' {
  if (ratio >= 0.8 && ratio <= 1.3) return 'green';
  if (ratio > 1.3 && ratio <= 1.5) return 'yellow';
  return 'red';
}

export const RPE_LABELS: Record<number, string> = {
  1: 'Muy fácil',
  2: 'Fácil',
  3: 'Moderado bajo',
  4: 'Moderado',
  5: 'Algo difícil',
  6: 'Difícil',
  7: 'Muy difícil',
  8: 'Extremadamente difícil',
  9: 'Máximo',
  10: 'Máximo absoluto',
};
