import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useGrowIn } from '@/hooks/useGrowIn';

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  className?: string;
}

/** Anillo de progreso en SVG puro (sin recharts). */
export const ProgressRing = memo(({ value, size = 64, stroke = 6, label, className }: ProgressRingProps) => {
  const v = Math.max(0, Math.min(100, value));
  const shown = useGrowIn(v);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(v)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-slow ease-out"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)}
        />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums">{label ?? `${Math.round(v)}%`}</span>
    </div>
  );
});
ProgressRing.displayName = 'ProgressRing';
