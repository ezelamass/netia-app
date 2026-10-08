import { FileSpreadsheet, MessagesSquare, ShieldAlert } from 'lucide-react';
import { Reveal } from './Reveal';

const items = [
  {
    icon: FileSpreadsheet,
    problem: 'Cuotas en Excel y WhatsApp',
    detail: 'El tesorero persigue pagos mensaje por mensaje y la caja nunca se sabe a ciencia cierta.',
    solution: 'Con NETIA ves en 5 segundos quién debe y se lo recordás con un clic.',
  },
  {
    icon: ShieldAlert,
    problem: 'Aptos médicos que se vencen sin que nadie se entere',
    detail: 'Chicos que juegan con el apto vencido y una comisión que responde por eso.',
    solution: 'Un semáforo de vencimientos te avisa antes y le avisa a las familias.',
  },
  {
    icon: MessagesSquare,
    problem: 'Padres que preguntan todo por mensaje',
    detail: '“¿Hay entrenamiento hoy?”, “¿cuánto debo?”, “¿a qué hora es el partido?”, cien veces por día.',
    solution: 'Las familias ven horarios, cuota y avisos solas. Vos avisás a una categoría en segundos.',
  },
];

const ProblemSection = () => (
  <section id="para-quien" className="scroll-mt-20 py-16 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="max-w-2xl font-heading text-3xl font-bold lg:text-4xl">Administrar un club no debería ser un segundo trabajo</h2>
      </Reveal>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.problem}>
            <Reveal delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card">
                <it.icon className="h-7 w-7 text-secondary" aria-hidden="true" />
                <h3 className="mt-4 font-heading text-lg font-semibold">{it.problem}</h3>
                <p className="mt-2 text-muted-foreground">{it.detail}</p>
                <p className="mt-auto border-t border-border pt-4 font-medium text-foreground"><span className="text-primary">Con NETIA: </span>{it.solution}</p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
export default ProblemSection;
