import { Gift, Calendar, Building2, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Prize } from '@/hooks/usePrizes';
import { MEDALS } from './medals';
import { IconBadge } from '@/components/play/IconBadge';

interface PrizeDetailModalProps {
  prize: Prize | null;
  position: 1 | 2 | 3;
  open: boolean;
  onClose: () => void;
}

export const PrizeDetailModal = ({ prize, position, open, onClose }: PrizeDetailModalProps) => {
  if (!prize) return null;

  const medal = MEDALS[position];
  const Icon = medal.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-48">
          <img
            src={prize.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent'
          )} />
          <span className={cn('absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', medal.solid)}>
            <Icon className="h-4 w-4" aria-hidden="true" />{medal.prize}
          </span>
        </div>

        <DialogHeader className="px-6 pb-0">
          <DialogTitle className="text-xl">{prize.name}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <p className="text-muted-foreground text-sm">
            {prize.details || prize.description}
          </p>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            {prize.value && (
              <div className="flex items-center gap-2">
                <IconBadge icon={Gift} tone="orange" size="sm" />
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-semibold text-sm">{prize.value}</p>
                </div>
              </div>
            )}

            {prize.sponsor && (
              <div className="flex items-center gap-2">
                <IconBadge icon={Building2} tone="blue" size="sm" />
                <div>
                  <p className="text-xs text-muted-foreground">Patrocinador</p>
                  <p className="font-semibold text-sm">{prize.sponsor}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 col-span-2">
              <IconBadge icon={Calendar} tone="slate" size="sm" />
              <div>
                <p className="text-xs text-muted-foreground">Entrega</p>
                <p className="font-semibold text-sm">Al finalizar la semana</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
            <Trophy className="h-4 w-4 text-warning" aria-hidden="true" />
            <p>Llegá al <strong className="text-foreground">Top {position}</strong> de la semana para ganar este premio.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
