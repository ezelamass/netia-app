import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Check, CheckCheck, Clock, EllipsisVertical, Mic, SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/avatars';
import { Button } from '@/components/ui/button';
import { AgentAvatar, IconBadge } from '@/components/play';
import { ICONS } from '@/lib/icons';
import { StatefulAvatar } from './ai-demos';
import { Panel, Rule, Section, Sub } from './parts';
import './demos.css';

type Status = 'sending' | 'sent' | 'read';

const Ticks = ({ status }: { status: Status }) =>
  status === 'sending' ? <Clock className="h-3 w-3" aria-label="Enviando" />
    : status === 'sent' ? <Check className="h-3.5 w-3.5" aria-label="Enviado" />
      : <CheckCheck className="h-3.5 w-3.5 text-info" aria-label="Leído" />;

const Bubble = ({ out, first, time, status, fresh, children }: { out?: boolean; first?: boolean; time: string; status?: Status; fresh?: boolean; children: ReactNode }) => (
  <div className={cn('flex', out ? 'justify-end' : 'justify-start', fresh && (out ? 'ds-bubble-r' : 'ds-bubble-l'))}>
    <div className={cn('ds-bubble relative max-w-[80%] rounded-lg px-2.5 py-1.5 text-sm leading-relaxed lg:max-w-[65%]', out ? 'ds-out' : 'bg-card', first && 'ds-tail', first && (out ? 'ds-tail-out rounded-tr-none' : 'ds-tail-in rounded-tl-none'))}>
      <span className="whitespace-pre-wrap break-words">{children}</span>
      <span className="float-right ml-2 mt-2 inline-flex items-center gap-0.5 text-xs tabular-nums text-muted-foreground">
        {time}{out && status && <Ticks status={status} />}
      </span>
    </div>
  </div>
);

const DayChip = ({ children }: { children: ReactNode }) => (
  <div className="sticky top-2 z-10 flex justify-center">
    <span className="ds-bubble rounded-md bg-card/90 px-2.5 py-1 text-xs font-medium">{children}</span>
  </div>
);

const SystemChip = ({ children }: { children: ReactNode }) => (
  <div className="flex justify-center">
    <p className="ds-sys ds-bubble max-w-sm rounded-md px-2.5 py-1.5 text-center text-xs">{children}</p>
  </div>
);

