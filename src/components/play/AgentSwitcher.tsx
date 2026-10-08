import { memo, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { AGENTS, AVATAR_IDS, type AvatarId } from '@/lib/avatars';
import { AgentAvatar } from './AgentAvatar';

interface AgentSwitcherProps {
  value: AvatarId;
  onChange: (agent: AvatarId) => void;
  unread?: Partial<Record<AvatarId, boolean>>;
  variant?: 'tabs' | 'compact';
  /** id del panel que controla (aria-controls) */
  panelId?: string;
  className?: string;
}

const INDICATOR: Record<AvatarId, string> = {
  TINO: 'bg-tino-soft ring-1 ring-tino/40',
  ZAHIA: 'bg-zahia-soft ring-1 ring-zahia/40',
  ROMA: 'bg-roma-soft ring-1 ring-roma/40',
};

export const AgentSwitcher = memo(({ value, onChange, unread, variant = 'tabs', panelId, className }: AgentSwitcherProps) => {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const compact = variant === 'compact';

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = AVATAR_IDS.indexOf(value);
    const next = AVATAR_IDS[(i + (e.key === 'ArrowRight' ? 1 : AVATAR_IDS.length - 1)) % AVATAR_IDS.length];
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
      <div
        role="tablist"
        aria-label="Elegí con qué agente hablar"
        onKeyDown={onKeyDown}
        className={cn('relative grid grid-cols-3 gap-1 rounded-2xl border border-border/60 bg-card p-1', className)}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-1 left-1 top-1 rounded-xl transition-transform duration-200 ease-out motion-reduce:transition-none',
            INDICATOR[value],
          )}
          style={{ width: 'calc((100% - 1.25rem) / 3)', transform: `translateX(calc(${AVATAR_IDS.indexOf(value)} * (100% + 0.25rem)))` }}
        />
        {AVATAR_IDS.map((id) => {
          const agent = AGENTS[id];
          const active = id === value;
          return (
            <button
              key={id}
              ref={(el) => { refs.current[id] = el; }}
              type="button"
              role="tab"
              id={`agent-tab-${id}`}
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(id)}
              className={cn(
                'relative flex items-center justify-center gap-2 rounded-xl px-2 text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                compact ? 'h-10' : 'h-12',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="relative flex items-center gap-2">
                <AgentAvatar agent={id} size={24} ring={active} />
                <span className={cn('flex flex-col leading-tight', compact && 'hidden sm:flex')}>
                  <span className="text-sm font-semibold">{agent.name}</span>
                  {!compact && <span className="text-[11px] text-muted-foreground">{agent.area}</span>}
                </span>
                {unread?.[id] && !active && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" aria-hidden="true" />
                )}
              </span>
              {unread?.[id] && !active && <span className="sr-only">Mensaje nuevo</span>}
            </button>
          );
        })}
      </div>
  );
});
AgentSwitcher.displayName = 'AgentSwitcher';
