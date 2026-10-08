import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Variación vs. período anterior, en puntos o %. */
  delta?: number;
  deltaSuffix?: string;
  /** Si subir es malo (ej. morosos), invierte el color del delta. */
  invertDelta?: boolean;
  /** Serie corta para sparkline. */
  trend?: number[];
  tone?: 'default' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
  className?: string;
}

const Sparkline = ({ data, className }: { data: number[]; className?: string }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn('h-8 w-20', className)} aria-hidden="true">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const TONE_TEXT = {
  default: 'text-foreground',
  warning: 'text-warning',
  danger: 'text-danger',
  success: 'text-success',
};

export const KpiCard = ({
  label, value, icon: Icon, delta, deltaSuffix = '', invertDelta, trend, tone = 'default', onClick, className,
}: KpiCardProps) => {
  const positive = delta !== undefined && delta >= 0;
  const good = delta === undefined ? true : invertDelta ? !positive : positive;
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border bg-card p-4 text-left shadow-card',
        onClick && 'transition-colors hover:border-primary/40 focus-visible:ring-2',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className={cn('text-2xl font-bold font-heading tabular', TONE_TEXT[tone])}>{value}</p>
        {trend && <Sparkline data={trend} className={good ? 'text-success' : 'text-danger'} />}
      </div>
      {delta !== undefined && (
        <p className={cn('mt-1 flex items-center gap-0.5 text-xs font-medium tabular', good ? 'text-success' : 'text-danger')}>
          {positive ? <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> : <ArrowDownRight className="h-3 w-3" aria-hidden="true" />}
          {Math.abs(delta)}{deltaSuffix}
          <span className="ml-1 font-normal text-muted-foreground">vs. mes anterior</span>
        </p>
      )}
    </Comp>
  );
};
