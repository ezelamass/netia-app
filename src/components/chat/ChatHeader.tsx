import { History, SquarePen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS, type AvatarId } from '@/lib/avatars';

interface ChatHeaderProps {
  avatar: AvatarId;
  onNewChat: () => void;
  onOpenHistory: () => void;
  disabled?: boolean;
  atLimit?: boolean;
  totalCount: number;
  maxCount: number;
}

const TINT: Record<AvatarId, string> = {
  TINO: 'bg-tino-soft/70',
  ZAHIA: 'bg-zahia-soft/70',
  ROMA: 'bg-roma-soft/70',
};

const btn =
  'flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

/** Barra del agente: tagline + historial (n/5) + nuevo chat. */
export const ChatHeader = ({ avatar, onNewChat, onOpenHistory, disabled, atLimit, totalCount, maxCount }: ChatHeaderProps) => (
  <div className={cn('flex h-10 items-center justify-between gap-2 border-b border-border/60 px-3', TINT[avatar])}>
    <p className="truncate text-xs text-muted-foreground">{AGENTS[avatar].tagline}</p>
    <div className="flex items-center gap-1">
      <button type="button" onClick={onOpenHistory} className={btn} aria-label={`Historial de chats, ${totalCount} de ${maxCount}`}>
        <History className="h-4 w-4" aria-hidden="true" />
        <span className={cn('tabular-nums', atLimit && 'font-semibold text-destructive')}>{totalCount}/{maxCount}</span>
      </button>
      <button type="button" onClick={onNewChat} disabled={disabled} className={btn} aria-label="Nuevo chat">
        <SquarePen className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
);
