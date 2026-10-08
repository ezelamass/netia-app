import { memo } from 'react';
import { Check, MapPin, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEventIcon } from '@/lib/icons';
import type { CalendarEvent } from '@/hooks/useCalendarEvents';
import { IconBadge } from './IconBadge';

interface AgendaItemProps {
  event: CalendarEvent & { location?: string };
  source?: 'mio' | 'club' | 'plan';
  onToggleComplete?: (id: string) => void;
  onClick?: (event: CalendarEvent) => void;
}

export const AgendaItem = memo(({ event, source = 'mio', onToggleComplete, onClick }: AgendaItemProps) => {
  const { icon, tone } = getEventIcon(event.type);
  const hour = event.startTime ? `${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}` : 'Todo el día';
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3', event.isCompleted && 'opacity-60')}>
      <IconBadge icon={icon} tone={tone} />
      <button
        type="button"
        onClick={() => onClick?.(event)}
        disabled={!onClick}
        className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p className="text-xs tabular-nums text-muted-foreground">{hour}</p>
        <p className={cn('truncate text-sm font-semibold', event.isCompleted && 'line-through')}>{event.title}</p>
        {event.location && (
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />{event.location}
          </p>
        )}
      </button>
      {source === 'club' && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-xs font-semibold text-info">
          <Shield className="h-3 w-3" aria-hidden="true" />Club
        </span>
      )}
      {source === 'mio' && onToggleComplete && (
        <button
          type="button"
          onClick={() => onToggleComplete(event.id)}
          aria-label={event.isCompleted ? 'Marcar como pendiente' : 'Marcar como hecho'}
          aria-pressed={!!event.isCompleted}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            event.isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-transparent hover:text-muted-foreground',
          )}
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
AgendaItem.displayName = 'AgendaItem';
