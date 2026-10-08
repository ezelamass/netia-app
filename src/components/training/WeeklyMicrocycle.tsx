import { memo } from 'react';
import { Check, Dumbbell, Moon, Swords, Target, Zap, Heart, type LucideIcon } from 'lucide-react';
import type { DaySession } from '@/hooks/useTrainingPlan';
import { SESSION_TYPE_LABELS, type SessionType } from '@/types/training';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<SessionType | 'rest', LucideIcon> = {
  technical: Target,
  physical: Dumbbell,
  tactical: Zap,
  match: Swords,
  recovery: Heart,
  rest: Moon,
};

interface Props {
  sessions: DaySession[];
  selectedDay: number | null;
  onSelectDay: (dayIndex: number) => void;
}

export const WeeklyMicrocycle = memo(({ sessions, selectedDay, onSelectDay }: Props) => (
  <div className="grid grid-cols-7 gap-1">
    {sessions.map((s) => {
      const rest = s.type === 'rest';
      const done = s.status === 'completed' && !rest;
      const today = s.status === 'today';
      const sel = selectedDay === s.dayIndex;
      const Icon = done ? Check : TYPE_ICON[s.type];
      const label = rest ? 'Descanso' : SESSION_TYPE_LABELS[s.type as SessionType];
      return (
        <button
          key={s.dayIndex}
          type="button"
          onClick={() => onSelectDay(s.dayIndex)}
          aria-pressed={sel}
          aria-label={`${s.dayLabel}: ${label}${done ? ', hecho' : today ? ', hoy' : ''}`}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl border px-0.5 py-2 transition-[color,background-color,border-color,transform] duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            sel ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent hover:bg-muted',
            !sel && today && 'border-primary/40 bg-primary-soft text-primary',
          )}
        >
          <span className="text-xs font-medium uppercase">{s.dayLabel}</span>
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full',
              sel ? 'bg-primary-foreground/20' : done ? 'bg-success-soft text-success' : rest ? 'bg-slate-soft text-muted-foreground' : 'bg-primary-soft text-primary',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="max-w-full truncate text-xs font-medium">{label}</span>
        </button>
      );
    })}
  </div>
));
WeeklyMicrocycle.displayName = 'WeeklyMicrocycle';
