import { useCallback, useMemo, useState } from 'react';
import { addDays, addMonths, addWeeks, format, isSameDay, isSameMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarPlus, ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { AgendaItem } from '@/components/play/AgendaItem';
import { IconBadge } from '@/components/play/IconBadge';
import { StatPill } from '@/components/play/StatPill';
import { WeekStrip } from '@/components/play/WeekStrip';
import { MonthView } from '@/components/calendar/MonthView';
import { AddEventModal } from '@/components/calendar/AddEventModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Segmented } from '@/components/ui/segmented';
import { useDelayedFlag } from '@/hooks/useDelayedFlag';
import { staggerProps, useEnterOnce } from '@/hooks/useEnterOnce';
import { useCalendarEvents, type CalendarEvent, type EventType } from '@/hooks/useCalendarEvents';
import { getEventIcon, ICONS } from '@/lib/icons';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'training' | 'nutrition' | 'mental' | 'club';
type View = 'week' | 'month';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'training', label: 'Entrenos' },
  { id: 'nutrition', label: 'Nutrición' },
  { id: 'mental', label: 'Mental' },
  { id: 'club', label: 'Club' },
];

const matches = (e: CalendarEvent, f: Filter) => {
  if (f === 'all') return true;
  if (f === 'club') return e.source === 'club';
  if (f === 'training') return e.type === 'training' || e.type === 'tournament';
  return e.type === f;
};

const byTime = (a: CalendarEvent, b: CalendarEvent) => (a.startTime ?? '99').localeCompare(b.startTime ?? '99');

