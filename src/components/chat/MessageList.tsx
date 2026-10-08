import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS, type AvatarId } from '@/lib/avatars';
import type { ChatMessage, Handoff } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { SystemChip } from './SystemChip';
import { TypingIndicator } from './TypingIndicator';

const NEAR_BOTTOM_PX = 120;
const JUMP_VISIBLE_PX = 240;

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (isToday(d)) return 'Hoy';
  if (isYesterday(d)) return 'Ayer';
  return format(d, "d 'de' MMMM", { locale: es });
};

export const DayChip = memo(({ label }: { label: string }) => (
  <div className="sticky top-2 z-10 flex justify-center py-1" role="separator" aria-label={label}>
    <span className="rounded-md bg-card/90 px-2.5 py-1 text-xs font-medium shadow-bubble">{label}</span>
  </div>
));
DayChip.displayName = 'DayChip';

interface MessageListProps {
  agent: AvatarId;
  /** Cambia al cambiar de agente o de conversación: el salto al fondo es instantáneo */
  scopeKey: string;
  messages: ChatMessage[];
  isTyping: boolean;
  handoff: Handoff | null;
  onHandoff: (h: Handoff) => void;
  /** Contenido antes de los mensajes (aviso honesto) y después (saludo, etc.) */
  header?: ReactNode;
  className?: string;
}

interface Day { key: string; label: string; items: { m: ChatMessage; first: boolean }[] }

export const MessageList = ({ agent, scopeKey, messages, isTyping, handoff, onHandoff, header, className }: MessageListProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const prevCount = useRef(0);
  const prevScope = useRef(scopeKey);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    setNewCount(0);
    setShowJump(false);
  }, []);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const away = el.scrollHeight - el.scrollTop - el.clientHeight;
    nearBottom.current = away <= NEAR_BOTTOM_PX;
    setShowJump(away > JUMP_VISIBLE_PX);
    if (nearBottom.current) setNewCount(0);
  };

  useLayoutEffect(() => {
    const scopeChanged = prevScope.current !== scopeKey;
    prevScope.current = scopeKey;
    const grew = messages.length - prevCount.current;
    prevCount.current = messages.length;
    if (scopeChanged) { scrollToBottom(false); nearBottom.current = true; return; }
    if (grew <= 0) return;
    const last = messages[messages.length - 1];
    if (last?.sender === 'user' || nearBottom.current) scrollToBottom(!!last?.fresh);
    else { setNewCount((n) => n + grew); setShowJump(true); }
  }, [messages, scopeKey, scrollToBottom, isTyping]);

  const days = useMemo<Day[]>(() => {
    const out: Day[] = [];
    messages.forEach((m) => {
      const key = new Date(m.timestamp).toDateString();
      let day = out[out.length - 1];
      if (!day || day.key !== key) { day = { key, label: dayLabel(m.timestamp), items: [] }; out.push(day); }
      const prev = day.items[day.items.length - 1]?.m;
      day.items.push({ m, first: !prev || prev.sender !== m.sender });
    });
    return out;
  }, [messages]);

  const lastIsAgent = messages[messages.length - 1]?.sender === 'avatar';

  return (
    <div className={cn('relative min-h-0 flex-1', className)}>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto overscroll-contain px-3 pb-3 pt-2 lg:px-6"
        role="log"
        aria-live="polite"
        aria-label={`Conversación con ${AGENTS[agent].name}`}
      >
        {header}
        {days.map((day) => (
          <section key={day.key}>
            <DayChip label={day.label} />
            {day.items.map(({ m, first }) => (
              <MessageBubble
                key={m.id}
                isUser={m.sender === 'user'}
                text={m.text}
                first={first}
                timestamp={m.timestamp}
                status={m.status}
                fresh={m.fresh}
                className={first ? 'mt-2' : 'mt-0.5'}
              />
            ))}
          </section>
        ))}
        {isTyping && <div className="mt-2"><TypingIndicator avatar={agent} /></div>}
        {handoff && !isTyping && lastIsAgent && (
          <SystemChip className="mt-3">
            <button
              type="button"
              onClick={() => onHandoff(handoff)}
              className="inline-flex items-center gap-1.5 rounded-sm font-medium transition-transform duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sobre esto también sabe {AGENTS[handoff.to].name}
              <span className="inline-flex items-center gap-0.5 text-primary">
                Preguntarle <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          </SystemChip>
        )}
      </div>
      {showJump && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          aria-label={newCount ? `Ir al final, ${newCount} mensajes nuevos` : 'Ir al final'}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-pop animate-pop-in transition-transform duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
          {newCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold tabular-nums text-primary-foreground">
              {newCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
