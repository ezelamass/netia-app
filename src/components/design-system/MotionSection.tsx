import { useState } from 'react';
import { Check, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { SavedCheck, XpFloat, useFlash } from '@/components/ui/feedback';
import { CountUp } from '@/components/play/CountUp';
import { ProgressRing } from '@/components/play/ProgressRing';
import { IconBadge } from '@/components/play';
import { ICONS } from '@/lib/icons';
import { Replay, Rule, Section, SubTitle } from './parts';

const TOKENS: [string, string, string][] = [
  ['--dur-fast', '120 ms', 'Press, hover, cambio de ícono'],
  ['--dur-base', '200 ms', 'Entradas y salidas de elementos chicos, burbujas, toasts'],
  ['--dur-slow', '320 ms', 'Hojas, cambio de página, celebraciones'],
  ['--ease-out', 'cubic-bezier(.2, .8, .2, 1)', 'Todo lo que entra'],
  ['--ease-in', 'cubic-bezier(.4, 0, 1, 1)', 'Lo que sale (más rápido que lo que entra)'],
  ['--ease-spring', 'cubic-bezier(.34, 1.56, .64, 1)', 'Solo momentos: logro, racha, XP'],
];

const ITEMS = ['Entrenamiento de hoy', 'Partido del sábado', 'Registro de bienestar', 'Charla con ZAHIA'];

export const MotionSection = () => {
  const [stagger, setStagger] = useState(0);
  const [count, setCount] = useState(0);
  const [moment, setMoment] = useState(0);
  const [saved, fireSaved] = useFlash(1200);
  const [view, setView] = useState<'week' | 'month'>('week');

  return (
    <Section
      id="movimiento"
      title="Movimiento"
      lead="Todo movimiento comunica algo: que algo entró, que se guardó, que la IA trabaja, que ganaste algo. Si no comunica nada, no se anima. Todo es CSS puro: no hay framer-motion dentro de la app."
    >
      <SubTitle>Tokens</SubTitle>
      <div className="mb-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Tokens de movimiento</caption>
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr><th className="px-3 py-2 font-medium">Token</th><th className="px-3 py-2 font-medium">Valor</th><th className="px-3 py-2 font-medium">Uso</th></tr>
          </thead>
          <tbody>
            {TOKENS.map(([t, v, u]) => (
              <tr key={t} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-2 font-mono text-xs font-medium">{t}</td>
                <td className="px-3 py-2 tabular-nums">{v}</td>
                <td className="px-3 py-2 text-muted-foreground">{u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubTitle>Micro interacciones (probalas)</SubTitle>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-semibold">Press</p>
          <div className="flex flex-wrap gap-2">
            <Button>Botón</Button>
            <button type="button" className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary transition-[color,background-color,transform] duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Chip</button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Al apretar baja a 97% en 120 ms. Está en el botón base, los chips, las filas tocables y las tarjetas linkeables.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-semibold">Indicador que se desliza</p>
          <Segmented<'week' | 'month'> aria-label="Vista de ejemplo" value={view} onChange={setView} options={[{ value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }]} className="w-48" />
          <p className="mt-2 text-xs text-muted-foreground">Un fondo que se mueve con transform hasta la opción activa. Lo usan la barra inferior, Calendario y los toggles.</p>
        </div>

        <Replay label="Entrada escalonada" onReplay={() => setStagger((n) => n + 1)}>
          <ul key={stagger} className="space-y-2">
            {ITEMS.map((t, i) => (
              <li key={t} className="animate-fade-up rounded-lg bg-muted px-3 py-2 text-sm" style={{ animationDelay: `${i * 30}ms` }}>{t}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">30 ms entre ítems, máximo 6, solo en la primera carga (no al volver de caché).</p>
        </Replay>

        <Replay label="Conteo de números" onReplay={() => setCount((n) => n + 1)}>
          <div key={count} className="flex items-center gap-4">
            <p className="font-heading text-3xl font-bold tabular-nums"><CountUp value={1240} /> <span className="text-base font-semibold text-muted-foreground">XP</span></p>
            <ProgressRing key={`r${count}`} value={72} label="72%" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">600 ms con ease-out la primera vez que entra en pantalla. Anillos y barras crecen desde 0.</p>
        </Replay>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-semibold">Guardado confirmado</p>
          <div className="relative inline-block">
            <Button onClick={fireSaved} className="min-w-36">
              {saved ? <><SavedCheck />Guardado</> : 'Guardar registro'}
            </Button>
            {saved && <XpFloat amount={10} />}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Check que se dibuja dentro del botón unos 800 ms y vuelve al texto. “+XP” sube desde el botón.</p>
        </div>

        <Replay label="Racha y logro" onReplay={() => setMoment((n) => n + 1)}>
          <div key={moment} className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-semibold tabular-nums">
              <Flame className="h-4 w-4 animate-wiggle text-primary" aria-hidden="true" />
              <span className="animate-pop-in">6 días</span>
            </span>
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="animate-pop-in"><IconBadge icon={ICONS.xp.icon} /></span>
              Logro desbloqueado
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">La llama se mueve y el número entra con pop-in. El logro entra con spring y, en la app, confeti chico (se importa recién al disparar).</p>
        </Replay>
      </div>

      <SubTitle>Páginas, chat y toasts</SubTitle>
      <ul className="mb-6 space-y-1.5">
        <Rule ok>Cada pantalla entra con un fade de 200 ms y 6 px hacia arriba. No hay animación de salida: navegar nunca espera.</Rule>
        <Rule ok>En el chat, cada burbuja nueva entra desde su lado (8 px) en 200 ms. Solo los mensajes nuevos.</Rule>
        <Rule ok>Los toasts entran desde abajo en mobile y desde la derecha en desktop.</Rule>
        <Rule ok>Con “reducir movimiento” activado no hay desplazamientos, escalas ni loops: solo fades de hasta 120 ms.</Rule>
        <Rule ok={false}>Animaciones decorativas en loop dentro de la app. Los únicos loops permitidos llevan información: el shimmer (cargando), “escribiendo” y el anillo de la IA.</Rule>
        <Rule ok={false}>Demorar una acción para mostrar una animación.</Rule>
      </ul>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check className="h-4 w-4 text-success" aria-hidden="true" />Todo lo de esta sección es real: son los mismos componentes y animaciones de la app.</p>
    </Section>
  );
};
