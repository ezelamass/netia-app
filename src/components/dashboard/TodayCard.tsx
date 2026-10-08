import { Suspense, lazy, memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { useDailyLog } from '@/hooks/useDailyLog';
import { INDICATORS } from '@/hooks/useWellnessStatus';
import type { CalendarEvent } from '@/hooks/useCalendarEvents';
import { getEventIcon, ICONS, type IconKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
const DailyLogSheet = lazy(() => import('./DailyLogSheet').then((m) => ({ default: m.DailyLogSheet })));

const CHECKIN_ICON: Record<'sleep' | 'hydration' | 'energy' | 'pain', IconKey> = {
  sleep: 'sleep', hydration: 'hydration', energy: 'energy', pain: 'pain',
};

const STATUS_TEXT = { ok: 'text-[hsl(160_84%_20%)]', warning: 'text-[hsl(32_95%_26%)]', critical: 'text-[hsl(350_80%_32%)]', unknown: 'text-[hsl(16_30%_22%)]' } as const;

interface TodayCardProps {
  /** Eventos de hoy (propios + del club), ordenados */
  todayEvents: CalendarEvent[];
}

/** Próxima actividad que todavía no pasó; si ya pasaron todas, la última del día. */
const pickNext = (events: CalendarEvent[]): CalendarEvent | null => {
  if (!events.length) return null;
  const now = format(new Date(), 'HH:mm');
  return events.find((e) => !e.startTime || e.startTime >= now) ?? events[events.length - 1];
};

export const TodayCard = memo(({ todayEvents }: TodayCardProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMounted, setSheetMounted] = useState(false);
  const [step, setStep] = useState(0);
  const { todayLog, hasLoggedToday, addLog } = useDailyLog();

  const next = useMemo(() => pickNext(todayEvents.filter((e) => e.type !== 'rest' || todayEvents.length === 1)), [todayEvents]);
  const nextIcon = next ? getEventIcon(next.type) : null;
  const isTraining = next?.type === 'training';

  const open = (i: number) => { setStep(i); setSheetMounted(true); setSheetOpen(true); };

  return (
    <section
      aria-label="Hoy"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-orange to-[hsl(26_100%_66%)] p-4 text-[hsl(16_60%_10%)] shadow-card md:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[hsl(16_60%_16%)]">
            Hoy{next?.startTime ? ` · ${next.startTime}` : ''}
          </p>
          {next && nextIcon ? (
            <>
              <h2 className="mt-1 font-heading text-2xl font-bold leading-tight">{next.title}</h2>
              {next.location && (
                <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                  <MapPin className="h-4 w-4" aria-hidden="true" />{next.location}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="mt-1 font-heading text-2xl font-bold leading-tight">Hoy es día libre</h2>
              <p className="mt-1 text-sm font-medium">Descansá y contanos cómo estás.</p>
            </>
          )}
        </div>
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70">
          {nextIcon ? <nextIcon.icon className="h-5 w-5 text-primary" strokeWidth={2} /> : <ICONS.rest.icon className="h-5 w-5 text-primary" strokeWidth={2} />}
        </span>
      </div>

      <div className="mt-3">
        {next ? (
          <Link
            to={isTraining ? '/training' : '/calendar'}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-primary shadow-sm transition-colors duration-150 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isTraining ? 'Empezar entrenamiento' : 'Ver en calendario'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => open(0)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-primary shadow-sm transition-colors duration-150 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Registrar mi día
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-white/60 p-2">
        <ul className="grid grid-cols-4 gap-1">
          {INDICATORS.map((ind, i) => {
            const meta = ICONS[CHECKIN_ICON[ind.key]];
            const status = todayLog ? ind.getStatus(todayLog) : 'unknown';
            return (
              <li key={ind.key}>
                <button
                  type="button"
                  onClick={() => open(i)}
                  className="flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-colors duration-150 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`${ind.label}: ${todayLog ? ind.getValue(todayLog) : 'sin registrar'}. Tocá para cargar`}
                >
                  <meta.icon className="h-[18px] w-[18px] text-primary" strokeWidth={2} aria-hidden="true" />
                  <span className={cn('text-sm font-bold tabular-nums', STATUS_TEXT[status])}>
                    {todayLog ? ind.getValue(todayLog) : '—'}
                  </span>
                  <span className="text-[11px] font-medium text-[hsl(16_30%_22%)]">{ind.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {hasLoggedToday && (
          <p className="mt-1 flex items-center justify-center gap-1 pb-1 text-xs font-semibold text-[hsl(160_84%_20%)]">
            <Check className="h-4 w-4" aria-hidden="true" />Día registrado · +20 XP
          </p>
        )}
      </div>

      {sheetMounted && (
        <Suspense fallback={null}>
          <DailyLogSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onSave={(data) => addLog(data)}
            initialStep={step}
          />
        </Suspense>
      )}
    </section>
  );
});
TodayCard.displayName = 'TodayCard';

