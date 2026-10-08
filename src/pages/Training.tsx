import { Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Moon, Play, Flame, Dumbbell, Wind, type LucideIcon } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { useTrainingPlan, type DaySession, type ExerciseBlock } from '@/hooks/useTrainingPlan';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { staggerProps, useEnterOnce } from '@/hooks/useEnterOnce';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { IconBadge } from '@/components/play/IconBadge';
import { ProgressRing } from '@/components/play/ProgressRing';
import { PreviewBadge } from '@/components/play/PreviewBadge';
import { SectionHeader } from '@/components/play/SectionHeader';
import {
  StageProgressBar, WeeklyMicrocycle, LoadRecoveryCard, ChallengeCard, DrillCarousel, CoachNoteCard,
} from '@/components/training';
import { CHALLENGES, COACH_NOTE_PREVIEW } from '@/data/training-preview';
import { SESSION_TYPE_LABELS, type SessionType } from '@/types/training';
import type { Tone } from '@/lib/icons';

const DiagnosticRadar = lazy(() => import('@/components/training/DiagnosticRadar').then((m) => ({ default: m.DiagnosticRadar })));

const PHASES: { phase: ExerciseBlock['phase']; label: string; icon: LucideIcon; tone: Tone }[] = [
  { phase: 'warmup', label: 'Entrada en calor', icon: Flame, tone: 'warning' },
  { phase: 'main', label: 'Parte principal', icon: Dumbbell, tone: 'orange' },
  { phase: 'cooldown', label: 'Vuelta a la calma', icon: Wind, tone: 'zahia' },
];

const DaySummary = ({ session, onStart }: { session: DaySession; onStart?: () => void }) => {
  if (session.type === 'rest') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
        <IconBadge icon={Moon} tone="slate" />
        <p className="text-sm font-medium">Día de descanso. Dormí bien y tomá agua.</p>
      </div>
    );
  }
  const done = session.status === 'completed';
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{SESSION_TYPE_LABELS[session.type as SessionType]}</p>
          <h3 className="truncate font-heading text-lg font-bold">{session.title}</h3>
        </div>
        <div className="shrink-0 text-right text-xs text-muted-foreground">
          <p className="flex items-center justify-end gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{session.duration} min</p>
          <p>Esfuerzo {done && session.rpeLogged ? session.rpeLogged : session.targetRPE}/10</p>
        </div>
      </div>
      <ul className="space-y-2">
        {PHASES.map(({ phase, label, icon, tone }) => {
          const n = session.exercises.filter((e) => e.phase === phase).length;
          if (!n) return null;
          return (
            <li key={phase} className="flex items-center gap-3">
              <IconBadge icon={icon} tone={tone} size="sm" />
              <span className="flex-1 text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{n} {n === 1 ? 'ejercicio' : 'ejercicios'}</span>
            </li>
          );
        })}
      </ul>
      {onStart && session.exercises.length > 0 && !done && (
        <Button className="w-full gap-2" onClick={onStart}><Play className="h-4 w-4" aria-hidden="true" />Empezar sesión</Button>
      )}
      {done && <p className="text-sm font-medium text-success">Sesión hecha. ¡Bien ahí!</p>}
    </div>
  );
};

const useCoachNote = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['coach-note', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: note } = await supabase
        .from('coach_notes').select('content, created_at, coach_id')
        .eq('player_id', user!.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!note) return null;
      const { data: coach } = await supabase.from('profiles').select('full_name').eq('id', note.coach_id).maybeSingle();
      return { coach: coach?.full_name ?? 'Tu entrenador', text: note.content as string, date: new Date(note.created_at) };
    },
  });
};