const ChatDemo = () => {
  const [step, setStep] = useState<'idle' | 'sending' | 'sent' | 'typing' | 'read'>('read');
  const [draft, setDraft] = useState('');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const play = () => {
    timers.current.forEach(clearTimeout);
    setStep('sending');
    timers.current = [
      window.setTimeout(() => setStep('sent'), 700),
      window.setTimeout(() => setStep('typing'), 1400),
      window.setTimeout(() => setStep('read'), 3200),
    ];
  };
  const typing = step === 'typing';
  const status: Status = step === 'sending' ? 'sending' : step === 'sent' || step === 'typing' ? 'sent' : 'read';

  return (
    <div className="space-y-3">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 border-b border-border/60 bg-card px-2 py-2">
          <button type="button" aria-label="Volver a la lista de chats" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <StatefulAvatar agent="TINO" state={typing ? 'thinking' : 'idle'} size={32} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{AGENTS.TINO.name}</p>
            <p className={cn('text-xs leading-tight', typing ? 'text-tino' : 'text-muted-foreground')} aria-live="polite">{typing ? 'escribiendo…' : 'Entreno'}</p>
          </div>
          <button type="button" aria-label="Más opciones" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <EllipsisVertical className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="ds-chat-bg relative">
          <div className="relative max-h-96 space-y-1.5 overflow-y-auto px-3 py-3">
            <DayChip>Hoy</DayChip>
            <SystemChip>Soy una IA: puedo equivocarme. Si algo te duele o te preocupa, contale a un adulto.</SystemChip>
            <Bubble first time="14:30">¡Hola! Soy TINO, tu coach de entrenamiento. ¿Cómo sentiste las piernas hoy?</Bubble>
            <Bubble out first time="14:31" status="read">Pesadas, ayer jugué dos partidos</Bubble>
            <Bubble time="14:31">Tiene sentido. Mañana hacé movilidad y técnica, sin carga fuerte.</Bubble>
            {step !== 'idle' && (
              <Bubble out first fresh time="14:33" status={status}>¿Puedo sumar una sesión de pase?</Bubble>
            )}
            {typing && (
              <div className="ds-bubble-l ds-bubble ds-tail ds-tail-in relative w-fit rounded-lg rounded-tl-none bg-card px-3 py-2.5" role="status" aria-label="TINO está escribiendo">
                <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="ds-typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />)}</span>
              </div>
            )}
            {step === 'read' && (
              <Bubble first fresh time="14:34">Sí, 20 minutos de pase y recepción, a ritmo suave. ¿La agrego a tu semana?</Bubble>
            )}
          </div>
          <div className="relative flex items-center gap-2 px-2 pb-2 pt-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Mensaje"
              aria-label="Mensaje"
              className="ds-bubble h-11 min-w-0 flex-1 rounded-3xl bg-card px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              aria-label={draft ? 'Enviar' : 'Grabar audio'}
              onClick={draft ? () => { setDraft(''); play(); } : undefined}
              className="ds-press relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span key={draft ? 's' : 'm'} className="ds-pop-in inline-flex">
                {draft ? <SendHorizontal className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center"><Button size="sm" variant="outline" onClick={play}>Reproducir envío (reloj → ✓ → ✓✓ azul)</Button></div>
    </div>
  );
};

const CHAT_RULES: [boolean, string][] = [
  [true, 'Lista de chats → conversación → atrás, como WhatsApp. En mobile la barra inferior se oculta dentro de la conversación.'],
  [true, 'Burbujas sin borde, con sombra mínima, radio 8 px y cola solo en la primera de cada grupo. Hora dentro de la burbuja, abajo a la derecha.'],
  [true, 'Tildes en lo que manda el usuario: reloj (enviando), ✓ gris (enviado), ✓✓ azul (el agente respondió).'],
  [true, 'Estado del agente en el header: su área en reposo, “escribiendo…” mientras responde, con el avatar en estado pensando.'],
  [true, 'Un solo botón circular de 44 px: micrófono si el campo está vacío, enviar si hay texto.'],
  [true, 'Aviso honesto de IA como primer chip de sistema de cada conversación (chicos de 8 a 16 años).'],
  [false, 'Avatar en cada burbuja del 1 a 1 (el header ya dice quién es), bordes de color por agente o fuente distinta a Inter en las burbujas.'],
];

export const ChatSection = () => (
  <Section
    id="chat"
    title="Chat"
    lead="Tiene que parecerse lo suficiente a WhatsApp como para que un chico o un padre lo use sin aprender nada. Este es el patrón; la demo es interactiva."
  >
    <div className="ds-scope">
      <ChatDemo />
      <Sub>Reglas</Sub>
      <ol className="space-y-1.5">{CHAT_RULES.map(([ok, t]) => <Rule key={t} ok={ok}>{t}</Rule>)}</ol>
    </div>
  </Section>
);

const BANS: [string, string][] = [
  ['Bordes de acento de color en tarjetas, burbujas, alertas o filas. La identidad ya la da el avatar y el nombre.', 'JER-02 · ESP-04'],
  ['Borde + sombra + color a la vez para destacar algo: subí la escala o el peso.', 'JER-02'],
  ['Tarjeta dentro de tarjeta.', 'MOB-09'],
  ['Dos botones sólidos en el mismo bloque: el segundo va ghost u outline.', 'CMP-07 · CTA-02'],
  ['Tamaños de texto arbitrarios (text-[11px], text-[13px]): solo la escala de Tailwind, mínimo text-xs.', 'TIP-02'],
  ['Espaciados fuera de la escala 4/8 (p-[13px], gap-[18px], mt-[22px]).', 'ESP-01'],
  ['Íconos mezclados (rellenos y de línea, grosores distintos) o emojis como ícono.', 'CMP-04'],
  ['Cajas de ícono con gradiente y gradientes decorativos.', 'COL-03'],
  ['Mayúsculas sostenidas con tracking 0, o en botones de acción.', 'TIP-05 · TIP-07 · CTA-03'],
  ['Badges redundantes: ícono y texto que dicen lo mismo, o que repiten el contexto.', 'CMP-05'],
  ['Divisores gruesos u oscuros (más de 1 px).', 'COL-08'],
  ['Todo centrado en pantallas de datos: alineá al eje izquierdo. Centrado solo en estados vacíos y héroes.', 'ESP-02'],
  ['Acciones sin confirmación visible (copiar, guardar, registrar sin feedback).', 'CMP-03'],
];

const TeamCard = ({ bad }: { bad?: boolean }) => (
  <div className={cn('flex items-center gap-3 rounded-2xl bg-card p-4', bad ? 'ds-bad-accent border border-border/60 shadow-sm' : 'shadow-card')}>
    <AgentAvatar agent="TINO" size={48} />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold">TINO</p>
      <p className="text-xs text-muted-foreground">Entreno</p>
    </div>
    <Button size="sm" variant="outline">Preguntar</Button>
  </div>
);

export const CriterioSection = () => (
  <Section
    id="criterio"
    title="Criterio visual"
    lead="Trece tics de interfaz generada por IA que no se hacen más. Cada uno cita la regla de UX que lo respalda. Lo que se pueda automatizar lo chequea scripts/check-ui-bans.mjs (npm run lint:ui)."
  >
    <Sub>Antes y después: tarjeta de “Tu equipo”</Sub>
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel className="space-y-3 bg-muted/40">
        <p className="text-sm font-semibold text-danger">Antes: línea de color arriba</p>
        <TeamCard bad />
        <p className="text-xs text-muted-foreground">Borde de 3 px + borde + sombra: tres señales para decir lo que el avatar ya dice.</p>
      </Panel>
      <Panel className="space-y-3 bg-muted/40">
        <p className="text-sm font-semibold text-success">Después: sin borde de color</p>
        <TeamCard />
        <p className="text-xs text-muted-foreground">La jerarquía sale de la escala y el peso del texto. El avatar identifica al agente.</p>
      </Panel>
    </div>

    <Sub>Lo que no se hace</Sub>
    <ol className="space-y-2">
      {BANS.map(([t, r], i) => (
        <li key={t} className="flex gap-2 text-sm">
          <span className="w-6 shrink-0 font-semibold tabular-nums text-danger">{i + 1}.</span>
          <span>{t} <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{r}</span></span>
        </li>
      ))}
    </ol>

    <Sub>Qué usar en su lugar</Sub>
    <div className="flex flex-wrap items-center gap-2">
      <IconBadge icon={ICONS.alert.icon} tone="warning" />
      <p className="text-sm text-muted-foreground">El tipo de aviso se comunica con un <strong className="text-foreground">IconBadge</strong> de tono y, si no está leído, un punto más un fondo suave. No con una línea de color al costado.</p>
    </div>
  </Section>
);
