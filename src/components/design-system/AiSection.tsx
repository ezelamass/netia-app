import { useEffect, useState } from 'react';
import { AGENTS, AVATAR_IDS } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play';
import { AIBadge, AIMark, AIShimmerText, AIStages, AISuggestionActions } from '@/components/ai';
import { Button } from '@/components/ui/button';
import { Replay, Rule, Section, SubTitle } from './parts';

const STAGES = ['Leyendo tu registro', 'Armando la sesión', 'Listo'];

export const AiSection = () => {
  const [thinking, setThinking] = useState(false);
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);
  const [used, setUsed] = useState<'use' | 'discard' | null>(null);

  useEffect(() => {
    setStage(0);
    const id = window.setInterval(() => setStage((s) => (s < STAGES.length ? s + 1 : s)), 900);
    return () => window.clearInterval(id);
  }, [run]);

  return (
    <Section
      id="ia"
      title="IA"
      lead="En NETIA la IA es el equipo: TINO, ZAHIA y ROMA. Su señal exclusiva es el gradiente del equipo (azul → verde → violeta). Solo la IA lo usa, y siempre como trazo chico: nunca como fondo de una tarjeta, sección, botón o banner."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SubTitle>Gradiente y marca</SubTitle>
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-mono text-xs font-medium">--ai-gradient</p>
              <div className="mt-2 h-2 rounded-full bg-ai" />
              <p className="mt-1 text-xs text-muted-foreground">TINO → ZAHIA → ROMA. Clase <code>bg-ai</code>.</p>
            </div>
            <div className="flex items-end gap-4">
              {([14, 16, 20] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <AIMark size={s} />
                  <span className="text-xs text-muted-foreground tabular-nums">{s}px</span>
                </div>
              ))}
              <p className="text-sm">
                Con <span className="bg-ai bg-clip-text font-semibold text-transparent">IA</span> en un titular
              </p>
            </div>
          </div>
        </div>

        <div>
          <SubTitle>Avatar del agente (3 estados)</SubTitle>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col items-center gap-2"><AgentAvatar agent="TINO" size={48} /><span className="text-xs text-muted-foreground">idle</span></div>
              <div className="flex flex-col items-center gap-2"><AgentAvatar agent="ZAHIA" size={48} state={thinking ? 'thinking' : 'idle'} /><span className="text-xs text-muted-foreground">thinking</span></div>
              <div className="flex flex-col items-center gap-2"><AgentAvatar agent="ROMA" size={48} state="unread" /><span className="text-xs text-muted-foreground">unread</span></div>
              <Button size="sm" variant="outline" onClick={() => setThinking((t) => !t)}>{thinking ? 'Dejar de pensar' : 'Hacer que piense'}</Button>
            </div>
            <p className="text-xs text-muted-foreground">El brillo es información: se enciende solo cuando el agente trabaja o hay algo sin leer. Nunca en reposo.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <SubTitle>Firma y acciones sobre lo que escribe la IA</SubTitle>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <AIBadge agent="TINO" />
            <p className="text-sm">Hoy: 15 minutos de movilidad y dos series cortas de velocidad.</p>
            {used ? (
              <p className="text-sm text-muted-foreground" role="status">{used === 'use' ? 'Usaste la sugerencia.' : 'Descartaste la sugerencia.'}</p>
            ) : (
              <AISuggestionActions onUse={() => setUsed('use')} onDiscard={() => setUsed('discard')} />
            )}
            {used && <Button size="sm" variant="ghost" onClick={() => setUsed(null)}>Volver a mostrar</Button>}
          </div>
        </div>

        <div>
          <SubTitle>Esperas de IA</SubTitle>
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <Replay label="AIStages (más de 2 s): etapas reales" onReplay={() => setRun((r) => r + 1)}>
              <AIStages stages={STAGES} current={stage} />
            </Replay>
            <div>
              <p className="mb-2 text-sm font-semibold">AIShimmerText: shimmer platino, no de color</p>
              <AIShimmerText lines={3} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <SubTitle>¿Sujeto o adjetivo? La pregunta que decide</SubTitle>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
            <div>
              <p className="font-semibold">La IA es el sujeto de la pantalla → <code>AgentAvatar</code></p>
              <p className="text-muted-foreground">“TINO está acá”. Chat, lista de chats, “Tu equipo”. 24 px o más.</p>
              <div className="mt-2 flex gap-2">{AVATAR_IDS.map((id) => <AgentAvatar key={id} agent={id} size={32} />)}</div>
            </div>
            <div>
              <p className="font-semibold">La IA es un adjetivo → <code>AIMark</code></p>
              <p className="text-muted-foreground">“Esto lo armó la IA”: un plan sugerido, un consejo, el botón “Preguntar”. 14 a 20 px.</p>
              <Button size="sm" variant="outline" className="mt-2 gap-1.5"><AIMark size={14} />Preguntarle a {AGENTS.TINO.name}</Button>
            </div>
          </div>
        </div>

        <div>
          <SubTitle>Reglas de producto</SubTitle>
          <ul className="space-y-1.5">
            <Rule ok>Todo lo que escribe la IA va firmado (<code className="text-xs">AIBadge</code> o el avatar del agente) mientras nadie lo revisó.</Rule>
            <Rule ok>Toda salida se puede usar o descartar. El botón se llama “Usar”, nunca “Aceptar”.</Rule>
            <Rule ok>Si no hay un porcentaje real, se muestran etapas, no una barra de progreso.</Rule>
            <Rule ok>El primer mensaje de cada agente avisa: “Soy una IA: puedo equivocarme. Si algo te duele o te preocupa, contale a un adulto.”</Rule>
            <Rule ok={false}>Que la IA avise sola al entrenador, cambie el plan del club o escriba a la familia. Propone; una persona confirma.</Rule>
            <Rule ok={false}>Gradiente del equipo en fondos, bordes de tarjetas o texto de cuerpo.</Rule>
            <Rule ok={false}>Usar el ícono de IA para algo que no lo hizo la IA (por ejemplo “Vista previa”).</Rule>
          </ul>
        </div>
      </div>
    </Section>
  );
};
