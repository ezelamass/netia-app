import { cn } from '@/lib/utils';
import { AGENTS, type AvatarId } from '@/lib/avatars';
import { AIMark } from './AIMark';

interface AIBadgeProps {
  agent?: AvatarId;
  /** Por defecto "Sugerido por {agente}" */
  label?: string;
  className?: string;
}

/** Firma de todo contenido escrito por IA que la persona todavía no aceptó. */
export const AIBadge = ({ agent, label, className }: AIBadgeProps) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground', className)}>
    <AIMark size={14} />
    {label ?? (agent ? `Sugerido por ${AGENTS[agent].name}` : 'Sugerido por IA')}
  </span>
);
