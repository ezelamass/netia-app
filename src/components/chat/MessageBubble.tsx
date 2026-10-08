import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { AvatarId } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play/AgentAvatar';

interface MessageBubbleProps {
  isUser: boolean;
  avatar: AvatarId;
  text: string;
  /** Primera burbuja de un grupo consecutivo: lleva el avatar del agente */
  first: boolean;
  /** Solo los mensajes nuevos se animan al entrar */
  fresh?: boolean;
}

const AGENT_BORDER: Record<AvatarId, string> = {
  TINO: 'border-l-tino',
  ZAHIA: 'border-l-zahia',
  ROMA: 'border-l-roma',
};

export const MessageBubble = memo(({ isUser, avatar, text, first, fresh }: MessageBubbleProps) => (
  <div
    className={cn(
      'flex items-end gap-2',
      isUser ? 'justify-end' : 'justify-start',
      fresh && 'animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none',
    )}
  >
    {!isUser && (
      <span className="w-6 shrink-0 self-start">
        {first && <AgentAvatar agent={avatar} size={24} />}
      </span>
    )}
    <div
      className={cn(
        'max-w-[80%] px-3.5 py-2 text-sm',
        isUser
          ? 'rounded-2xl rounded-br-md bg-primary text-primary-foreground'
          : cn('rounded-2xl rounded-bl-md border border-l-[3px] border-border/60 bg-card text-card-foreground shadow-sm', AGENT_BORDER[avatar]),
      )}
    >
      <p className="whitespace-pre-wrap break-words font-ai text-sm leading-relaxed">{text}</p>
    </div>
  </div>
));
MessageBubble.displayName = 'MessageBubble';
