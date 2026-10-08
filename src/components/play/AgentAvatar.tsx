import { memo } from 'react';
import { cn } from '@/lib/utils';
import { AGENTS, type AvatarId } from '@/lib/avatars';

interface AgentAvatarProps {
  agent: AvatarId;
  size?: 24 | 32 | 40 | 48 | 96;
  ring?: boolean;
  float?: boolean;
  /** idle: sin brillo. thinking: anillo IA que respira. unread: punto en el color del agente. El brillo es información: nunca en reposo. */
  state?: 'idle' | 'thinking' | 'unread';
  className?: string;
}

const RING: Record<AvatarId, string> = {
  TINO: 'ring-tino',
  ZAHIA: 'ring-zahia',
  ROMA: 'ring-roma',
};

const DOT: Record<AvatarId, string> = {
  TINO: 'bg-tino',
  ZAHIA: 'bg-zahia',
  ROMA: 'bg-roma',
};

/** Avatar estático (.avif, ~20 KB). Reemplaza al canvas WebGL. */
export const AgentAvatar = memo(({ agent, size = 32, ring, float, state = 'idle', className }: AgentAvatarProps) => {
  const img = (
    <img
      src={AGENTS[agent].image}
      alt={AGENTS[agent].name}
      width={size}
      height={size}
      decoding="async"
      loading={size === 96 ? 'eager' : 'lazy'}
      className={cn(
        'relative shrink-0 rounded-full bg-surface-raised object-cover',
        ring && cn('ring-2 ring-offset-2 ring-offset-background', RING[agent]),
        state === 'thinking' && 'ring-2 ring-background',
        float && 'play-float',
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
  if (state === 'idle') return img;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {state === 'thinking' && (
        <span aria-hidden="true" className="absolute -inset-1 rounded-full bg-ai animate-ai-breathe" />
      )}
      {img}
      {state === 'unread' && (
        <>
          <span aria-hidden="true" className={cn('absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card', DOT[agent])} />
          <span className="sr-only">Mensaje nuevo</span>
        </>
      )}
    </span>
  );
});
AgentAvatar.displayName = 'AgentAvatar';
