import { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProgressRing } from '@/components/play/ProgressRing';
import { Sparkline } from './Sparkline';
import { cn } from '@/lib/utils';

interface HowYouAreCardProps {
  weeklyCompliance: number;
  energy7: number[];
}

export const HowYouAreCard = memo(({ weeklyCompliance, energy7 }: HowYouAreCardProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:cursor-default"
      >
        <span className="font-heading text-base font-semibold">Cómo venís</span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-150 md:hidden', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <div className={cn('flex items-center gap-5 px-4 pb-4', !open && 'hidden md:flex')}>
        <div className="flex flex-col items-center gap-1">
          <ProgressRing value={weeklyCompliance} size={64} />
          <span className="text-xs text-muted-foreground">Registro semanal</span>
        </div>
        {energy7.length > 1 && (
          <div className="flex flex-col gap-1">
            <Sparkline data={energy7} color="hsl(16 88% 44%)" width={140} height={36} />
            <span className="text-xs text-muted-foreground">Tu energía, últimos 7 días</span>
          </div>
        )}
      </div>
    </div>
  );
});
HowYouAreCard.displayName = 'HowYouAreCard';
