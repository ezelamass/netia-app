import { useEffect, useRef, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/play';
import { AIShimmerText, AIStages, NetiaLoader } from './ai-demos';
import { Panel, Rule, Section, Sub } from './parts';
import './demos.css';

const TOKENS: [string, string, string][] = [
  ['--dur-fast', '120 ms', 'Press, hover, cambio de ícono'],
  ['--dur-base', '200 ms', 'Entradas y salidas de elementos chicos, burbujas, toasts'],
  ['--dur-slow', '320 ms', 'Hojas, cambio de página, celebraciones'],
  ['--ease-out', 'cubic-bezier(.2,.8,.2,1)', 'Default para todo lo que entra'],
  ['--ease-in', 'cubic-bezier(.4,0,1,1)', 'Lo que sale (siempre más rápido que lo que entra)'],
  ['--ease-spring', 'cubic-bezier(.34,1.56,.64,1)', 'Solo momentos: logro, racha, XP'],
];

const CountUp = ({ to, runKey }: { to: number; runKey: number }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setN(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 600, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, runKey]);
  return <span className="tabular-nums">{n.toLocaleString('es-AR')}</span>;
};

const Demo = ({ title, hint, children, onPlay, label = 'Reproducir' }: { title: string; hint: string; children: React.ReactNode; onPlay?: () => void; label?: string }) => (
  <Panel className="flex flex-col gap-3">
    <div>
      <p className="font-heading text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
    <div className="flex min-h-16 flex-1 items-center">{children}</div>
    {onPlay && <Button size="sm" variant="outline" className="self-start" onClick={onPlay}>{label}</Button>}
  </Panel>
);

