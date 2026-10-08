import { memo } from 'react';
import { Award } from 'lucide-react';
import { LEVEL_CONFIG, type PlayerLevel } from '@/types/gamification';
import { IconBadge } from '@/components/play/IconBadge';
import { CountUp } from '@/components/play/CountUp';
import { useGrowIn } from '@/hooks/useGrowIn';

interface XpCardProps {
  level: PlayerLevel;
  xp: number;
  nextLevelXP: number;
  progress: number;
  badges: Array<{ id: string; title: string }>;
}

const NEXT: Record<PlayerLevel, PlayerLevel | null> = { bronze: 'silver', silver: 'gold', gold: 'elite', elite: null };

export const XpCard = memo(({ level, xp, nextLevelXP, progress, badges }: XpCardProps) => {
  const next = NEXT[level];
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const shownPct = useGrowIn(pct);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">{LEVEL_CONFIG[level].label} · <span className="tabular-nums"><CountUp value={xp} id="xp-card" /> XP</span></p>
        {next && <p className="text-xs text-muted-foreground tabular-nums">Faltan {Math.max(0, nextLevelXP - xp)} XP para {LEVEL_CONFIG[next].label}</p>}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso al próximo nivel">
        <div className="h-full rounded-full bg-primary transition-[width] duration-slow ease-out" style={{ width: `${shownPct}%` }} />
      </div>
      {badges.length > 0 && (
        <ul className="mt-3 space-y-2">
          {badges.map((b) => (
            <li key={b.id} className="flex items-center gap-2 text-sm">
              <IconBadge icon={Award} tone="orange" size="sm" />
              <span className="truncate">{b.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
XpCard.displayName = 'XpCard';
