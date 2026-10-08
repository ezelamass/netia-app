import { memo } from 'react';
import { Flame } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useGrowIn } from '@/hooks/useGrowIn';
import { MEDALS } from './medals';

interface PodiumCardProps {
  rank: 1 | 2 | 3;
  player: { name: string; points: number; streak: number };
  /** Orden de entrada en ms */
  delay?: number;
  className?: string;
}

const SIZE = { 1: { avatar: 'h-16 w-16 text-xl', block: 'h-32' }, 2: { avatar: 'h-14 w-14 text-lg', block: 'h-24' }, 3: { avatar: 'h-12 w-12 text-base', block: 'h-20' } } as const;

export const PodiumCard = memo(({ rank, player, delay = 0, className }: PodiumCardProps) => {
  const medal = MEDALS[rank];
  const Icon = medal.icon;
  const grow = useGrowIn(1);
  const initials = player.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2);

  return (
    <li className={cn('flex w-full min-w-0 flex-col items-center animate-fade-up', className)} style={{ animationDelay: `${delay}ms` }}>
      <div className="relative mb-2">
        <Avatar className={cn(SIZE[rank].avatar, 'ring-2 ring-offset-2 ring-offset-background', rank === 1 ? 'ring-warning' : rank === 2 ? 'ring-muted-foreground' : 'ring-primary')}>
          <AvatarFallback className={cn('font-bold', medal.soft, medal.text)}>{initials}</AvatarFallback>
        </Avatar>
        <span
          aria-hidden="true"
          className={cn('absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full animate-pop-in', medal.solid)}
          style={{ animationDelay: `${delay + 200}ms` }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="max-w-full truncate text-sm font-semibold">{player.name.split(' ')[0]}</p>
      <p className="mb-2 flex items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
        <Flame className="h-3 w-3 text-primary" aria-hidden="true" />{player.streak}
      </p>
      <div
        className={cn(
          'flex w-full origin-bottom flex-col items-center rounded-t-2xl pt-3 transition-transform duration-slow ease-spring',
          SIZE[rank].block, medal.soft,
        )}
        style={{ transform: `scaleY(${grow})`, transitionDelay: `${delay}ms` }}
      >
        <span className={cn('font-heading text-2xl font-bold', medal.text)}>{rank}</span>
        <p className="mt-1 font-heading text-base font-bold tabular-nums">{player.points.toLocaleString('es-AR')}</p>
        <p className="text-xs text-muted-foreground">XP</p>
      </div>
    </li>
  );
});
PodiumCard.displayName = 'PodiumCard';
