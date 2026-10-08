import { Button } from '@/components/ui/button';
import { Reveal } from './Reveal';

const plans = [
  { name: 'Club chico', size: 'Hasta 100 socios', text: 'Para escuelitas y clubes de barrio que quieren ordenarse.' },
  { name: 'Club mediano', size: 'Hasta 300 socios', text: 'Varias categorías, entrenadores y comunicación a familias.', highlight: true },
  { name: 'Asociación', size: 'Socios ilimitados', text: 'Para asociaciones y clubes con varias sedes o deportes.' },
];

const PricingSection = ({ onContactClick }: { onContactClick: () => void }) => (
  <section id="planes" className="scroll-mt-20 py-16 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="font-heading text-3xl font-bold lg:text-4xl">Planes según el tamaño de tu club</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Armamos el precio a medida de la cantidad de socios. Escribinos y te pasamos una propuesta.</p>
      </Reveal>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {plans.map((p, i) => (
          <li key={p.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <article className={`flex h-full flex-col rounded-xl border p-6 shadow-card ${p.highlight ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card'}`}>
                <h3 className="font-heading text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 font-medium text-primary">{p.size}</p>
                <p className="mt-3 flex-1 text-muted-foreground">{p.text}</p>
                <Button variant={p.highlight ? 'default' : 'outline'} className="mt-6 h-11" onClick={onContactClick}>Consultar</Button>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-5">
        <h3 className="font-semibold">Pilotos abiertos para clubes fundadores</h3>
        <p className="mt-1 text-muted-foreground">Estamos sumando a unos pocos clubes para armar el producto con ellos. Si te interesa, contanos cómo trabajan hoy.</p>
      </div>
    </div>
  </section>
);
export default PricingSection;