const Calendar = () => {
  const [view, setView] = useState<View>('week');
  const [selected, setSelected] = useState(() => new Date());
  const [filter, setFilter] = useState<Filter>('all');
  const { user } = useAuth();
  const doneKey = `netia_cal_done_${user?.id ?? 'anon'}`;
  const [done, setDone] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(doneKey) ?? '[]') as string[]); } catch { return new Set(); }
  });
  const [adding, setAdding] = useState(false);

  const { events, isLoading, addEvent } = useCalendarEvents();
  const showSkeleton = useDelayedFlag(isLoading);
  const enter = useEnterOnce('calendar-agenda');

  const weekStart = useMemo(() => startOfWeek(selected, { weekStartsOn: 1 }), [selected]);

  const visible = useMemo(
    () => events.filter((e) => matches(e, filter)).map((e) => (done.has(e.id) ? { ...e, isCompleted: true } : e)),
    [events, filter, done],
  );

  const dotsByDay = useMemo(() => {
    const m: Record<string, EventType[]> = {};
    for (const e of visible) (m[format(e.date, 'yyyy-MM-dd')] ??= []).push(e.type);
    return m;
  }, [visible]);

  const dayEvents = useMemo(() => visible.filter((e) => isSameDay(e.date, selected)).sort(byTime), [visible, selected]);

  const weekTrainings = useMemo(() => {
    const list = events.filter((e) => e.type === 'training' && isSameDay(startOfWeek(e.date, { weekStartsOn: 1 }), weekStart));
    return { total: list.length, done: list.filter((e) => done.has(e.id)).length };
  }, [events, weekStart, done]);

  const next = useMemo(() => {
    const now = new Date();
    return events.find((e) => e.date >= now || isSameDay(e.date, now)) ?? null;
  }, [events]);

  const shift = (dir: 1 | -1) => setSelected((d) => (view === 'week' ? (dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1)) : (dir > 0 ? addMonths(d, 1) : subMonths(d, 1))));

  const toggleDone = useCallback((id: string) => setDone((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    try { localStorage.setItem(doneKey, JSON.stringify([...n])); } catch { /* sin storage */ }
    return n;
  }), [doneKey]);

  const title = view === 'month'
    ? format(selected, 'MMMM yyyy', { locale: es })
    : isSameMonth(weekStart, addDays(weekStart, 6))
      ? `${format(weekStart, 'd')} – ${format(addDays(weekStart, 6), 'd MMM', { locale: es })}`
      : `${format(weekStart, 'd MMM', { locale: es })} – ${format(addDays(weekStart, 6), 'd MMM', { locale: es })}`;

  const nextIcon = next ? getEventIcon(next.type) : ICONS.training;

  return (
    <AppLayout>
      <div data-page-ready={isLoading ? undefined : ''} className="mx-auto max-w-3xl space-y-4 pb-20">
        <header className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => shift(-1)} aria-label={view === 'week' ? 'Semana anterior' : 'Mes anterior'}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="truncate font-heading text-lg font-bold first-letter:uppercase md:text-xl" aria-live="polite">{title}</h1>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => shift(1)} aria-label={view === 'week' ? 'Semana siguiente' : 'Mes siguiente'}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={() => setSelected(new Date())}>Hoy</Button>
            <Segmented<View>
              aria-label="Vista"
              value={view}
              onChange={setView}
              options={[{ value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }]}
            />
          </div>
        </header>

        {view === 'week' ? (
          <WeekStrip
            weekStart={weekStart}
            selected={selected}
            onSelect={setSelected}
            dotsByDay={dotsByDay}
            onPrevWeek={() => shift(-1)}
            onNextWeek={() => shift(1)}
          />
        ) : (
          <MonthView month={selected} selected={selected} onSelect={setSelected} dotsByDay={dotsByDay} />
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filtrar eventos">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-[color,background-color,border-color,transform] duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                filter === f.id ? 'border-primary bg-primary-soft text-primary' : 'border-border/60 bg-card text-muted-foreground hover:bg-muted',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <section aria-labelledby="agenda-title" className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 id="agenda-title" className="font-heading text-base font-semibold first-letter:uppercase">
              {isSameDay(selected, new Date()) ? 'Hoy' : format(selected, "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <div className="flex gap-2">
              <StatPill icon={Dumbbell} value={`${weekTrainings.done}/${weekTrainings.total}`} label="Entrenos hechos esta semana" />
            </div>
          </div>

          {isLoading ? (
            showSkeleton ? <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-[62px] rounded-xl" />)}</div> : null
          ) : dayEvents.length ? (
            <div className="space-y-2">
              {dayEvents.map((e, i) => (
                <div key={e.id} {...staggerProps(enter, i)}>
                  <AgendaItem
                    event={e}
                    source={e.source === 'club' ? 'club' : 'mio'}
                    onToggleComplete={toggleDone}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/80 px-4 py-8 text-center">
              <IconBadge icon={CalendarPlus} />
              <p className="text-sm font-medium">{filter === 'all' ? 'Nada planeado para este día' : 'Sin eventos de este tipo'}</p>
              <Button size="sm" variant="outline" onClick={() => setAdding(true)}>Agregar evento</Button>
            </div>
          )}
        </section>

        {next && !dayEvents.some((e) => e.id === next.id) && (
          <button
            type="button"
            onClick={() => setSelected(next.date)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 text-left transition-[color,background-color,border-color,transform] duration-fast active:scale-[.97] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IconBadge icon={nextIcon.icon} tone={nextIcon.tone} />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">Lo que viene</span>
              <span className="block truncate text-sm font-semibold">{next.title}</span>
              <span className="block text-xs text-muted-foreground first-letter:uppercase">
                {format(next.date, "EEEE d 'de' MMMM", { locale: es })}{next.startTime ? ` · ${next.startTime}` : ''}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        )}
      </div>

      <Button
        size="icon"
        onClick={() => setAdding(true)}
        aria-label="Agregar evento"
        className="fixed bottom-24 right-4 z-30 h-12 w-12 rounded-full shadow-lg lg:bottom-6 lg:right-6"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddEventModal open={adding} onClose={() => setAdding(false)} onSave={(e) => void addEvent(e)} initialDate={selected} />
    </AppLayout>
  );
};

export default Calendar;
