import { Fragment, memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS, type AvatarId } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play/AgentAvatar';
import type { ChatMessage, Handoff } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

const NEAR_BOTTOM_PX = 120;

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return 'Hoy';
  if (isYesterday(d)) return 'Ayer';
  return format(d, "d 'de' MMMM", { locale: es });
};

const DaySeparator = memo(({ label }: { label: string }) => (
  <div className="my-3 flex items-center gap-3 text-xs font-medium text-muted-foreground" role="separator">
    <span className="h-px flex-1 bg-border/60" />
    {label}
    <span className="h-px flex-1 bg-border/60" />
  </div>
));
DaySeparator.displayName = 'DaySeparator';

interface MessageListProps {
  agent: AvatarId;
  /** Cambia al cambiar de agente o de conversación: el salto al fondo es instantáneo */
  scopeKey: string;
  messages: ChatMessage[];
  isTyping: boolean;
  handoff: Handoff | null;
  onHandoff: (h: Handoff) => void;
  className?: string;
}

export const MessageList = ({ agent, scopeKey, messages, isTyping, handoff, onHandoff, className }: MessageListProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const [showNew, setShowNew] = useState(false);
  const prevCount = useRef(0);
  const prevScope = useRef(scopeKey);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    setShowNew(false);
  }, []);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
    if (nearBottom.current) setShowNew(false);
  };

  useLayoutEffect(() => {
    const scopeChanged = prevScope.current !== scopeKey;
    prevScope.current = scopeKey;
    const grew = messages.length > prevCount.current;
    prevCount.current = messages.length;
    if (scopeChanged) { scrollToBottom(false); nearBottom.current = true; return; }
    if (!grew) return;
    const last = messages[messages.length - 1];
    if (last?.sender === 'user' || nearBottom.current) scrollToBottom(!!last?.fresh);
    else setShowNew(true);
  }, [messages, scopeKey, scrollToBottom, isTyping]);

  const rows = useMemo(() => {
    let lastDay = '';
    return messages.map((m, i) => {
      const day = new Date(m.timestamp).toDateString();
      const newDay = day !== lastDay;
      lastDay = day;
      const prev = messages[i - 1];
      const first = newDay || !prev || prev.sender !== m.sender;
      return { m, first, separator: newDay ? dayLabel(m.timestamp) : null };
    });
  }, [messages]);

  const lastIsAgent = messages[messages.length - 1]?.sender === 'avatar';

  return (
    <div className={cn('relative min-h-0 flex-1', className)}>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto overscroll-contain px-3 py-3"
        role="log"
        aria-live="polite"
        aria-label={`Conversación con ${AGENTS[agent].name}`}
      >
        {rows.map(({ m, first, separator }) => (
          <Fragment key={m.id}>
            {separator && <DaySeparator label={separator} />}
            <div className={first && !separator ? 'mt-3 first:mt-0' : 'mt-1'}>
              <MessageBubble isUser={m.sender === 'user'} avatar={m.avatar} text={m.text} first={first} fresh={m.fresh} />
            </div>
          </Fragment>
        ))}
        {isTyping && <div className="mt-3"><TypingIndicator avatar={agent} /></div>}
        {handoff && !isTyping && lastIsAgent && (
          <div className="mt-3 pl-8">
            <button
              type="button"
              onClick={() => onHandoff(handoff)}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card py-1 pl-1 pr-3 text-xs font-medium shadow-sm transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AgentAvatar agent={handoff.to} size={24} />
              <span>Sobre esto también sabe {AGENTS[handoff.to].name}</span>
              <span className="inline-flex items-center gap-0.5 text-primary">
                Preguntarle <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          </div>
        )}
      </div>
      {showNew && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          Nuevos mensajes
        </button>
      )}
    </div>
  );
};
