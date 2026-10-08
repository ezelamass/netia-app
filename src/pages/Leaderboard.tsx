import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, Target } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyPanel } from '@/components/domain/EmptyPanel';
import { ListSkeleton } from '@/components/skeletons';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { PodiumCard, PrizeCard, PrizeDetailModal } from '@/components/leaderboard';
import { SectionHeader } from '@/components/play/SectionHeader';
import { StatPill } from '@/components/play/StatPill';
import { CountUp } from '@/components/play/CountUp';
import { IconBadge } from '@/components/play/IconBadge';
import { usePrizes, getTimeRemaining, type Prize } from '@/hooks/usePrizes';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { staggerProps, useEnterOnce } from '@/hooks/useEnterOnce';
import { cn } from '@/lib/utils';
import { ICONS } from '@/lib/icons';
import { LEVEL_CONFIG } from '@/types/gamification';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { entries, isLoading, currentUserEntry } = useLeaderboard();
  const { prizes } = usePrizes();
  const enter = useEnterOnce('leaderboard');
  const st = (i: number) => staggerProps(enter, i);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());
  const [selectedPrize, setSelectedPrize] = useState<{ prize: Prize; position: 1 | 2 | 3 } | null>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTimeRemaining(getTimeRemaining()), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUserEntry && currentUserEntry.rank <= 3 && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      const id = setTimeout(() => {
        void import('canvas-confetti').then(m => m.default({ particleCount: 60, spread: 70, origin: { y: 0.3 }, scalar: 0.9, disableForReducedMotion: true }));
      }, 600);
      return () => clearTimeout(id);
    }
  }, [currentUserEntry, hasTriggeredConfetti]);

  if (isLoading && entries.length === 0) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <PageSkeleton message="Armando el ranking…" />
          <ListSkeleton rows={5} showAvatar showRank />
        </div>
      </AppLayout>
    );
  }

  const hasEnoughUsers = entries.length >= 3;
  const top3 = entries.slice(0, 3).map(e => ({ name: e.name, points: e.points, streak: e.streak }));
  const restOfList = entries.slice(3);
  const pointsToTop3 = currentUserEntry && currentUserEntry.rank > 3
    ? (entries[2]?.points ?? 0) - currentUserEntry.points + 1
    : 0;

  return (
    <AppLayout>
      <div data-page-ready="" className="mx-auto max-w-3xl space-y-6 pb-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-bold md:text-2xl">Ranking</h1>
            <p className="text-sm text-muted-foreground">Sumá XP entrenando y registrando tu día. Los 3 primeros ganan premios.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
            <StatPill
              icon={Clock}
              value={<span className="tabular-nums">{timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m</span>}
              label="Tiempo que queda de la semana"
              tone="slate"
            />
          </div>
        </header>

        {currentUserEntry && (
          <section {...st(0)} aria-label="Tu posición">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/50 px-2 py-3">
                  <dd className="font-heading text-xl font-bold tabular-nums">#<CountUp value={currentUserEntry.rank} id="lb-rank" /></dd>
                  <dt className="text-xs text-muted-foreground">Tu posición</dt>
                </div>
                <div className="rounded-xl bg-muted/50 px-2 py-3">
                  <dd className="font-heading text-xl font-bold tabular-nums"><CountUp value={currentUserEntry.points} id="lb-xp" /></dd>
                  <dt className="text-xs text-muted-foreground">Tu XP</dt>
                </div>
                <div className="rounded-xl bg-muted/50 px-2 py-3">
                  <dd className="font-heading text-xl font-bold">{LEVEL_CONFIG[currentUserEntry.level].label}</dd>
                  <dt className="text-xs text-muted-foreground">Tu nivel</dt>
                </div>
              </dl>
              {pointsToTop3 > 0 && (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <IconBadge icon={Target} tone="orange" size="sm" />
                  <span>Te faltan <strong className="text-foreground tabular-nums">{pointsToTop3.toLocaleString('es-AR')} XP</strong> para entrar al Top 3.</span>
                </p>
              )}
            </div>
          </section>
        )}

        {!hasEnoughUsers && (
          <EmptyPanel
            icon={Trophy}
            title="El ranking se está armando"
            description="Todavía no hay suficientes atletas activos esta semana. Seguí entrenando para aparecer."
            actionLabel="Ir a entrenar"
            onAction={() => navigate('/training')}
          />
        )}

        {hasEnoughUsers && (
          <>
            <section {...st(1)} aria-label="Podio">
              <ol className="grid grid-cols-3 items-end gap-2 px-2 md:gap-4">
                <PodiumCard rank={2} player={top3[1]} delay={120} />
                <PodiumCard rank={1} player={top3[0]} delay={0} />
                <PodiumCard rank={3} player={top3[2]} delay={240} />
              </ol>
            </section>

            {restOfList.length > 0 && (
              <section {...st(2)}>
                <SectionHeader title="Clasificación" />
                <ol className="space-y-2">
                  {restOfList.map((athlete, index) => {
                    const mine = currentUserEntry?.userId === athlete.userId;
                    return (
                      <li
                        key={athlete.userId}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl border p-3 transition-colors duration-fast animate-fade-up',
                          mine ? 'border-primary/40 bg-primary-soft' : 'border-border/60 bg-card shadow-card hover:bg-muted/40',
                        )}
                        style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
                      >
                        <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground tabular-nums">{athlete.rank}</span>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-muted text-sm font-semibold">
                            {athlete.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {athlete.name}
                            {mine && <span className="ml-2 text-xs font-normal text-primary">(Vos)</span>}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{LEVEL_CONFIG[athlete.level].label}</span>
                            <span className="flex items-center gap-0.5 tabular-nums"><ICONS.streak.icon className="h-3 w-3 text-primary" aria-hidden="true" />{athlete.streak}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-base font-bold tabular-nums">{athlete.points.toLocaleString('es-AR')}</p>
                          <p className="text-xs text-muted-foreground">XP</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {prizes.length > 0 && (
              <section {...st(3)}>
                <SectionHeader title="Premios del podio" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {prizes.slice(0, 3).map((prize, index) => (
                    <PrizeCard
                      key={prize.id}
                      position={(index + 1) as 1 | 2 | 3}
                      prize={prize}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => setSelectedPrize({ prize, position: (index + 1) as 1 | 2 | 3 })}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <PrizeDetailModal
          prize={selectedPrize?.prize ?? null}
          position={selectedPrize?.position ?? 1}
          open={!!selectedPrize}
          onClose={() => setSelectedPrize(null)}
        />
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
