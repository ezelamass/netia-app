import { Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Reveal } from './Reveal';

const features = [
  { id: 'socios', tab: 'Socios', title: 'Todo tu club ordenado por categoría', img: 'socios', alt: 'Listado de socios con filtros por categoría, cuota y apto', points: ['Ficha de cada socio con datos, cuotas, apto y notas del entrenador', 'Filtros por categoría, deporte, estado de cuota y de apto', 'Alta de socios sueltos o importando tu planilla en CSV'] },
  { id: 'cuotas', tab: 'Cuotas', title: 'Cobrá a tiempo, sin perseguir a nadie', img: 'cuotas', alt: 'Pantalla de cuotas y pagos con resumen del mes y morosos', points: ['Resumen del mes: cobrado, pendiente y en mora', 'Recordatorio masivo a quienes deben, con un clic', 'Registro de pagos en efectivo, transferencia o Mercado Pago'] },
  { id: 'aptos', tab: 'Aptos', title: 'Semáforo de aptos médicos y documentación', img: 'aptos', alt: 'Tablero de aptos médicos con vencidos y por vencer', points: ['Vencidos, por vencer en 30 días y sin apto, de un vistazo', 'Aviso a las familias directo desde el tablero', 'Control de DNI y autorización firmada'] },
  { id: 'asistencia', tab: 'Asistencia', title: 'Tomá lista en 10 segundos', img: 'asistencia', alt: 'Planilla de asistencia por categoría', points: ['Tocá a cada presente desde el celular', 'Asistencia por socio y por categoría', 'Calendario con partidos, torneos y resultados'] },
  { id: 'comunicacion', tab: 'Comunicación', title: 'Avisos a las familias por categoría', img: 'comunicacion', alt: 'Redactor de avisos con plantillas e historial', points: ['Plantillas: cuota, lluvia, apto, resumen semanal', 'Elegís a todo el club o a categorías puntuales', 'Historial de todo lo que enviaste'] },
  { id: 'informes', tab: 'Informes', title: 'Informes que podés llevar a la comisión', img: 'informes', alt: 'Informes con descargas en CSV', points: ['Padrón, morosidad, asistencia y aptos en CSV', 'Cobranza de los últimos 6 meses', 'Versión imprimible / PDF'] },
];

const FeaturesSection = () => (
  <section id="producto" className="scroll-mt-20 bg-muted/40 py-16 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="max-w-2xl font-heading text-3xl font-bold lg:text-4xl">Lo que necesitás para llevar el club, en un solo lugar</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Todas las capturas son de la demo, con datos de ejemplo de un club ficticio.</p>
      </Reveal>
      <Tabs defaultValue="socios" className="mt-8">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {features.map((f) => (
            <TabsTrigger key={f.id} value={f.id} className="h-11 rounded-full border border-border bg-card px-4 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {f.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {features.map((f) => (
          <TabsContent key={f.id} value={f.id} className="mt-6">
            <div className="grid items-center gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h3 className="font-heading text-2xl font-bold">{f.title}</h3>
                <ul className="mt-5 space-y-3">
                  {f.points.map((p) => (
                    <li key={p} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" /><span>{p}</span></li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-3">
                <div className="rounded-xl border border-border bg-card p-1.5 shadow-pop">
                  <picture>
                    <source media="(max-width: 640px)" srcSet={`/landing/${f.img}-mobile.webp`} />
                    <img src={`/landing/${f.img}-desktop.webp`} alt={f.alt} width={1440} height={900} loading="lazy" className="h-auto w-full rounded-lg" />
                  </picture>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  </section>
);
export default FeaturesSection;
