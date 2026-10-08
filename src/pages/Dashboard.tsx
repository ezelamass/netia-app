import { useMemo } from 'react';
import { addDays, format, isAfter, isSameDay, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { TodayCard } from '@/components/dashboard/TodayCard';
import { TeamCards } from '@/components/dashboard/TeamCards';
import { ClubCard } from '@/components/dashboard/ClubCard';
import { XpCard } from '@/components/dashboard/XpCard';
import { HowYouAreCard } from '@/components/dashboard/HowYouAreCard';
import { SectionHeader } from '@/components/play/SectionHeader';
import { StatPill } from '@/components/play/StatPill';
import { WeekStrip } from '@/components/play/WeekStrip';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useCalendarEvents, type EventType } from '@/hooks/useCalendarEvents';
import { useGamification } from '@/hooks/useGamification';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useClubAnnouncements } from '@/hooks/useClubAnnouncements';
import { ICONS } from '@/lib/icons';
import { LEVEL_CONFIG, calculateLevel, getNextLevelXP, LEVEL_THRESHOLDS } from '@/types/gamification';

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, stats, health, weeklyCompliance, isLoading } = useDashboardData();
  const { logs, getLogsForDays, getStreak, hasLoggedToday } = useDailyLog();
  const { events } = useCalendarEvents();
  const { currentXP: computedXP, earned, badgeProgress } = useGamification();
  const { enrollments } = useEnrollment();
  const { announcements } = useClubAnnouncements();

  const today = new Date();
  const name = (profile?.fullName ?? user?.name ?? '').split(' ')[0] || 'Deportista';
  const streak = Math.max(getStreak(), stats?.streak ?? 0);
  // La fuente de verdad del XP es player_stats; si todavía no hay fila, se usa el cálculo local.
  const currentXP = Math.max(stats?.xp ?? 0, computedXP);
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = getNextLevelXP(currentLevel);
  const levelFloor = LEVEL_THRESHOLDS[currentLevel];
  const levelProgress = nextLevelXP > levelFloor ? ((currentXP - levelFloor) / (nextLevelXP - levelFloor)) * 100 : 100;

  const todayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.date, new Date())).sort((a, b) => (a.startTime ?? '99').localeCompare(b.startTime ?? '99')),
    [events],
  );

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const dotsByDay = useMemo(() => {
    const map: Record<string, EventType[]> = {};
    for (const e of events) {
      const k = format(e.date, 'yyyy-MM-dd');
      (map[k] ??= []).push(e.type);
    }
    return map;
  }, [events]);

  const enrollment = enrollments.find((e) => e.status === 'active') ?? enrollments[0] ?? null;
  const nextClubEvent = useMemo(
    () => events.find((e) => e.source === 'club' && (isAfter(e.date, new Date()) || isSameDay(e.date, new Date()))) ?? null,
    [events],
  );
  const lastAnnouncement = useMemo(
    () => [...announcements].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null,
    [announcements],
  );

  const lastBadges = useMemo(() => {
    const byId = new Map(badgeProgress.map((b) => [b.id, b]));
    return [...earned]
      .sort((a, b) => (b.earned_at ?? '').localeCompare(a.earned_at ?? ''))
      .map((r) => byId.get(r.badge_id))
      .filter((b): b is NonNullable<typeof b> => !!b)
      .slice(0, 3);
  }, [earned, badgeProgress]);

  const energy7 = useMemo(() => getLogsForDays(7).map((l) => l.energy), [getLogsForDays]);

  if (isLoading && !profile) return <PageSkeleton />;

  return (
    <AppLayout>
      <div data-page-ready className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 lg:col-span-12">
          <div className="min-w-0">
            <h1 className="font-heading text-[22px] font-bold leading-tight md:text-[28px]">¡Hola, {name}!</h1>
            <p className="text-sm text-muted-foreground first-letter:uppercase">{format(today, "EEEE d 'de' MMMM", { locale: es })}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
            {streak > 0 && <StatPill icon={ICONS.streak.icon} value={`${streak} ${streak === 1 ? 'día' : 'días'}`} label="Racha" tone="orange" />}
            <StatPill icon={ICONS.xp.icon} value={`${LEVEL_CONFIG[currentLevel].label} · ${currentXP} XP`} label="Nivel" tone="orange" />
          </div>
        </header>

        <div className="space-y-5 lg:col-span-8">
          <TodayCard todayEvents={todayEvents} />

          <section>
            <SectionHeader title="Tu equipo" />
            <TeamCards
              streak={streak}
              hasLogToday={hasLoggedToday}
              energyLevel={health?.energyLevel ?? null}
              hydrationLiters={health?.hydration ?? null}
            />
          </section>

          <section>
            <SectionHeader title="Tu semana" action={{ label: 'Ver calendario', to: '/calendar' }} />
            <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-card">
              <WeekStrip weekStart={weekStart} selected={today} dotsByDay={dotsByDay} readOnly />
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <section>
            <SectionHeader title="Mi club" />
            <ClubCard enrollment={enrollment} nextClubEvent={nextClubEvent} lastAnnouncement={lastAnnouncement} />
          </section>

          <section>
            <SectionHeader title="Progreso" action={{ label: 'Ver logros', to: '/achievements' }} />
            <XpCard level={currentLevel} xp={currentXP} nextLevelXP={nextLevelXP} progress={levelProgress} badges={lastBadges} />
          </section>

          {logs.length > 0 && <HowYouAreCard weeklyCompliance={weeklyCompliance} energy7={energy7} />}
        </aside>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