const Training = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plan, isLoading } = useTrainingPlan();
  const enter = useEnterOnce('training');
  const coachNote = useCoachNote();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [planOpen, setPlanOpen] = useState('');

  const sportQuery = useQuery({
    queryKey: ['profile-sport', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
    queryFn: async () => (await supabase.from('profiles').select('sport').eq('id', user!.id).maybeSingle()).data?.sport ?? null,
  });
  const userSport = sportQuery.data ?? null;

  if (isLoading || sportQuery.isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl"><PageSkeleton message="Preparando tu sesión…" /></div>
      </AppLayout>
    );
  }

  const jsDay = new Date().getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
  const activeDay = selectedDay ?? todayIndex;
  const selected = plan?.weekSessions.find((s) => s.dayIndex === activeDay);
  const isToday = activeDay === todayIndex;
  const isTenis = userSport?.toLowerCase() === 'tenis' || userSport?.toLowerCase() === 'tennis';
  const note = coachNote.data;

  return (
    <AppLayout>
      <div data-page-ready="" className="mx-auto max-w-3xl space-y-6 pb-8">
        {plan ? (
          <header className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-heading text-xl font-bold md:text-2xl">Entrenar</h1>
              <p className="text-sm text-muted-foreground">
                {plan.sport} · {plan.category} · {plan.cycleName}, semana {plan.currentWeek} de {plan.totalWeeks}
              </p>
              {plan.objective.main && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{plan.objective.main}</p>}
            </div>
            <ProgressRing value={plan.objective.progress} size={64} />
          </header>
        ) : (
          <header>
            <h1 className="font-heading text-xl font-bold md:text-2xl">Entrenar</h1>
            <p className="text-sm text-muted-foreground">Acá vas a ver tu plan, tus desafíos y tus ejercicios.</p>
          </header>
        )}

        {plan && selected && (
          <section aria-labelledby="hoy">
            <SectionHeader title={isToday ? 'Sesión de hoy' : `Sesión del ${selected.dayLabel.toLowerCase()}`} />
            <span id="hoy" className="sr-only">Sesión</span>
            <DaySummary session={selected} onStart={isToday && selected.status === 'today' ? () => navigate('/training/sesion') : undefined} />
          </section>
        )}

        {!plan && (
          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4">
            <IconBadge icon={isTenis ? Clock : Dumbbell} />
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="font-heading text-base font-semibold">
                {isTenis ? 'Tu plan se está preparando' : userSport ? `Próximamente para ${userSport}` : 'Completá tu perfil'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isTenis
                  ? 'Mientras tanto, registrá tu día para que lo ajustemos a vos.'
                  : userSport
                    ? 'Estamos armando contenido para tu deporte. Te avisamos cuando esté listo.'
                    : 'Necesitamos saber tu deporte para armar tu plan.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate('/dashboard')}>Volver al inicio</Button>
                {!userSport && <Button size="sm" onClick={() => navigate('/onboarding')}>Completar perfil</Button>}
              </div>
            </div>
          </div>
        )}

        {plan && plan.weekSessions.length > 0 && (
          <section>
            <SectionHeader title="Tu semana de entrenamiento" />
            <WeeklyMicrocycle sessions={plan.weekSessions} selectedDay={activeDay} onSelectDay={setSelectedDay} />
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between"><h2 className="font-heading text-base font-semibold">Desafíos de la semana</h2><PreviewBadge /></div>
          <div className="space-y-2">{CHALLENGES.map((c, i) => <div key={c.id} {...staggerProps(enter, i)}><ChallengeCard challenge={c} /></div>)}</div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between"><h2 className="font-heading text-base font-semibold">Biblioteca de ejercicios</h2><PreviewBadge /></div>
          <DrillCarousel />
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">Nota de tu entrenador</h2>
            {!note && <PreviewBadge />}
          </div>
          {note ? (
            <CoachNoteCard coach={note.coach} text={note.text} date={note.date} />
          ) : (
            <CoachNoteCard coach={COACH_NOTE_PREVIEW.coach} text={COACH_NOTE_PREVIEW.text} date={new Date(Date.now() - COACH_NOTE_PREVIEW.daysAgo * 86_400_000)} />
          )}
        </section>

        {plan && (
          <section>
            <SectionHeader title="Carga y recuperación" />
            <LoadRecoveryCard data={plan.loadRecovery} />
          </section>
        )}

        {plan && (
          <Accordion type="single" collapsible value={planOpen} onValueChange={setPlanOpen} className="rounded-2xl border border-border/60 bg-card px-4">
            <AccordionItem value="plan" className="border-0">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">Cómo se arma tu plan</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <StageProgressBar currentStage={plan.currentStage} />
                {planOpen === 'plan' && (
                  <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
                    <DiagnosticRadar diagnostic={plan.diagnostic} />
                  </Suspense>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </AppLayout>
  );
};

export default Training;
