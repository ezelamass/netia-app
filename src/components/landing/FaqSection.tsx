import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQ_ITEMS = [
  { q: '¿Mis datos están seguros?', a: 'Cada persona ve solo lo que corresponde a su rol. Los datos de salud de menores únicamente los ve la familia vinculada, y recién después de dar su consentimiento. Para el detalle legal, está la Política de Privacidad.' },
  { q: '¿Se puede importar desde Excel?', a: 'Sí. Pegás tu planilla en formato CSV (nombre, apellido, categoría) y los socios se cargan con la cuota del mes generada.' },
  { q: '¿Funciona en el celular?', a: 'Sí. NETIA funciona desde el navegador, en el celular y en la computadora, sin instalar nada.' },
  { q: '¿Cuánto cuesta?', a: 'Depende de la cantidad de socios. Escribinos y te pasamos una propuesta a medida.' },
  { q: '¿Cómo se manejan los menores?', a: 'La familia se vincula con un código de un solo uso y da su consentimiento antes de ver los datos de su hijo/a. El consentimiento queda registrado y puede retirarse.' },
  { q: '¿Cobran online las cuotas?', a: 'Hoy registrás los pagos (efectivo, transferencia, Mercado Pago) y NETIA te muestra quién debe. El cobro online es una etapa posterior y la definimos con los clubes piloto.' },
  { q: '¿Hay contrato?', a: 'Lo conversamos en la propuesta. Mientras tanto, podés probar la demo sin registrarte.' },
];

const FaqSection = () => (
  <section id="faq" className="scroll-mt-20 bg-muted/40 py-16 lg:py-24">
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <h2 className="font-heading text-3xl font-bold lg:text-4xl">Preguntas frecuentes</h2>
      <Accordion type="single" collapsible className="mt-8">
        {FAQ_ITEMS.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`}>
            <AccordionTrigger className="min-h-11 text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
export default FaqSection;
