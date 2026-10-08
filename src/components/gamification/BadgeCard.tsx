import { memo } from 'react';
import { Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_CLASSES, type Tone } from '@/lib/icons';
import { useGrowIn } from '@/hooks/useGrowIn';

interface BadgeCardProps {
  badge: {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    requirement: number;
    current: number;
    progress: number;
    isUnlocked: boolean;
  };
  compact?: boolean;
  /** Recién desbloqueado: el ícono entra con pop-in (spring) */
  celebrate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CATEGORY_TONE: Record<string, Tone> = {
  streak: 'orange',
  xp: 'roma',
  wellness: 'zahia',
  training: 'tino',
};

export const BadgeCard = memo(({ badge, compact, celebrate, className, style }: BadgeCardProps) => {
  const tone = TONE_CLASSES[CATEGORY_TONE[badge.category] ?? 'orange'];
  const progress = Math.max(0, Math.min(100, badge.progress));
  const shown = useGrowIn(progress);

  if (compact) {
    return (
      <span
        title={badge.title}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full text-lg',
          badge.isUnlocked ? tone.bg : 'bg-muted opacity-40 grayscale',
          className,
        )}
        style={style}
      >
        {badge.icon}
      </span>
    );
  }

  return (
    <li
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card',
        !badge.isUnlocked && 'bg-muted/40 shadow-none',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl',
          badge.isUnlocked ? tone.bg : 'bg-muted text-muted-foreground',
          celebrate && 'animate-pop-in',
        )}
      >
        {badge.isUnlocked ? badge.icon : <Lock className="h-4 w-4" />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{badge.title}</h3>
          {badge.isUnlocked && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
              <Check className="h-3 w-3" aria-hidden="true" />Logrado
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{badge.description}</p>

        {!badge.isUnlocked && (
          <div className="mt-2">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{badge.current} / {badge.requirement}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso: ${badge.title}`}
            >
              <div className="h-full rounded-full bg-primary transition-[width] duration-slow ease-out" style={{ width: `${shown}%` }} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
});
BadgeCard.displayName = 'BadgeCard';
