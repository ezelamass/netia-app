import { Reveal } from './Reveal';

const steps = [
  { n: 1, title: 'Creá tu club', text: 'Nombre, ciudad y categorías. Tres pasos y listo.' },
  { n: 2, title: 'Importá tus socios', text: 'Pegá tu planilla en CSV y se cargan con su cuota del mes.' },
  { n: 3, title: 'Invitá a las familias', text: 'Cada familia se vincula con un código y ve lo de su hijo/a.' },
];

const HowItWorksSection = () => (
  <section className="bg-muted/40 py-16 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="font-heading text-3xl font-bold lg:text-4xl">Cómo empezar</h2>
        <p className="mt-3 text-muted-foreground">Pensado para arrancar en una tarde, sin conocimientos técnicos.</p>
      </Reveal>
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.n}>
            <Reveal delay={i * 0.08} className="h-full">
              <div className="h-full rounded-xl border border-border bg-card p-6 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground">{s.n}</span>
                <h3 className="mt-4 font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
export default HowItWorksSection;
