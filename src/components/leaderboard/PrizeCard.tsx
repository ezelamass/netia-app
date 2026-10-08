import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Prize } from '@/hooks/usePrizes';
import { MEDALS, type Position } from './medals';

interface PrizeCardProps {
  position: Position;
  prize: Prize;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PrizeCard = memo(({ position, prize, onClick, className, style }: PrizeCardProps) => {
  const medal = MEDALS[position];
  const Icon = medal.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        'group overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-card transition-[transform,box-shadow] duration-fast ease-out',
        'hover:-translate-y-0.5 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <div className="relative h-32 overflow-hidden bg-muted">
        <img
          src={prize.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-slow ease-out group-hover:scale-105"
        />
        <span className={cn('absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', medal.solid)}>
          <Icon className="h-3 w-3" aria-hidden="true" />{medal.prize}
        </span>
        {prize.value && (
          <span className="absolute bottom-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">{prize.value}</span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{prize.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{prize.description}</p>
        <div className="flex items-center justify-between pt-1 text-xs">
          {prize.sponsor ? <span className="text-muted-foreground">Por <span className="font-medium text-foreground">{prize.sponsor}</span></span> : <span />}
          <span className="inline-flex items-center font-medium text-primary">Ver más<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
        </div>
      </div>
    </button>
  );
});
PrizeCard.displayName = 'PrizeCard';
