import { memo } from 'react';
import { cn } from '@/lib/utils';
import { AGENTS, type AvatarId } from '@/lib/avatars';

interface AgentAvatarProps {
  agent: AvatarId;
  size?: 24 | 32 | 48 | 96;
  ring?: boolean;
  float?: boolean;
  className?: string;
}

const RING: Record<AvatarId, string> = {
  TINO: 'ring-tino',
  ZAHIA: 'ring-zahia',
  ROMA: 'ring-roma',
};

/** Avatar estático (.avif, ~20 KB). Reemplaza al canvas WebGL. */
export const AgentAvatar = memo(({ agent, size = 32, ring, float, className }: AgentAvatarProps) => (
  <img
    src={AGENTS[agent].image}
    alt={AGENTS[agent].name}
    width={size}
    height={size}
    decoding="async"
    loading={size === 96 ? 'eager' : 'lazy'}
    className={cn(
      'shrink-0 rounded-full bg-surface-raised object-cover',
      ring && cn('ring-2 ring-offset-2 ring-offset-background', RING[agent]),
      float && 'play-float',
      className,
    )}
    style={{ width: size, height: size }}
  />
));
AgentAvatar.displayName = 'AgentAvatar';
