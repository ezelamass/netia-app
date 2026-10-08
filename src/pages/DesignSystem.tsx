import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Users, Wallet, ShieldCheck, CalendarCheck, Inbox } from 'lucide-react';
import '@/styles/play-skin.css';
import { cn } from '@/lib/utils';
import { ICONS, TONE_CLASSES, type Tone } from '@/lib/icons';
import { AGENTS, AVATAR_IDS } from '@/lib/avatars';
import { Button } from '@/components/ui/button';
import {
  DataTable, EmptyPanel, FeeChip, FilterBar, KpiCard, MedicalChip, PageHeader, StatusChip,
  type Column, type FeeStatus, type MedicalStatus,
} from '@/components/domain';
import { AgentAvatar, IconBadge, PreviewBadge, ProgressRing, SectionHeader, StatPill } from '@/components/play';
import { Rule, Section } from './design-system/parts';
import { AiSection } from './design-system/ai-demos';
import { ChatSection, CriterioSection } from './design-system/chat-demos';
import { LoadingSection, MotionSection } from './design-system/motion-demos';

type Skin = 'club' | 'play';

const Swatch = ({ token, cls, note }: { token: string; cls: string; note: string }) => (
  <div className="rounded-lg border border-border bg-card p-2">
    <div className={cn('h-10 rounded-md border border-border/50', cls)} />
    <p className="mt-2 font-mono text-xs font-medium">{token}</p>
    <p className="text-xs text-muted-foreground">{note}</p>
  </div>
);

const SWATCHES: { token: string; cls: string; note: string }[] = [
  { token: '--primary', cls: 'bg-primary', note: 'Acción principal, links, foco' },
  { token: '--primary-soft', cls: 'bg-primary-soft', note: 'Fondo de chips e íconos activos' },
  { token: '--secondary', cls: 'bg-secondary', note: 'Acento de marca (naranja)' },
  { token: '--surface', cls: 'bg-surface', note: 'Fondo de página' },
  { token: '--card', cls: 'bg-card', note: 'Tarjetas y paneles' },
  { token: '--muted', cls: 'bg-muted', note: 'Fondos secundarios' },
  { token: '--success', cls: 'bg-success', note: 'Al día, apto' },
  { token: '--warning', cls: 'bg-warning', note: 'Pendiente, por vencer' },
  { token: '--danger', cls: 'bg-danger', note: 'Vencido, error' },
  { token: '--info', cls: 'bg-info', note: 'Informativo' },
  { token: '--avatar-tino', cls: 'bg-tino', note: 'TINO · entreno' },
  { token: '--avatar-zahia', cls: 'bg-zahia', note: 'ZAHIA · nutrición' },
  { token: '--avatar-roma', cls: 'bg-roma', note: 'ROMA · mente' },
];

