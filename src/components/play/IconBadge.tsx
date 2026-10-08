import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_CLASSES, type Tone } from '@/lib/icons';

interface IconBadgeProps {
  icon: LucideIcon;
  tone?: Tone;
  size?: 'sm' | 'md';
  className?: string;
}

export const IconBadge = memo(({ icon: Icon, tone = 'orange', size = 'md', className }: IconBadgeProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-lg',
      size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
      TONE_CLASSES[tone].bg,
      TONE_CLASSES[tone].text,
      className,
    )}
  >
    <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2} />
  </span>
));
IconBadge.displayName = 'IconBadge';
