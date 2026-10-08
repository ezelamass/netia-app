import { Battery, BatteryFull, BatteryLow, type LucideIcon } from 'lucide-react';
import type { LoadRecoveryData } from '@/hooks/useTrainingPlan';
import { cn } from '@/lib/utils';

const CONFIG: Record<LoadRecoveryData['status'], { label: string; text: string; icon: LucideIcon; cls: string }> = {
  green: { label: 'Vas bien', text: 'La carga de la semana está pareja. Seguí con el plan.', icon: BatteryFull, cls: 'bg-success-soft text-success' },
  yellow: { label: 'Ojo con la carga', text: 'Venís exigido. Cuidá el sueño y tomá agua.', icon: Battery, cls: 'bg-warning-soft text-warning' },
  red: { label: 'Hora de descansar', text: 'La carga está muy alta. Hablá con tu entrenador antes de la próxima sesión.', icon: BatteryLow, cls: 'bg-danger-soft text-danger' },
};

export const LoadRecoveryCard = ({ data }: { data: LoadRecoveryData }) => {
  const c = CONFIG[data.status];
  const Icon = c.icon;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
      <span aria-hidden="true" className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', c.cls)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{data.avgRpe === null ? 'Todavía sin datos de la semana' : c.label}</p>
        <p className="text-xs text-muted-foreground">
          {data.avgRpe === null ? 'Cuando termines tu primera sesión te mostramos cómo viene tu carga.' : c.text}
        </p>
      </div>
    </div>
  );
};
