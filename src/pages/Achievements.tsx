import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClipboardList } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useGamification } from '@/hooks/useGamification';
import { calculateStatus, INDICATORS } from '@/hooks/useWellnessStatus';
import { staggerProps, useEnterOnce } from '@/hooks/useEnterOnce';
import { Sparkline } from '@/components/dashboard/Sparkline';
import { BadgeCard } from '@/components/gamification';
import { EmptyPanel } from '@/components/domain/EmptyPanel';
import { IconBadge } from '@/components/play/IconBadge';
import { StatPill } from '@/components/play/StatPill';
import { CountUp } from '@/components/play/CountUp';
import { SectionHeader } from '@/components/play/SectionHeader';
import { ProgressRing } from '@/components/play/ProgressRing';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { ICONS, type IconKey } from '@/lib/icons';
import { LEVEL_CONFIG, type PlayerLevel } from '@/types/gamification';

const NEXT_LEVEL: Record<PlayerLevel, PlayerLevel | null> = { bronze: 'silver', silver: 'gold', gold: 'elite', elite: null };

const BADGE_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'streak', label: 'Racha' },
  { value: 'xp', label: 'XP' },
  { value: 'wellness', label: 'Bienestar' },
  { value: 'training', label: 'Entreno' },
] as const;

const STATUS_DOT = {
  green: 'bg-success',
  yellow: 'bg-warning',
  red: 'bg-danger',
  none: 'bg-muted',
} as const;

