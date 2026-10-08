import { isToday, isYesterday, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AGENTS, AVATAR_IDS, type AvatarId } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play/AgentAvatar';
import type { ChatMessage } from '@/hooks/useChat';
import { staggerProps, useEnterOnce } from '@/hooks/useEnterOnce';

interface ChatListProps {
  active: AvatarId | null;
  lastMessages: Record<AvatarId, ChatMessage | null>;
  unread: Record<AvatarId, number>;
  typing?: Partial<Record<AvatarId, boolean>>;
  onSelect: (agent: AvatarId) => void;
}

const when = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Ayer';
  return format(d, 'dd/MM');
};

/** Lista de chats (los 3 agentes): avatar, último mensaje, hora y no leídos. */
export const ChatList = ({ active, lastMessages, unread, typing, onSelect }: ChatListProps) => {
  const enter = useEnterOnce('chat-list');
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-border/60 px-4">
        <h2 className="font-heading text-xl font-bold">Chats</h2>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {AVATAR_IDS.map((id, i) => {
          const agent = AGENTS[id];
          const last = lastMessages[id];
          const count = unread[id];
          const st = staggerProps(enter, i);
          return (
            <li key={id} style={st.style} className={st.className}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={active === id ? 'true' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-[background-color,transform] duration-fast active:scale-[.99]',
                  'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  active === id && 'bg-muted',
                )}
              >
                <AgentAvatar agent={id} size={48} state={typing?.[id] ? 'thinking' : 'idle'} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-base font-semibold">{agent.name}</span>
                    {last && (
                      <span className={cn('shrink-0 text-xs tabular-nums', count ? 'font-medium text-primary' : 'text-muted-foreground')}>
                        {when(last.timestamp)}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className={cn('truncate text-sm', count ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                      {typing?.[id] ? 'escribiendo…' : last ? `${last.sender === 'user' ? 'Vos: ' : ''}${last.text}` : agent.tagline}
                    </span>
                    {count > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold tabular-nums text-primary-foreground animate-pop-in">
                        {count}
                        <span className="sr-only"> mensajes sin leer</span>
                      </span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
