import { ArrowLeft, History, MoreVertical, SquarePen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS, type AvatarId } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play/AgentAvatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  avatar: AvatarId;
  /** Mientras el agente responde: "escribiendo…" + anillo IA en el avatar */
  typing?: boolean;
  /** Flecha "atrás" a la lista (solo mobile) */
  onBack: () => void;
  onNewChat: () => void;
  onOpenHistory: () => void;
  disabled?: boolean;
  atLimit?: boolean;
  totalCount: number;
  maxCount: number;
}

const STATUS_COLOR: Record<AvatarId, string> = {
  TINO: 'text-tino-text',
  ZAHIA: 'text-zahia-text',
  ROMA: 'text-roma-text',
};

/** Cabecera de la conversación: [←] avatar, nombre / estado, menú ⋮. */
export const ChatHeader = ({ avatar, typing, onBack, onNewChat, onOpenHistory, disabled, atLimit, totalCount, maxCount }: ChatHeaderProps) => (
  <div className="flex h-16 items-center gap-2 border-b border-border/60 bg-card px-2 lg:px-4">
    <button
      type="button"
      onClick={onBack}
      aria-label="Volver a los chats"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-fast hover:bg-muted hover:text-foreground active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
    </button>
    <AgentAvatar agent={avatar} size={40} state={typing ? 'thinking' : 'idle'} className="ml-1 lg:ml-0" />
    <div className="min-w-0 flex-1 leading-tight">
      <h1 className="truncate font-sans text-base font-semibold">{AGENTS[avatar].name}</h1>
      <p className={cn('truncate text-xs', typing ? cn('font-medium', STATUS_COLOR[avatar]) : 'text-muted-foreground')} aria-live="polite">
        {typing ? 'escribiendo…' : AGENTS[avatar].area}
      </p>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Más opciones del chat"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-fast hover:bg-muted hover:text-foreground active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={onOpenHistory}>
          <History className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Chats anteriores</span>
          <span className={cn('ml-auto tabular-nums text-xs text-muted-foreground', atLimit && 'font-semibold text-destructive')}>{totalCount}/{maxCount}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onNewChat} disabled={disabled}>
          <SquarePen className="mr-2 h-4 w-4" aria-hidden="true" />
          Nuevo chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
