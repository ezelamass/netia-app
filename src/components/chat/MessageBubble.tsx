import { memo } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/hooks/useChat';

interface MessageBubbleProps {
  isUser: boolean;
  text: string;
  /** Primera burbuja de un grupo: lleva la cola */
  first: boolean;
  /** ISO del mensaje; sin hora no se muestra (ej. saludo inicial) */
  timestamp?: string;
  status?: ChatMessage['status'];
  /** Solo los mensajes nuevos se animan al entrar */
  fresh?: boolean;
  /** Si el envío falló: muestra "Tocá para reintentar" debajo de la burbuja */
  onRetry?: () => void;
  className?: string;
}

const Ticks = ({ status }: { status: NonNullable<ChatMessage['status']> }) => {
  if (status === 'failed') return <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-label="No se envió" />;
  if (status === 'sending') return <Clock className="h-3 w-3" aria-label="Enviando" />;
  if (status === 'sent') return <Check className="h-3.5 w-3.5" aria-label="Enviado" />;
  return <CheckCheck className="h-3.5 w-3.5 text-info" aria-label="Respondido" />;
};

/** Burbuja estilo WhatsApp: sin bordes, hora adentro, cola solo en la primera del grupo. */
export const MessageBubble = memo(({ isUser, text, first, timestamp, status, fresh, onRetry, className }: MessageBubbleProps) => (
  <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start', className)}>
    <div
      className={cn(
        'relative max-w-[80%] rounded-lg px-2.5 py-1.5 text-sm text-foreground shadow-bubble lg:max-w-[65%]',
        isUser ? 'bg-chat-out' : 'bg-card',
        first && 'bubble-tail',
        first && (isUser ? 'bubble-tail-out rounded-tr-none' : 'bubble-tail-in rounded-tl-none'),
        fresh && (isUser ? 'animate-bubble-in-right' : 'animate-bubble-in-left'),
      )}
    >
      <p className="whitespace-pre-wrap break-words leading-relaxed">
        {text}
        {/* reserva el lugar de la hora al final del último renglón */}
        {timestamp && <span aria-hidden="true" className={cn('inline-block', isUser ? 'w-16' : 'w-11')} />}
      </p>
      {timestamp && (
        <span className="absolute bottom-1 right-2 flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
          <time dateTime={timestamp}>{format(new Date(timestamp), 'HH:mm')}</time>
          {isUser && status && <Ticks status={status} />}
        </span>
      )}
    </div>
    {status === 'failed' && onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1 rounded-sm text-xs font-medium text-destructive transition-transform duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
        No se envió. Tocá para reintentar
      </button>
    )}
  </div>
));
MessageBubble.displayName = 'MessageBubble';
