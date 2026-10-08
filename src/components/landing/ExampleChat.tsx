import { AGENTS, type AvatarId } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play/AgentAvatar';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { SystemChip, AI_NOTICE } from '@/components/chat/SystemChip';
import { cn } from '@/lib/utils';

const at = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const EXAMPLE: Record<AvatarId, { from: 'user' | 'agent'; text: string; time: string }[]> = {
  TINO: [
    { from: 'user', text: 'Mañana juego a las 10. ¿Qué hago hoy?', time: at(18, 4) },
    { from: 'agent', text: 'Hoy suave: 15 minutos de movilidad y dos series cortas de velocidad. Mañana vas a llegar fresco.', time: at(18, 5) },
    { from: 'user', text: '¿Y si me quedó cargada la pierna?', time: at(18, 6) },
  ],
  ZAHIA: [
    { from: 'user', text: '¿Qué como antes del partido de las 17?', time: at(11, 32) },
    { from: 'agent', text: 'Almorzá 3 horas antes: arroz o pasta con pollo y mucha agua. Nada de frituras.', time: at(11, 33) },
    { from: 'user', text: '¿Y una banana en el entretiempo?', time: at(11, 34) },
  ],
  ROMA: [
    { from: 'user', text: 'Estoy muy nervioso por la final.', time: at(20, 12) },
    { from: 'agent', text: 'Es normal: significa que te importa. Probá 5 respiraciones lentas y pensá en tu primera jugada.', time: at(20, 13) },
    { from: 'user', text: 'Dale, lo pruebo ahora.', time: at(20, 14) },
  ],
};

/** Mini chat estático para las landings: reusa las burbujas reales. Los datos son de ejemplo y se marcan como tales. */
export const ExampleChat = ({ agent = 'ZAHIA', className }: { agent?: AvatarId; className?: string }) => (
  <figure className={cn('mx-auto w-full max-w-md', className)}>
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-3">
        <AgentAvatar agent={agent} size={40} />
        <div className="leading-tight">
          <p className="text-base font-semibold">{AGENTS[agent].name}</p>
          <p className="text-xs text-muted-foreground">{AGENTS[agent].area}</p>
        </div>
      </div>
      <div className="chat-wallpaper space-y-0.5 px-3 py-3">
        <SystemChip className="mb-2">{AI_NOTICE}</SystemChip>
        {EXAMPLE[agent].map((m, i) => (
          <MessageBubble
            key={i}
            isUser={m.from === 'user'}
            text={m.text}
            first={i === 0 || EXAMPLE[agent][i - 1].from !== m.from}
            timestamp={m.time}
            status={m.from === 'user' ? (i === EXAMPLE[agent].length - 1 ? 'sent' : 'read') : undefined}
            className={i > 0 && EXAMPLE[agent][i - 1].from !== m.from ? 'mt-2' : undefined}
          />
        ))}
      </div>
    </div>
    <figcaption className="mt-2 text-center text-xs text-muted-foreground">Conversación de ejemplo</figcaption>
  </figure>
);
