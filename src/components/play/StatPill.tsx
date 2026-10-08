import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_CLASSES, type Tone } from '@/lib/icons';

interface StatPillProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  tone?: Tone;
  className?: string;
}

export const StatPill = memo(({ icon: Icon, value, label, tone = 'orange', className }: StatPillProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-semibold tabular-nums',
      className,
    )}
    title={label}
  >
    <Icon className={cn('h-4 w-4', TONE_CLASSES[tone].text)} strokeWidth={2} aria-hidden="true" />
    <span>{value}</span>
    <span className="sr-only">{label}</span>
  </span>
));
StatPill.displayName = 'StatPill';
