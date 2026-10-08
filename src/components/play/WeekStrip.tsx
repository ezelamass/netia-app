import { memo, useRef, type PointerEvent } from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEventIcon, TONE_DOT } from '@/lib/icons';
import type { EventType } from '@/hooks/useCalendarEvents';

interface WeekStripProps {
  weekStart: Date;
  selected: Date;
  onSelect?: (d: Date) => void;
  /** clave yyyy-MM-dd → tipos de evento de ese día */
  dotsByDay: Record<string, EventType[]>;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const WeekStrip = memo(({ weekStart, selected, onSelect, dotsByDay, onPrevWeek, onNextWeek, readOnly, className }: WeekStripProps) => {
  const startX = useRef<number | null>(null);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const down = (e: PointerEvent) => { startX.current = e.clientX; };
  const up = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) onNextWeek?.(); else onPrevWeek?.();
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onPrevWeek && (
        <button type="button" onClick={onPrevWeek} aria-label="Semana anterior"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex">
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        className="grid flex-1 grid-cols-7 gap-1 touch-pan-y"
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => { startX.current = null; }}
      >
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const isSel = isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          const dots = (dotsByDay[key] ?? []).slice(0, 3);
          const content = (
            <>
              <span className="text-[11px] font-medium uppercase">{format(d, 'EEEEE', { locale: es })}</span>
              <span className="text-base font-bold tabular-nums">{format(d, 'd')}</span>
              <span className="flex h-1.5 items-center gap-0.5" aria-hidden="true">
                {dots.map((t, i) => (
                  <span key={i} className={cn('h-1.5 w-1.5 rounded-full', isSel ? 'bg-primary-foreground' : TONE_DOT[getEventIcon(t).tone])} />
                ))}
              </span>
            </>
          );
          const cls = cn(
            'flex h-16 flex-col items-center justify-center gap-0.5 rounded-xl border text-center transition-colors duration-150',
            isSel ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent hover:bg-muted',
            !isSel && isToday && 'border-primary/40 bg-primary-soft text-primary',
          );
          return readOnly || !onSelect ? (
            <div key={key} className={cls} aria-label={format(d, "EEEE d 'de' MMMM", { locale: es })}>{content}</div>
          ) : (
            <button key={key} type="button" onClick={() => onSelect(d)} aria-pressed={isSel}
              aria-label={format(d, "EEEE d 'de' MMMM", { locale: es })}
              className={cn(cls, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
              {content}
            </button>
          );
        })}
      </div>
      {onNextWeek && (
        <button type="button" onClick={onNextWeek} aria-label="Semana siguiente"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex">
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
WeekStrip.displayName = 'WeekStrip';
