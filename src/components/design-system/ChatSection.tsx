import { useState } from 'react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { DayChip } from '@/components/chat/MessageList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { SystemChip, AI_NOTICE } from '@/components/chat/SystemChip';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { AIInput } from '@/components/ui/ai-input';
import { Button } from '@/components/ui/button';
import { Rule, Section } from './parts';

const at = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const ChatSection = () => {
  const [typing, setTyping] = useState(false);

  return (
    <Section id="chat" title="Chat" lead="El chat se parece a WhatsApp a propósito: nadie tiene que aprender a usarlo. Mobile: lista de chats, conversación y flecha atrás. Desktop: dos paneles.">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <ChatHeader avatar="ZAHIA" typing={typing} onBack={() => undefined} onNewChat={() => undefined} onOpenHistory={() => undefined} totalCount={2} maxCount={5} />
            <div className="chat-wallpaper px-3 pb-3 pt-2">
              <DayChip label="Hoy" />
              <SystemChip className="my-1">{AI_NOTICE}</SystemChip>
              <MessageBubble isUser first text="¿Qué como antes del partido de las 17?" timestamp={at(11, 32)} status="read" className="mt-2" />
              <MessageBubble isUser={false} first text="Almorzá 3 horas antes: arroz o pasta con pollo y mucha agua. Nada de frituras." timestamp={at(11, 33)} className="mt-2" />
              <MessageBubble isUser={false} first={false} text="Y llevá una banana para el entretiempo." timestamp={at(11, 33)} className="mt-0.5" />
              <MessageBubble isUser first text="Dale, gracias" timestamp={at(11, 35)} status="sent" className="mt-2" />
              <MessageBubble isUser first={false} text="Una cosa más" timestamp={at(11, 36)} status="sending" className="mt-0.5" />
              {typing && <div className="mt-2"><TypingIndicator avatar="ZAHIA" /></div>}
              <div className="mt-3"><AIInput variant="chat" id="ds-chat-input" placeholder="Mensaje" minHeight={44} maxHeight={140} onSubmit={() => true} /></div>
            </div>
          </div>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setTyping((t) => !t)}>{typing ? 'Que deje de escribir' : 'Que escriba'}</Button>
        </div>
        <ul className="space-y-1.5 lg:col-span-2">
          <Rule ok>Burbujas sin borde, con sombra mínima y cola solo en la primera de cada grupo.</Rule>
          <Rule ok>Hora adentro de la burbuja, abajo a la derecha. Tildes en los mensajes propios: reloj (enviando), ✓ (guardado) y ✓✓ azul cuando el agente respondió.</Rule>
          <Rule ok>Separador de día como chip centrado y aviso de IA como chip amarillo suave.</Rule>
          <Rule ok>Un solo botón redondo en la barra: micrófono si está vacía, enviar si hay texto.</Rule>
          <Rule ok>Fondo con papel tapiz de íconos deportivos, siempre muy suave.</Rule>
          <Rule ok={false}>Líneas de color en el borde de burbujas o del indicador “escribiendo”.</Rule>
          <Rule ok={false}>Un avatar al lado de cada burbuja en un chat 1 a 1: el encabezado ya dice quién es.</Rule>
        </ul>
      </div>
    </Section>
  );
};
