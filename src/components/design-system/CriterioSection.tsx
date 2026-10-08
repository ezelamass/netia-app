// ui-bans-ignore-file: nombra en texto las clases prohibidas para documentarlas
import { TeamCards } from '@/components/dashboard/TeamCards';
import { AgentAvatar } from '@/components/play';
import { AIMark } from '@/components/ai';
import { Rule, Section, SubTitle } from './parts';

const BANS: [string, string][] = [
  ['JER-02 · ESP-04', 'Bordes de acento de color en tarjetas, burbujas, alertas o filas. La identidad la da el avatar y el nombre, no una línea de color.'],
  ['JER-02', 'Borde, sombra y color a la vez para destacar algo. Subí la escala o el peso del texto en su lugar.'],
  ['MOB-09', 'Tarjeta dentro de tarjeta.'],
  ['CMP-07 · CTA-02', 'Dos botones sólidos en el mismo bloque: el segundo va ghost u outline.'],
  ['TIP-02', 'Tamaños de texto arbitrarios como text-[11px]. Solo la escala de Tailwind, mínimo text-xs (12 px).'],
  ['ESP-01', 'Espaciados fuera de la escala 4/8, como p-[13px] o gap-[18px].'],
  ['CMP-04', 'Íconos mezclados (rellenos y de línea, grosores distintos) o emojis como ícono.'],
  ['COL-03', 'Cajas de ícono con gradiente y gradientes decorativos.'],
  ['TIP-05 · TIP-07 · CTA-03', 'Mayúsculas sostenidas sin espaciado entre letras, o en botones de acción.'],
  ['CMP-05', 'Badges redundantes: ícono y texto que dicen lo mismo, o que repiten el contexto.'],
  ['COL-08', 'Divisores gruesos u oscuros (más de 1 px).'],
  ['ESP-02', 'Todo centrado en pantallas de datos. Alineá al eje izquierdo; centrado solo en estados vacíos y héroes.'],
  ['CMP-03', 'Acciones sin confirmación visible (copiar, guardar, registrar sin feedback).'],
];

export const CriterioSection = () => (
  <Section
    id="criterio"
    title="Criterio visual"
    lead="Los “tics” de la interfaz generada con IA: cosas que se ven prolijas a primera vista y gritan que nadie las diseñó. Cada una tiene su regla del segundo cerebro. npm run lint:ui falla si aparece alguna de las medibles."
  >
    <SubTitle>Antes y después: tarjeta de “Tu equipo”</SubTitle>
    <div className="mb-6 space-y-5">
      <div className="max-w-xs">
        <p className="mb-2 text-sm font-semibold text-danger">No: línea de color arriba</p>
        <div
          className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-3 shadow-card"
          style={{ borderTop: '3px solid hsl(var(--avatar-tino))' }}
        >
          <div className="flex items-center gap-2">
            <AgentAvatar agent="TINO" size={32} />
            <div className="leading-tight">
              <p className="text-sm font-semibold">TINO</p>
              <p className="text-xs text-muted-foreground">Entreno</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Registrá tu día y armamos el entrenamiento a tu medida.</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-success">Sí: sin borde, el avatar ya dice quién es</p>
        <div>
          <TeamCards streak={0} hasLogToday={false} energyLevel={null} hydrationLiters={null} />
        </div>
      </div>
    </div>

    <SubTitle>Las 13 prohibiciones</SubTitle>
    <ul className="grid gap-x-8 gap-y-2 md:grid-cols-2">
      {BANS.map(([id, text]) => (
        <Rule key={text} ok={false}>
          <span className="mr-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{id}</span>
          {text}
        </Rule>
      ))}
    </ul>
    <p className="mt-5 flex items-center gap-1.5 text-sm text-muted-foreground">
      <AIMark size={14} />
      Excepciones justificadas: un comentario <code className="text-xs">ui-bans-ignore: motivo</code> en la línea.
    </p>
  </Section>
);
