import { cn } from '@/lib/utils';

interface AIShimmerTextProps {
  lines?: number;
  className?: string;
}

const WIDTHS = ['w-full', 'w-11/12', 'w-2/3'];

/** Líneas placeholder con shimmer platino mientras la IA escribe. */
export const AIShimmerText = ({ lines = 3, className }: AIShimmerTextProps) => (
  <div className={cn('space-y-2', className)} role="status" aria-label="La IA está escribiendo">
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className={cn('h-3 rounded-full bg-shimmer animate-shimmer', i === lines - 1 ? 'w-2/3' : WIDTHS[i % 2])} />
    ))}
  </div>
);
