import { useEffect, useState } from 'react';
import { AIStages } from '@/components/ai';
import { NetiaLoader } from '@/components/ui/netia-loader';
import { Skeleton } from '@/components/ui/skeleton';
import { Replay, Rule, Section, SubTitle } from './parts';

const STAGES = ['Leyendo tu registro', 'Armando la sesión', 'Listo'];

const COPY: [string, string][] = [
  ['Arranque de la app', 'Sin texto: logo y los tres puntos del equipo'],
  ['Entrenar', 'Preparando tu sesión…'],
  ['Calendario', 'Ordenando tu semana…'],
  ['Plan con IA', 'Leyendo tu registro → Armando la sesión → Listo'],
];

export const LoadingSection = () => {
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    setStage(0);
    const id = window.setInterval(() => setStage((s) => (s < STAGES.length ? s + 1 : s)), 900);
    return () => window.clearInterval(id);
  }, [run]);

  return (
    <Section id="carga" title="Carga" lead="Nunca una pantalla en blanco: cada espera tiene una forma. El color nunca se mezcla con el movimiento: el shimmer es platino y la IA es la única que usa el gradiente del equipo.">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <SubTitle>Splash de arranque (antes de que monte React)</SubTitle>
          <div className="flex h-44 flex-col items-center justify-center gap-5 rounded-xl border border-border bg-white">
            <img src="/apple-touch-icon.png" alt="NETIA" width={72} height={72} className="h-[72px] w-[72px]" />
            <span className="flex items-end gap-2" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-tino animate-dot-hop" />
              <span className="h-2.5 w-2.5 rounded-full bg-zahia animate-dot-hop [animation-delay:150ms]" />
              <span className="h-2.5 w-2.5 rounded-full bg-roma animate-dot-hop [animation-delay:300ms]" />
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">HTML y CSS inline en <code>index.html</code> (menos de 2 KB, sin JS). Se va con un fade de 150 ms apenas pinta React.</p>
        </div>

        <div>
          <SubTitle>Skeleton con shimmer platino</SubTitle>
          <div className="space-y-2 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Con la forma del contenido final. Reemplaza al pulso: el movimiento va de lado a lado, no titila.</p>
        </div>

        <div>
          <SubTitle>NetiaLoader: espera corta (menos de 2 s)</SubTitle>
          <div className="flex items-center justify-around rounded-xl border border-border bg-card p-6">
            <NetiaLoader size="sm" />
            <NetiaLoader size="md" message="Guardando…" />
          </div>
        </div>

        <Replay label="AIStages: espera de IA (más de 2 s)" onReplay={() => setRun((r) => r + 1)}>
          <AIStages stages={STAGES} current={stage} />
        </Replay>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <SubTitle>Microcopy por contexto (una por pantalla, nunca al azar)</SubTitle>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Textos de carga</caption>
              <tbody>
                {COPY.map(([a, b]) => (
                  <tr key={a} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 font-medium">{a}</td>
                    <td className="px-3 py-2 text-muted-foreground">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <SubTitle>Reglas</SubTitle>
          <ul className="space-y-1.5">
            <Rule ok>Skeleton solo si la carga pasa los 150 ms; una vez mostrado, queda al menos 300 ms (<code className="text-xs">useDelayedFlag</code>). Así no parpadea.</Rule>
            <Rule ok>Los errores dicen qué pasó, qué hacer y tienen botón “Reintentar”.</Rule>
            <Rule ok={false}>Una barra de porcentaje que no se mide de verdad: usá etapas.</Rule>
            <Rule ok={false}>Un spinner a pantalla completa.</Rule>
          </ul>
        </div>
      </div>
    </Section>
  );
};
