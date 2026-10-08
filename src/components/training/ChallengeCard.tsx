import { Star } from 'lucide-react';
import { IconBadge } from '@/components/play/IconBadge';
import type { Challenge } from '@/data/training-preview';
import { PREVIEW_ICONS } from './previewIcons';

export const ChallengeCard = ({ challenge: c }: { challenge: Challenge }) => {
  const pct = Math.min(100, Math.round((c.progress / c.goal) * 100));
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-3">
        <IconBadge icon={PREVIEW_ICONS[c.icon]} tone={c.tone} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{c.title}</p>
          <p className="text-xs tabular-nums text-muted-foreground">{c.progress} de {c.goal}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
          <Star className="h-3.5 w-3.5" aria-hidden="true" />+{c.xp} XP
        </span>
      </div>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={c.title}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