interface Row { id: string; name: string; cat: string; fee: FeeStatus; med: MedicalStatus; att: number }
const ROWS: Row[] = [
  { id: '1', name: 'Valentina Ríos', cat: 'Sub 12', fee: 'al_dia', med: 'apto', att: 94 },
  { id: '2', name: 'Mateo Giménez', cat: 'Sub 14', fee: 'vencida', med: 'por_vencer', att: 71 },
  { id: '3', name: 'Julieta Sosa', cat: 'Sub 12', fee: 'pendiente', med: 'vencido', att: 82 },
  { id: '4', name: 'Bruno Acosta', cat: 'Sub 16', fee: 'al_dia', med: 'sin_apto', att: 88 },
];
const COLUMNS: Column<Row>[] = [
  { key: 'name', header: 'Socio', cell: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
  { key: 'cat', header: 'Categoría', cell: (r) => r.cat, sortValue: (r) => r.cat },
  { key: 'fee', header: 'Cuota', cell: (r) => <FeeChip status={r.fee} /> },
  { key: 'med', header: 'Apto médico', cell: (r) => <MedicalChip status={r.med} />, hideOnMobile: true },
  { key: 'att', header: 'Asistencia', align: 'right', cell: (r) => <span className="tabular-nums">{r.att}%</span>, sortValue: (r) => r.att, hideOnMobile: true },
];

const TONES = Object.keys(TONE_CLASSES) as Tone[];

const NAV = [
  ['principios', 'Principios'], ['color', 'Color'], ['tipografia', 'Tipografía'], ['forma', 'Forma'],
  ['iconos', 'Íconos'], ['ia', 'IA'], ['componentes', 'Componentes'], ['movimiento', 'Movimiento'], ['carga', 'Carga'], ['chat', 'Chat'], ['estados', 'Estados'], ['criterio', 'Criterio visual'], ['reglas', 'Mobile y a11y'], ['checklist', 'Checklist'],
] as const;

const DesignSystem = () => {
  const [skin, setSkin] = useState<Skin>('club');
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState('');
  const rows = ROWS.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      data-skin={skin === 'play' ? 'play' : undefined}
      className={cn('min-h-screen-dvh bg-surface text-foreground', dark && 'dark')}
    >
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />Inicio
          </Link>
          <span className="font-heading text-sm font-semibold">Sistema de diseño NETIA</span>
          <div className="ml-auto flex items-center gap-2">
            <div role="group" aria-label="Piel" className="inline-flex rounded-lg border border-border p-0.5">
              {(['club', 'play'] as Skin[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={skin === s}
                  onClick={() => setSkin(s)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    skin === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s === 'club' ? 'Club' : 'Play'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDark((d) => !d)} aria-label={dark ? 'Modo claro' : 'Modo oscuro'}>
              {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </div>
        </div>
        <nav aria-label="Secciones" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-heading text-3xl font-bold">Sistema de diseño</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Guía para crear pantallas nuevas que se vean igual que las actuales. Todo lo que ves abajo son los componentes reales de la app, no capturas: usá el selector de arriba para cambiar de piel y de modo.
        </p>

        <Section id="principios" title="Principios" lead="Seis decisiones que explican el resto.">
          <ol className="grid gap-3 sm:grid-cols-2">
            {[
              ['Dos pieles, una base', 'Club, coach y admin usan la piel Club (azul, sobria, densa). Jugador y familia usan Play (naranja, más cálida y redondeada). Mismos tokens, distinto acento.'],
              ['Tokens, nunca colores sueltos', 'Todo color sale de una variable CSS en HSL. Si escribís un hex o un `bg-blue-500`, está mal.'],
              ['Claro por defecto', 'Fondo blanco o blanco hueso. El modo oscuro tiene que funcionar, pero nunca es el estado inicial.'],
              ['Nada falso presentado como real', 'Si un dato es de ejemplo o la función es un mockup, se marca con “Vista previa” o el aviso de datos de ejemplo.'],
              ['Estado = color + ícono + texto', 'Nunca solo color. Hay personas daltónicas y hay pantallas al sol en la cancha.'],
              ['La IA tiene su propia señal', 'TINO, ZAHIA y ROMA son la IA de NETIA y solo ellos usan el gradiente del equipo. Lo que escribe la IA va firmado y se puede descartar.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold tabular-nums text-primary">0{i + 1}</p>
                <p className="font-heading font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="color" title="Color" lead="Se cambian solos al alternar piel o modo. Tailwind los expone como bg-primary, text-muted-foreground, border-border, etc. Definidos en src/index.css y src/styles/play-skin.css.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {SWATCHES.map((s) => <Swatch key={s.token} {...s} />)}
          </div>
          <ul className="mt-5 space-y-1.5">
            <Rule ok>Texto sobre fondo de color: el par <code className="text-xs">*-foreground</code> del mismo token.</Rule>
            <Rule ok>Fondos suaves de estado con <code className="text-xs">*-soft</code> y texto con el color pleno.</Rule>
            <Rule ok={false}>Texto blanco sobre <code className="text-xs">--brand-orange</code> en tamaños menores a 24px (no da contraste AA).</Rule>
            <Rule ok={false}>Gradientes violetas de fondo o gradientes decorativos en superficies de datos.</Rule>
          </ul>
        </Section>

        <Section id="tipografia" title="Tipografía" lead="Dos familias: Poppins solo para títulos (excepción de marca) e Inter para todo lo demás, incluido el chat. Más de una familia en el cuerpo es el delator de una interfaz amateur.">
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <p className="font-heading text-3xl font-bold">Título de página · Poppins 700</p>
            <p className="font-heading text-xl font-semibold">Título de sección · Poppins 600</p>
            <p className="text-sm">Texto de interfaz en Inter 14px. El mínimo absoluto en toda la app es 12px.</p>
            <p className="text-sm text-muted-foreground">Texto secundario: <span className="tabular-nums">$ 12.500 · 94% · 18/24</span> con números tabulares.</p>
            <p className="text-sm">Burbuja de chat, también en Inter: “¡Buen laburo hoy! ¿Cómo sentiste las piernas?”</p>
          </div>
          <ul className="mt-5 space-y-1.5">
            <Rule ok>Todo número en KPIs, tablas y fechas con <code className="text-xs">tabular-nums</code>.</Rule>
            <Rule ok>Interfaz en español rioplatense con voseo: “Entrá”, “Podés”, “Tu equipo”.</Rule>
            <Rule ok={false}>Tamaños arbitrarios (<code className="text-xs">text-[11px]</code>): solo la escala de Tailwind, mínimo <code className="text-xs">text-xs</code>.</Rule>
            <Rule ok={false}>Texto en inglés ni en español neutro; tampoco roles sin traducir (usar Entrenador, Administrador de club, Familia, Jugador).</Rule>
          </ul>
        </Section>

        <Section id="forma" title="Forma" lead="Radio y sombra distinguen datos de momentos especiales.">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <p className="text-sm font-semibold">Datos</p>
              <p className="text-xs text-muted-foreground">Cards, tablas, inputs. <code>--radius</code> (Club 10px, Play 14px) + <code>--shadow-card</code>.</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-[var(--shadow-pop)]">
              <p className="text-sm font-semibold">Momentos</p>
              <p className="text-xs text-muted-foreground">Modales, héroes. <code>--radius-lg</code> (16px) + <code>--shadow-pop</code>.</p>
            </div>
            <div className="rounded-full border border-border bg-card px-4 py-4 text-center">
              <p className="text-sm font-semibold">Chips y avatares</p>
              <p className="text-xs text-muted-foreground">Totalmente redondos.</p>
            </div>
          </div>
        </Section>

        <Section id="iconos" title="Íconos" lead="Solo Lucide, nunca emojis como ícono. Cada concepto usa siempre el mismo (fuente única: src/lib/icons.ts).">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(ICONS).map(([key, { icon, tone }]) => (
              <div key={key} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                <IconBadge icon={icon} tone={tone} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-medium">{key}</p>
                  <p className="text-[11px] text-muted-foreground">{tone}</p>
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-1.5">
            <Rule ok>Navegación 20px (stroke 2) · inline en texto o botón 16px · en tarjeta 16–18px dentro de un IconBadge de 28–32px.</Rule>
            <Rule ok>Íconos decorativos con <code className="text-xs">aria-hidden</code>; botones de solo ícono con <code className="text-xs">aria-label</code>.</Rule>
            <Rule ok={false}>Cajas de ícono de 40px con gradiente.</Rule>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {TONES.map((t) => <IconBadge key={t} icon={ICONS.club.icon} tone={t} />)}
          </div>
        </Section>

        <AiSection />

        <Section id="componentes" title="Componentes" lead="Armá las pantallas con estas piezas antes de crear nada nuevo. Los de dominio viven en src/components/domain y el kit Play en src/components/play.">
          <h3 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">Encabezado de página (PageHeader)</h3>
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <PageHeader
              title="Cuotas y pagos"
              description="Resumen del mes y estado por socio."
              breadcrumb={[{ label: 'Club', href: '/club/dashboard' }, { label: 'Cuotas' }]}
              actions={<Button size="sm">Registrar pago</Button>}
            />
          </div>

          <h3 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">Indicadores (KpiCard)</h3>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Socios activos" value={186} icon={Users} delta={4} trend={[150, 158, 165, 172, 178, 186]} />
            <KpiCard label="Cuotas al día" value="82%" icon={Wallet} delta={3} deltaSuffix=" pts" tone="success" trend={[70, 74, 77, 79, 80, 82]} />
            <KpiCard label="Morosos" value={24} icon={Wallet} delta={5} invertDelta tone="warning" trend={[16, 18, 19, 21, 22, 24]} />
            <KpiCard label="Aptos por vencer" value={11} icon={ShieldCheck} tone="danger" />
          </div>

          <h3 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">Chips de estado (StatusChip, FeeChip, MedicalChip)</h3>
          <div className="mb-6 flex flex-wrap gap-2">
            <FeeChip status="al_dia" /><FeeChip status="pendiente" /><FeeChip status="vencida" />
            <MedicalChip status="apto" /><MedicalChip status="por_vencer" /><MedicalChip status="vencido" /><MedicalChip status="sin_apto" />
            <StatusChip tone="info">Inscripción nueva</StatusChip>
            <StatusChip tone="neutral">Archivado</StatusChip>
            <PreviewBadge />
          </div>

          <h3 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">Tabla con filtros (FilterBar + DataTable)</h3>
          <div className="mb-6">
            <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar socio…" trailing={<Button size="sm" variant="outline">Exportar CSV</Button>} />
            <DataTable
              rows={rows}
              columns={COLUMNS}
              rowKey={(r) => r.id}
              selectable
              caption="Socios de ejemplo"
              bulkActions={(ids) => <Button size="sm" variant="outline">Enviar recordatorio ({ids.length})</Button>}
              empty={<EmptyPanel icon={Inbox} title="Sin resultados" description="Probá con otro nombre o limpiá el filtro." actionLabel="Limpiar" onAction={() => setSearch('')} />}
            />
          </div>

          <h3 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">Kit Play (jugador y familia)</h3>
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <SectionHeader title="Tu semana" action={{ label: 'Ver todo', to: '/calendar' }} />
            <div className="flex flex-wrap items-center gap-3">
              <StatPill icon={ICONS.streak.icon} value={5} label="días de racha" />
              <StatPill icon={ICONS.xp.icon} value={1240} label="XP" />
              <StatPill icon={CalendarCheck} value="3/4" label="sesiones" tone="blue" />
              <ProgressRing value={72} label="72%" />
            </div>
            <div className="flex flex-wrap gap-4">
              {AVATAR_IDS.map((id) => (
                <div key={id} className="flex items-center gap-2">
                  <AgentAvatar agent={id} size={48} ring />
                  <div>
                    <p className="text-sm font-semibold">{AGENTS[id].name}</p>
                    <p className="text-xs text-muted-foreground">{AGENTS[id].tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Botones, inputs, diálogos, tabs y toasts: siempre de <code>src/components/ui</code> (shadcn). No se re-implementan.</p>
        </Section>

        <MotionSection />

        <LoadingSection />

        <ChatSection />

        <Section id="estados" title="Estados" lead="Toda pantalla con datos resuelve estos cuatro casos. Ninguna queda en blanco.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Cargando', 'Skeleton con la forma del contenido final (PageSkeleton, components/skeletons). Nunca un spinner a pantalla completa.'],
              ['Vacío', 'EmptyPanel con ícono, una frase que explique por qué está vacío y un botón para salir de ahí.'],
              ['Error', 'Mensaje en español que diga qué pasó y qué hacer, con botón “Reintentar”. Nada de códigos técnicos.'],
              ['Datos de ejemplo', 'SampleDataNotice si el dato no es real; PreviewBadge si la función es un mockup.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border bg-card p-4">
                <p className="font-heading font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        <CriterioSection />

        <Section id="reglas" title="Mobile y accesibilidad" lead="Se verifican en 390px y 1440px antes de pedir revisión.">
          <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            <Rule ok>Sin scroll horizontal en 390px; las tablas pasan a cards o scrollean dentro de su contenedor.</Rule>
            <Rule ok>Áreas táctiles de al menos 44px en mobile, con respeto de safe-area abajo.</Rule>
            <Rule ok>Foco visible en todo lo interactivo (<code className="text-xs">focus-visible:ring-2 ring-ring</code>).</Rule>
            <Rule ok>Contraste AA (4.5:1) en texto, en claro y en oscuro.</Rule>
            <Rule ok>Una sola <code className="text-xs">h1</code> por página, encabezados en orden.</Rule>
            <Rule ok>Cargar páginas con <code className="text-xs">React.lazy</code>; agregarlas en <code className="text-xs">src/routes/lazyPages.ts</code>.</Rule>
            <Rule ok={false}>Importar Three.js o Recharts en pantallas de entrada: pesan y rompen los presupuestos de <code className="text-xs">scripts/check-budgets.mjs</code>.</Rule>
            <Rule ok={false}>Datos hardcodeados presentados como reales (badges con número fijo, gráficos inventados).</Rule>
          </ul>
        </Section>

        <Section id="checklist" title="Checklist para una pantalla nueva">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Elegí la piel según el rol: Club (coach, club_admin, admin) o Play (player, parent). El shell la aplica solo.</li>
            <li>Armá el encabezado con <code>PageHeader</code> y el contenido con componentes de <code>domain</code> o <code>play</code>.</li>
            <li>Colores solo con tokens; íconos solo desde <code>src/lib/icons.ts</code> o Lucide en el tamaño de la guía.</li>
            <li>Resolvé carga, vacío y error. Marcá lo que sea de ejemplo.</li>
            <li>Texto en español rioplatense, números con <code>tabular-nums</code>.</li>
            <li>Probá en claro y oscuro, en 390px y 1440px, y navegando solo con teclado.</li>
            <li>Toda acción tiene feedback: carga, éxito y error. Si lo hizo la IA, va firmado y se puede descartar.</li>
            <li>Corré <code>npm run lint</code>, <code>npm run lint:ui</code> y <code>npm run build</code>; si tocaste las 4 pestañas principales, también <code>node scripts/check-budgets.mjs</code>.</li>
          </ol>
          <div className="mt-6">
            <Button asChild><Link to="/demo">Ver la app en acción</Link></Button>
          </div>
        </Section>
      </main>
    </div>
  );
};

export default DesignSystem;
