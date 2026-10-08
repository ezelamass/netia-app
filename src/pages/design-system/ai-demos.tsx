import { useEffect, useId, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS, AVATAR_IDS, type AvatarId } from '@/lib/avatars';
import { Button } from '@/components/ui/button';
import { AgentAvatar } from '@/components/play';
import { Panel, Rule, Section, Sub } from './parts';
import './demos.css';

/* Versiones de demo de los componentes de src/components/ai (spec 10 §2.4).
   Cuando el hilo "Implementar branding IA y UI" las publique, se reemplazan por los imports reales. */

export const AIMark = ({ size = 16, title, className }: { size?: 14 | 16 | 20; title?: string; className?: string }) => {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={id} x1="0.1" y1="0.5" x2="0.9" y2="0.5">
          <stop offset="0" style={{ stopColor: 'hsl(var(--avatar-tino))' }} />
          <stop offset="0.5" style={{ stopColor: 'hsl(var(--avatar-zahia))' }} />
          <stop offset="1" style={{ stopColor: 'hsl(var(--avatar-roma))' }} />
        </linearGradient>
      </defs>
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill={`url(#${id})`} />
    </svg>
  );
};

const DOT: Record<AvatarId, string> = { TINO: 'bg-tino', ZAHIA: 'bg-zahia', ROMA: 'bg-roma' };
export type AvatarState = 'idle' | 'thinking' | 'unread';

export const StatefulAvatar = ({ agent, state, size = 48 }: { agent: AvatarId; state: AvatarState; size?: 24 | 32 | 48 }) => (
  <span className="relative inline-flex">
    <span className={cn('inline-flex rounded-full', state === 'thinking' && 'ds-ai-ring is-thinking')}>
      <AgentAvatar agent={agent} size={size} />
    </span>
    {state === 'unread' && <span className={cn('absolute right-0 top-0 h-2.5 w-2.5 rounded-full ring-2 ring-card', DOT[agent])} aria-label="Sin leer" />}
  </span>
);

export const AIBadge = ({ agent = 'TINO' }: { agent?: AvatarId }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
    <AIMark size={14} />Sugerido por {AGENTS[agent].name}
  </span>
);

export const AISuggestionActions = ({ onUse, onDiscard }: { onUse?: () => void; onDiscard?: () => void }) => (
  <div className="flex gap-2">
    <Button size="sm" onClick={onUse}>Usar</Button>
    <Button size="sm" variant="ghost" onClick={onDiscard}>Descartar</Button>
  </div>
);

export const AIShimmerText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2" role="status" aria-label="La IA está trabajando">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={cn('ds-shimmer h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);

export const NetiaLoader = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
  <span className="inline-flex items-center gap-1" role="status" aria-label="Cargando">
    {['bg-tino', 'bg-zahia', 'bg-roma'].map((c) => (
      <span key={c} className={cn('ds-jump-dot rounded-full', c, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5')} />
    ))}
  </span>
);

const STAGES = ['Leyendo tu registro', 'Armando la sesión', 'Listo'];
export const AIStages = ({ runKey }: { runKey: number }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const t = setInterval(() => setI((n) => Math.min(n + 1, STAGES.length)), 900);
    return () => clearInterval(t);
  }, [runKey]);
  return (
    <ol className="space-y-1.5 text-sm" aria-live="polite">
      {STAGES.map((s, n) => (
        <li key={s} className={cn('flex items-center gap-2', n > i && 'text-muted-foreground opacity-60')}>
          {n < i ? <Check className="h-4 w-4 text-success" aria-hidden="true" /> : n === i ? <NetiaLoader size="sm" /> : <span className="h-4 w-4" />}
          <span className={cn(n === i && 'font-medium')}>{s}</span>
        </li>
      ))}
    </ol>
  );
};

const RULES_IA = [
  'Todo lo que escribe la IA va firmado (AIBadge o el avatar del agente) mientras nadie lo revisó.',
  'Toda salida se puede descartar: botones “Usar” y “Descartar”, nunca “Aceptar”.',
  'Si no hay un porcentaje real, se muestran etapas, no una barra de progreso.',
  'El brillo o anillo del avatar se enciende solo cuando trabaja o hay algo sin leer. El brillo es información: nunca en reposo.',
  'La IA no decide sola nada importante sobre un chico: no avisa al entrenador, no cambia el plan del club, no escribe a la familia. Propone; una persona confirma.',
  'Primer mensaje de cada agente, siempre: “Soy una IA: puedo equivocarme. Si algo te duele o te preocupa, contale a un adulto.”',
];

