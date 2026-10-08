import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Frown, Meh, Pause, Play, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/play/ProgressRing';
import type { DaySession, ExerciseBlock } from '@/hooks/useTrainingPlan';
import { cn } from '@/lib/utils';

const PHASE_LABEL: Record<ExerciseBlock['phase'], string> = {
  warmup: 'Entrada en calor',
  main: 'Parte principal',
  cooldown: 'Vuelta a la calma',
};

/** "5 min" → 300; sin minutos → null (ejercicio por series). */
const toSeconds = (d?: string) => {
  const m = d?.match(/(\d+)/);
  return m ? Number(m[1]) * 60 : null;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const RPE_LABEL = (n: number) => (n <= 2 ? 'Muy suave' : n <= 4 ? 'Suave' : n <= 6 ? 'Normal' : n <= 8 ? 'Duro' : 'Al máximo');
const RPE_FACE = (n: number) => (n <= 3 ? Smile : n <= 7 ? Meh : Frown);

interface Props {
  session: DaySession;
  saving?: boolean;
  onExit: () => void;
  onFinish: (rpe: number) => void;
}

export const GuidedSession = ({ session, saving, onExit, onFinish }: Props) => {
  const items = session.exercises;
  const [index, setIndex] = useState(0);
  const [rpe, setRpe] = useState<number | null>(null);
  const finished = index >= items.length;

  const current = items[index];
  const total = useMemo(() => toSeconds(current?.duration), [current]);
  const [left, setLeft] = useState(total ?? 0);
  const [running, setRunning] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval>>();

  // Cada ejercicio arranca con su propio tiempo y en pausa.
  useEffect(() => { setLeft(total ?? 0); setRunning(false); }, [index, total]);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(tick.current);
  }, [running]);

  useEffect(() => { if (running && left === 0) setRunning(false); }, [running, left]);

  const next = useCallback(() => setIndex((i) => i + 1), []);
  const sessionPct = Math.round((Math.min(index, items.length) / Math.max(items.length, 1)) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onExit} aria-label="Salir de la sesión" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X className="h-5 w-5" />
        </button>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
          role="progressbar" aria-valuenow={sessionPct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de la sesión"
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${sessionPct}%` }} />
        </div>
        <span className="w-10 text-right text-xs font-semibold tabular-nums text-muted-foreground">{Math.min(index + 1, items.length)}/{items.length}</span>
      </div>

      {!finished ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{PHASE_LABEL[current.phase]}</span>
            <h1 className="font-heading text-2xl font-bold">{current.name}</h1>
            {total ? (
              <>
                <ProgressRing value={total ? ((total - left) / total) * 100 : 0} size={180} stroke={10} label={<span className="text-4xl font-bold tabular-nums">{fmt(left)}</span>} />
                <Button size="lg" variant={running ? 'outline' : 'default'} className="gap-2" onClick={() => setRunning((r) => !r)} disabled={left === 0}>
                  {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {running ? 'Pausar' : left === total ? 'Empezar' : 'Seguir'}
                </Button>
              </>
            ) : (
              <p className="font-heading text-5xl font-bold tabular-nums text-primary">{current.sets ?? '—'}</p>
            )}
            {current.notes && <p className="max-w-xs text-sm text-muted-foreground">{current.notes}</p>}
          </div>
          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button size="lg" className="w-full gap-2" onClick={next}>
              {index === items.length - 1 ? 'Terminar' : 'Siguiente'}<ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <h1 className="font-heading text-2xl font-bold">¿Cómo te sentiste?</h1>
            <p className="text-sm text-muted-foreground">1 es muy suave y 10 es lo más duro que hiciste.</p>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Esfuerzo percibido">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rpe === n}
                  onClick={() => setRpe(n)}
                  className={cn(
                    'h-12 w-12 rounded-xl border text-base font-bold tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    rpe === n ? 'border-primary bg-primary text-primary-foreground' : 'border-border/60 bg-card hover:bg-muted',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex h-14 items-center gap-2 text-lg font-semibold" aria-live="polite">
              {rpe !== null && (() => { const Face = RPE_FACE(rpe); return <><Face className="h-7 w-7 text-primary" aria-hidden="true" />{RPE_LABEL(rpe)}</>; })()}
            </div>
          </div>
          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button size="lg" className="w-full" disabled={rpe === null || saving} onClick={() => rpe !== null && onFinish(rpe)}>
              {saving ? 'Guardando…' : 'Guardar y sumar XP'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