export const MotionSection = () => {
  const [stagger, setStagger] = useState(0);
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badge, setBadge] = useState(0);
  const [tab, setTab] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const [saving, setSaving] = useState(false);
  const save = () => { setSaving(true); setSaved((n) => n + 1); later(() => setSaving(false), 1000); };
  const [showXp, setShowXp] = useState(false);
  const earn = () => { setXp((n) => n + 1); setShowXp(true); later(() => setShowXp(false), 750); };

  return (
    <Section
      id="movimiento"
      title="Movimiento"
      lead="Todo movimiento comunica algo: que algo entró, que se guardó, que la IA trabaja, que ganaste algo. En la app va en CSS puro (sin framer-motion, que queda solo para landings). Probá cada demo con “Reproducir”."
    >
      <div className="ds-scope">
        <Sub>Tokens</Sub>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Tokens de movimiento</caption>
            <tbody>
              {TOKENS.map(([t, v, u]) => (
                <tr key={t} className="border-b border-border last:border-0">
                  <th scope="row" className="whitespace-nowrap px-3 py-2 font-mono text-xs font-medium">{t}</th>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs tabular-nums">{v}</td>
                  <td className="px-3 py-2 text-muted-foreground">{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Sub>Micro animaciones</Sub>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Demo title="Press" hint="active:scale-[.97], 120 ms. En botones, chips y filas tocables.">
            <Button className="ds-press">Tocame y mantené</Button>
          </Demo>

          <Demo title="Indicador que se desliza" hint="Una pill que se mueve con transform. Tabs y nav inferior." >
            <div role="tablist" className="relative grid w-full grid-cols-3 rounded-lg bg-muted p-1">
              <span aria-hidden="true" className="ds-slide absolute inset-y-1 left-1 rounded-md bg-card shadow-card" style={{ transform: `translateX(${tab * 100}%)`, width: 'calc((100% - 0.5rem) / 3)' }} />
              {['Hoy', 'Semana', 'Mes'].map((l, i) => (
                <button key={l} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className="relative z-10 rounded-md py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{l}</button>
              ))}
            </div>
          </Demo>

          <Demo title="Entrada escalonada" hint="fade-up con 30 ms entre ítems, máximo 6, solo en la primera carga." onPlay={() => setStagger((n) => n + 1)}>
            <ul key={stagger} className="w-full space-y-1.5">
              {['Entreno de técnica', 'Charla de nutrición', 'Partido amistoso', 'Descanso'].map((t, i) => (
                <li key={t} className="ds-fade-up rounded-lg border border-border bg-card px-3 py-1.5 text-sm" style={{ '--i': i } as React.CSSProperties}>{t}</li>
              ))}
            </ul>
          </Demo>

          <Demo title="Conteo de números" hint="600 ms, ease-out, solo la primera vez que entra en pantalla." onPlay={() => setCount((n) => n + 1)}>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold"><CountUp to={1240} runKey={count} /></span>
              <span className="text-sm text-muted-foreground">XP</span>
            </div>
          </Demo>

          <Demo title="Guardado confirmado" hint="El botón muestra un check dibujándose ~1 s y vuelve a su texto.">
            <Button onClick={save} className="min-w-32 ds-press" disabled={saving}>
              {saving ? (
                <svg key={saved} className="ds-check h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Guardado"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              ) : 'Guardar registro'}
            </Button>
          </Demo>

          <Demo title="XP ganada" hint="“+20 XP” sube y se desvanece desde el botón.">
            <div className="relative">
              <Button onClick={earn} className="ds-press">Completar sesión</Button>
              {showXp && <span key={xp} className="ds-float-up pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 text-sm font-bold text-primary" aria-live="polite">+20 XP</span>}
            </div>
          </Demo>

          <Demo title="Sube la racha" hint="La llama hace wiggle y el número entra con pop-in." onPlay={() => setStreak((n) => n + 1)} label="Sumar un día">
            <div className="flex items-center gap-3">
              <span key={`f${streak}`} className={cn('inline-flex', streak > 0 && 'ds-wiggle')}><IconBadge icon={Flame} tone="orange" /></span>
              <span key={`n${streak}`} className={cn('font-heading text-2xl font-bold tabular-nums', streak > 0 && 'ds-pop-in')}>{5 + streak}</span>
              <span className="text-sm text-muted-foreground">días de racha</span>
            </div>
          </Demo>

          <Demo title="Logro desbloqueado" hint="Pop-in con spring. El confeti (canvas-confetti) se importa dinámico solo al dispararse." onPlay={() => setBadge((n) => n + 1)}>
            <div key={badge} className="ds-pop-in flex items-center gap-3">
              <IconBadge icon={Trophy} tone="orange" />
              <div>
                <p className="text-sm font-semibold">Primera semana completa</p>
                <p className="text-xs text-muted-foreground">+100 XP</p>
              </div>
            </div>
          </Demo>

          <Demo title="Burbuja entrante" hint="Entra 8 px desde su lado, 200 ms. Solo mensajes nuevos.">
            <BubbleReplay />
          </Demo>
        </div>

        <Sub>Reglas</Sub>
        <ol className="space-y-1.5">
          <Rule ok>Entradas con <code className="text-xs">--ease-out</code>; las salidas, más rápidas que las entradas.</Rule>
          <Rule ok>Loops solo si llevan información: <code className="text-xs">shimmer</code> (cargando), <code className="text-xs">typing</code> y <code className="text-xs">ai-breathe</code> (la IA trabaja). Las landings pueden tener una animación ambiental por sección.</Rule>
          <Rule ok>Con <code className="text-xs">prefers-reduced-motion: reduce</code>: sin desplazamientos ni escalas, solo fades de hasta 120 ms. Probalo en DevTools → Rendering. Esta página ya lo respeta.</Rule>
          <Rule ok={false}>Demorar una acción para mostrar una animación: la navegación no espera la salida de la página anterior.</Rule>
          <Rule ok={false}>Animaciones decorativas en loop dentro de la app, o framer-motion en pantallas de la app.</Rule>
        </ol>
      </div>
    </Section>
  );
};

const BubbleReplay = () => {
  const [k, setK] = useState(0);
  return (
    <div className="flex w-full flex-col gap-2">
      <div key={k} className="ds-bubble-l ds-bubble w-fit max-w-full rounded-lg bg-card px-2.5 py-1.5 text-sm">¿Cómo sentiste las piernas hoy?</div>
      <Button size="sm" variant="outline" className="self-start" onClick={() => setK((n) => n + 1)}>Reproducir</Button>
    </div>
  );
};

export const LoadingSection = () => {
  const [run, setRun] = useState(0);
  const [splash, setSplash] = useState(0);
  return (
    <Section
      id="carga"
      title="Carga"
      lead="Nunca una pantalla en blanco ni un spinner a pantalla completa. Cada espera tiene una forma según cuánto dura y qué se espera."
    >
      <div className="ds-scope">
        <div className="grid gap-3 md:grid-cols-2">
          <Demo title="Arranque de la app (splash)" hint="HTML y CSS inline en index.html, sin JS, menos de 2 KB. Se quita en el primer render con un fade de 150 ms." onPlay={() => setSplash((n) => n + 1)}>
            <div key={splash} className="ds-fade-up flex h-36 w-full flex-col items-center justify-center gap-4 rounded-lg border border-border bg-background">
              <img src="/logo.png" alt="NETIA" width={40} height={40} className="h-10 w-10 rounded-md" />
              <NetiaLoader />
            </div>
          </Demo>

          <Demo title="Cambio de ruta: skeleton con shimmer platino" hint="Con la forma del contenido final. Reemplaza animate-pulse.">
            <div className="w-full space-y-3">
              <div className="ds-shimmer h-6 w-1/2" />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => <div key={i} className="ds-shimmer h-14" />)}
              </div>
              <AIShimmerText lines={2} />
            </div>
          </Demo>

          <Demo title="Espera corta sin forma conocida (NetiaLoader)" hint="Menos de 2 s: botón, guardar. Los 3 puntos del equipo en sm y md.">
            <div className="flex items-center gap-6">
              <NetiaLoader size="sm" />
              <NetiaLoader size="md" />
              <Button size="sm" disabled><NetiaLoader size="sm" /><span className="ml-2">Enviando</span></Button>
            </div>
          </Demo>

          <Demo title="Espera de IA (más de 2 s): etapas reales (AIStages)" hint="Menos de 2 s alcanza con el indicador de “escribiendo”." onPlay={() => setRun((n) => n + 1)}>
            <AIStages runKey={run} />
          </Demo>
        </div>

        <Sub>Anti-parpadeo</Sub>
        <ol className="space-y-1.5">
          <Rule ok>Mostrar el skeleton solo si la carga pasa los 150 ms; una vez mostrado, que dure al menos 300 ms (hook <code className="text-xs">useDelayedFlag</code>).</Rule>
          <Rule ok>Microcopy rioplatense, una por contexto y nunca rotando al azar: Entrenar “Preparando tu sesión…”, Calendario “Ordenando tu semana…”, plan IA “Leyendo tu registro” → “Armando la sesión” → “Listo”. El splash va sin texto.</Rule>
          <Rule ok>Errores: qué pasó, qué hacer y un botón “Reintentar”.</Rule>
          <Rule ok={false}>Una barra de porcentaje que no se mide de verdad.</Rule>
          <Rule ok={false}>Spinner a pantalla completa o pantalla en blanco mientras carga una ruta.</Rule>
        </ol>
      </div>
    </Section>
  );
};