export const AiSection = () => {
  const [state, setState] = useState<AvatarState>('idle');
  const [run, setRun] = useState(0);
  const [used, setUsed] = useState<'use' | 'discard' | null>(null);
  return (
    <Section
      id="ia"
      title="Branding IA"
      lead="En NETIA la IA es el equipo: TINO, ZAHIA y ROMA. Su señal exclusiva es el gradiente del equipo (azul → verde → violeta). Nada más en la app lo usa, para que nadie confunda lo que hizo él con lo que escribió un modelo."
    >
      <div className="ds-scope space-y-2">
        <Sub>Gradiente del equipo (--ai-gradient)</Sub>
        <Panel className="flex items-center gap-4">
          <div className="bg-ai h-10 w-40 shrink-0 rounded-md" />
          <p className="text-sm text-muted-foreground">Es un <strong className="text-foreground">trazo</strong>, nunca una superficie: ícono, anillo del avatar, subrayado fino o una sola palabra de un titular de landing (“con <span className="bg-ai bg-clip-text font-semibold text-transparent">IA</span>”). Prohibido en fondos de tarjetas, botones, banners y texto de cuerpo.</p>
        </Panel>

        <Sub>¿Avatar o trazo? La pregunta que decide</Sub>
        <p className="mb-2 text-sm">¿La IA es el <strong>sujeto</strong> de esta pantalla o un <strong>adjetivo</strong> de otra cosa?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Panel>
            <p className="font-heading font-semibold">Sujeto → AgentAvatar</p>
            <p className="mb-3 text-sm text-muted-foreground">“TINO está acá”: chat, lista de chats, “Tu equipo”, nota del agente. Desde 24px.</p>
            <div className="flex items-center gap-3">{AVATAR_IDS.map((id) => <AgentAvatar key={id} agent={id} size={32} />)}</div>
          </Panel>
          <Panel>
            <p className="font-heading font-semibold">Adjetivo → AIMark</p>
            <p className="mb-3 text-sm text-muted-foreground">“Esto lo armó la IA”: plan sugerido, consejo, campo completado, botón “Preguntarle a TINO”. 14–20px.</p>
            <div className="flex items-center gap-3"><AIMark size={14} /><AIMark size={16} /><AIMark size={20} /></div>
          </Panel>
        </div>

        <Sub>Estados del avatar</Sub>
        <Panel className="flex flex-wrap items-center gap-6">
          {AVATAR_IDS.map((id) => (
            <div key={id} className="flex flex-col items-center gap-1">
              <StatefulAvatar agent={id} state={state} />
              <span className="text-xs text-muted-foreground">{AGENTS[id].name}</span>
            </div>
          ))}
          <div role="group" aria-label="Estado del avatar" className="ml-auto inline-flex rounded-lg border border-border p-0.5">
            {(['idle', 'thinking', 'unread'] as AvatarState[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={state === s}
                onClick={() => setState(s)}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', state === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                {s === 'idle' ? 'Reposo' : s === 'thinking' ? 'Pensando' : 'Sin leer'}
              </button>
            ))}
          </div>
        </Panel>

        <Sub>Contenido de IA: firmado y descartable (AIBadge + AISuggestionActions)</Sub>
        <Panel>
          {used ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">{used === 'use' ? 'Sesión agregada a tu semana.' : 'Sugerencia descartada.'}</p>
              <Button size="sm" variant="ghost" onClick={() => setUsed(null)}>Deshacer</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AIBadge agent="TINO" />
              <p className="text-sm">Mañana: movilidad de cadera 15 min y técnica de pase. Sin carga fuerte, venís de dos días seguidos.</p>
              <AISuggestionActions onUse={() => setUsed('use')} onDiscard={() => setUsed('discard')} />
            </div>
          )}
        </Panel>

        <Sub>Esperas de IA: etapas reales (AIStages) y placeholder platino (AIShimmerText)</Sub>
        <div className="grid gap-3 sm:grid-cols-2">
          <Panel>
            <AIStages runKey={run} />
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setRun((n) => n + 1)}>Reproducir</Button>
          </Panel>
          <Panel>
            <AIShimmerText />
            <p className="mt-3 text-xs text-muted-foreground">El color dice “IA”, el movimiento dice “trabajando”: por eso el shimmer es platino y no de color.</p>
          </Panel>
        </div>

        <Sub>Reglas de producto</Sub>
        <ol className="space-y-1.5">
          {RULES_IA.map((r, i) => <Rule key={i} ok>{r}</Rule>)}
          <Rule ok={false}>Usar <code className="text-xs">Sparkles</code> de Lucide para algo que no sea IA, o un ícono de chispa genérico para la IA. Para “vista previa” se usa <code className="text-xs">Eye</code>.</Rule>
        </ol>
      </div>
    </Section>
  );
};
