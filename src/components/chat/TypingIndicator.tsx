import { cn } from '@/lib/utils';
import type { AvatarId } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play/AgentAvatar';

const AGENT_BORDER: Record<AvatarId, string> = {
  TINO: 'border-l-tino',
  ZAHIA: 'border-l-zahia',
  ROMA: 'border-l-roma',
};

const dot = 'h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce motion-reduce:animate-none';

export const TypingIndicator = ({ avatar }: { avatar: AvatarId }) => (
  <div className="flex items-end gap-2" role="status" aria-label={`${avatar} está escribiendo`}>
    <AgentAvatar agent={avatar} size={24} />
    <div className={cn('flex items-center gap-1 rounded-2xl rounded-bl-md border border-l-[3px] border-border/60 bg-card px-4 py-3 shadow-sm', AGENT_BORDER[avatar])}>
      <span className={dot} style={{ animationDelay: '0ms', animationDuration: '1s' }} />
      <span className={dot} style={{ animationDelay: '150ms', animationDuration: '1s' }} />
      <span className={dot} style={{ animationDelay: '300ms', animationDuration: '1s' }} />
    </div>
  </div>
);
