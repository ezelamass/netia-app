import { AlertTriangle, CheckCircle2, Clock, Info, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONES: Record<StatusTone, { cls: string; icon: LucideIcon }> = {
  success: { cls: 'bg-success-soft text-success', icon: CheckCircle2 },
  warning: { cls: 'bg-warning-soft text-warning', icon: Clock },
  danger: { cls: 'bg-danger-soft text-danger', icon: XCircle },
  info: { cls: 'bg-info-soft text-info', icon: Info },
  neutral: { cls: 'bg-muted text-muted-foreground', icon: AlertTriangle },
};

interface StatusChipProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

/** Estado con color + ícono + texto (nunca solo color). */
export const StatusChip = ({ tone, children, className }: StatusChipProps) => {
  const { cls, icon: Icon } = TONES[tone];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap', cls, className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {children}
    </span>
  );
};

export type FeeStatus = 'al_dia' | 'pendiente' | 'vencida';
export type MedicalStatus = 'apto' | 'por_vencer' | 'vencido' | 'sin_apto';

export const FeeChip = ({ status }: { status: FeeStatus }) => {
  const map = {
    al_dia: { tone: 'success', label: 'Al día' },
    pendiente: { tone: 'warning', label: 'Pendiente' },
    vencida: { tone: 'danger', label: 'Vencida' },
  } as const;
  return <StatusChip tone={map[status].tone}>{map[status].label}</StatusChip>;
};

export const MedicalChip = ({ status }: { status: MedicalStatus }) => {
  const map = {
    apto: { tone: 'success', label: 'Apto' },
    por_vencer: { tone: 'warning', label: 'Por vencer' },
    vencido: { tone: 'danger', label: 'Vencido' },
    sin_apto: { tone: 'neutral', label: 'Sin apto' },
  } as const;
  return <StatusChip tone={map[status].tone}>{map[status].label}</StatusChip>;
};