const Achievements = () => {
  const navigate = useNavigate();
  const { logs, getStreak, getLogsForDays, isLoading: logsLoading } = useDailyLog();
  const {
    currentLevel, currentXP, nextLevelXP, levelProgress,
    badgeProgress, unlockedCount, totalBadges, isLoading: gamiLoading,
  } = useGamification();
  const enter = useEnterOnce('achievements');
  const st = (i: number) => staggerProps(enter, i);

  const streak = getStreak();
  const recentLogs = getLogsForDays(28);

  const { historicalData, weeklyAverages } = useMemo(() => {
    const last7 = getLogsForDays(7);
    const avg = (pick: (l: (typeof last7)[number]) => number) =>
      last7.length ? last7.reduce((sum, l) => sum + pick(l), 0) / last7.length : 0;
    return {
      historicalData: {
        sleep: last7.map(l => l.sleep),
        hydration: last7.map(l => l.hydration),
        energy: last7.map(l => l.energy),
        pain: last7.map(l => 10 - l.pain),
      },
      weeklyAverages: {
        sleep: avg(l => l.sleep),
        hydration: avg(l => l.hydration),
        energy: avg(l => l.energy),
        pain: avg(l => l.pain),
      },
    };
  }, [getLogsForDays]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 28 }, (_, i) => {
      const date = subDays(today, 27 - i);
      const log = logs.find(l => format(l.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
      return { date, status: log ? calculateStatus(log) : ('none' as const) };
    });
  }, [logs]);

  const unlockedKey = badgeProgress.filter(b => b.isUnlocked).map(b => b.id).join(',');

  // Logro desbloqueado: pop-in con spring + confeti chico (importado recién al disparar).
  // La primera visita no celebra lo que ya estaba: solo lo que se desbloqueó desde la última vez.
  const [justUnlocked, setJustUnlocked] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => {
    if (badgeProgress.length === 0) return; // todavía cargando: no guardar un estado vacío
    try {
      const KEY = 'netia_seen_badges';
      const raw = localStorage.getItem(KEY);
      const now = unlockedKey ? unlockedKey.split(',') : [];
      if (raw !== null) {
        const seen = new Set<string>(JSON.parse(raw));
        const fresh = now.filter(id => !seen.has(id));
        if (fresh.length) {
          setJustUnlocked(new Set(fresh));
          void import('canvas-confetti').then(m => m.default({ particleCount: 40, spread: 70, origin: { y: 0.35 }, scalar: 0.8, disableForReducedMotion: true }));
        }
      }
      localStorage.setItem(KEY, JSON.stringify(now));
    } catch { /* sin storage */ }
  }, [unlockedKey, badgeProgress.length]);

  if ((logsLoading || gamiLoading) && badgeProgress.length === 0) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl"><PageSkeleton message="Cargando tus logros…" /></div>
      </AppLayout>
    );
  }

  const nextLevel = NEXT_LEVEL[currentLevel];
  const pct = Math.max(0, Math.min(100, Math.round(levelProgress)));
  const hasLogs = logs.length > 0;
  const badgesFor = (tab: string) =>
    (tab === 'all' ? badgeProgress : badgeProgress.filter(b => b.category === tab))
      .slice()
      .sort((a, b) => (b.isUnlocked ? 1 : 0) - (a.isUnlocked ? 1 : 0));

  return (
    <AppLayout>
      <div data-page-ready="" className="mx-auto max-w-3xl space-y-6 pb-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-bold md:text-2xl">Logros</h1>
            <p className="text-sm text-muted-foreground">Tu nivel, tu racha y las insignias que vas sumando.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
            {streak > 0 && (
              <StatPill
                icon={ICONS.streak.icon}
                value={<><CountUp value={streak} id="ach-streak" /> {streak === 1 ? 'día' : 'días'}</>}
                label="Racha"
                tone="orange"
              />
            )}
            <StatPill icon={ICONS.xp.icon} value={<><CountUp value={currentXP} id="ach-xp" /> XP</>} label="XP total" tone="orange" />
          </div>
        </header>

        <section {...st(0)} aria-label="Tu nivel">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <div className="flex items-center gap-4">
              <ProgressRing value={pct} size={72} stroke={7} label={<span aria-hidden="true" className="text-xl">{LEVEL_CONFIG[currentLevel].emoji}</span>} />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg font-bold">Nivel {LEVEL_CONFIG[currentLevel].label}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {nextLevel
                    ? `Faltan ${Math.max(0, nextLevelXP - currentXP).toLocaleString('es-AR')} XP para ${LEVEL_CONFIG[nextLevel].label}`
                    : 'Llegaste al nivel máximo. ¡Sos de elite!'}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'XP total', value: currentXP, id: 'ach-xp-total' },
                { label: 'Días de racha', value: streak, id: 'ach-streak-total' },
                { label: 'Insignias', value: unlockedCount, id: 'ach-badges-total', suffix: `/${totalBadges}` },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-muted/50 px-2 py-3">
                  <dd className="font-heading text-xl font-bold tabular-nums"><CountUp value={s.value} id={s.id} />{s.suffix}</dd>
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section {...st(1)}>
          <SectionHeader title={`Insignias · ${unlockedCount} de ${totalBadges}`} />
          <Tabs defaultValue="all">
            <TabsList className="mb-3 h-auto w-full justify-start overflow-x-auto">
              {BADGE_TABS.map(t => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
            </TabsList>
            {BADGE_TABS.map(t => (
              <TabsContent key={t.value} value={t.value} className="mt-0">
                <ul className="space-y-2">
                  {badgesFor(t.value).map((badge, i) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      celebrate={justUnlocked.has(badge.id)}
                      className="animate-fade-up"
                      style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}
                    />
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {!hasLogs && (
          <EmptyPanel
            icon={ClipboardList}
            title="Todavía no registraste tu día"
            description="Registrá cómo dormiste, tomaste agua y te sentís para ver tu actividad y tus promedios acá."
            actionLabel="Ir al inicio"
            onAction={() => navigate('/dashboard')}
          />
        )}

        {hasLogs && (
          <>
            <section {...st(2)}>
              <SectionHeader title="Actividad · últimos 28 días" />
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
                <div className="grid grid-cols-7 gap-1.5">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <div key={i} className="mb-1 text-center text-xs text-muted-foreground">{day}</div>
                  ))}
                  {Array.from({ length: (heatmapData[0].date.getDay() + 6) % 7 }, (_, i) => <div key={`pad-${i}`} aria-hidden="true" />)}
                  {heatmapData.map((day, i) => (
                    <div
                      key={i}
                      className={cn('aspect-square rounded-md animate-pop-in', STATUS_DOT[day.status])}
                      style={{ animationDelay: `${Math.min(i, 27) * 12}ms` }}
                      title={format(day.date, "d 'de' MMM", { locale: es })}
                    />
                  ))}
                </div>
                <ul className="mt-3 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {([['none', 'Sin datos'], ['green', 'Bien'], ['yellow', 'Atención'], ['red', 'Alerta']] as const).map(([k, label]) => (
                    <li key={k} className="flex items-center gap-1"><span className={cn('h-3 w-3 rounded-sm', STATUS_DOT[k])} />{label}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section {...st(3)}>
              <SectionHeader title="Promedios de la semana" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {INDICATORS.map(indicator => {
                  const key = indicator.key as keyof typeof weeklyAverages;
                  const avg = weeklyAverages[key];
                  const icon = ICONS[indicator.key as IconKey];
                  const good =
                    (key === 'sleep' && avg >= 7) || (key === 'hydration' && avg >= 1.5) ||
                    (key === 'energy' && avg >= 4) || (key === 'pain' && avg <= 2);
                  return (
                    <div key={indicator.key} className="rounded-2xl border border-border/60 bg-card p-3 shadow-card">
                      <div className="mb-2 flex items-center gap-2">
                        <IconBadge icon={icon.icon} tone={icon.tone} size="sm" />
                        <span className="text-sm font-medium">{indicator.label}</span>
                      </div>
                      <p className="mb-2 font-heading text-2xl font-bold tabular-nums">
                        {avg.toFixed(1)}
                        <span className="ml-0.5 text-sm font-normal text-muted-foreground">{indicator.unit}</span>
                      </p>
                      <Sparkline
                        data={historicalData[key]}
                        color={good ? 'hsl(var(--success))' : 'hsl(var(--warning))'}
                        width={80}
                        height={24}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <section {...st(4)}>
              <SectionHeader title="Historial reciente" />
              <ul className="max-h-72 space-y-1 overflow-y-auto rounded-2xl border border-border/60 bg-card p-2 shadow-card">
                {recentLogs.slice().reverse().slice(0, 14).map(log => (
                  <li key={log.id} className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-fast hover:bg-muted/50">
                    <span className={cn('h-3 w-3 shrink-0 rounded-full', STATUS_DOT[calculateStatus(log)])} aria-hidden="true" />
                    <span className="w-16 shrink-0 text-sm text-muted-foreground">{format(log.date, 'd MMM', { locale: es })}</span>
                    <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
                      <span className="flex items-center gap-1"><ICONS.sleep.icon className="h-3.5 w-3.5 text-roma" aria-hidden="true" />{log.sleep.toFixed(1)} h</span>
                      <span className="flex items-center gap-1"><ICONS.hydration.icon className="h-3.5 w-3.5 text-info" aria-hidden="true" />{log.hydration.toFixed(1)} L</span>
                      <span className="flex items-center gap-1"><ICONS.energy.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{log.energy}/5</span>
                      <span className="flex items-center gap-1"><ICONS.pain.icon className="h-3.5 w-3.5 text-warning" aria-hidden="true" />{log.pain}/10</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Achievements;
