import { memo, useMemo } from 'react';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getEventIcon, TONE_DOT } from '@/lib/icons';
import type { EventType } from '@/hooks/useCalendarEvents';

interface MonthViewProps {
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  dotsByDay: Record<string, EventType[]>;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const MonthView = memo(({ month, selected, onSelect, dotsByDay }: MonthViewProps) => {
  const days = useMemo(
    () => eachDayOfInterval({
      start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
    }),
    [month],
  );
  const today = new Date();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-2 sm:p-3">
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="py-1 text-center text-xs font-medium text-muted-foreground">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const isSel = isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          const dots = (dotsByDay[key] ?? []).slice(0, 3);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(d)}
              aria-pressed={isSel}
              aria-label={format(d, "EEEE d 'de' MMMM", { locale: es })}
              className={cn(
                'flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border text-sm font-medium tabular-nums transition-[color,background-color,border-color,transform] duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSel ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent hover:bg-muted',
                !isSel && isToday && 'border-primary/40 bg-primary-soft text-primary',
                !isSameMonth(d, month) && !isSel && 'text-muted-foreground/50',
              )}
            >
              {format(d, 'd')}
              <span className="flex h-1.5 items-center gap-0.5" aria-hidden="true">
                {dots.map((t, i) => (
                  <span key={i} className={cn('h-1.5 w-1.5 rounded-full', isSel ? 'bg-primary-foreground' : TONE_DOT[getEventIcon(t).tone])} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
MonthView.displayName = 'MonthView';
