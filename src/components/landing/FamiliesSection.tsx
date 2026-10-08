import { Lock, UserCheck, Smartphone } from 'lucide-react';
import { Reveal } from './Reveal';

const points = [
  { icon: UserCheck, title: 'Vinculación con código', text: 'La familia se vincula con un código de un solo uso y recién ve los datos de su hijo/a cuando da su consentimiento.' },
  { icon: Lock, title: 'Cada uno ve lo suyo', text: 'Los datos de salud de menores solo los ven la familia vinculada y el club. El acceso depende del rol.' },
  { icon: Smartphone, title: 'Desde el celular', text: 'Cuota, apto médico, próximo partido y avisos del club, en una pantalla pensada para el móvil.' },
];

const FamiliesSection = () => (
  <section className="py-16 lg:py-24">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <Reveal>
          <h2 className="font-heading text-3xl font-bold lg:text-4xl">Familias informadas, secretaría tranquila</h2>
          <p className="mt-3 text-muted-foreground">Las respuestas llegan antes que las preguntas. Y los datos de los chicos se tratan con cuidado.</p>
        </Reveal>
        <ul className="mt-8 space-y-5">
          {points.map((p) => (
            <li key={p.title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><p.icon className="h-5 w-5" aria-hidden="true" /></span>
              <div><h3 className="font-semibold">{p.title}</h3><p className="text-muted-foreground">{p.text}</p></div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">Más detalle en la <a className="text-primary underline" href="/Politica_de_Privacidad_NETIA.pdf" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.</p>
      </div>
      <div className="mx-auto w-full max-w-[280px]">
        <div className="rounded-[2rem] border-4 border-foreground/80 bg-card p-1 shadow-pop">
          <img src="/landing/familia-mobile.webp" alt="Vista de familia con cuota, apto médico y avisos del club" width={390} height={844} loading="lazy" className="h-auto w-full rounded-[1.5rem]" />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Vista de familia · datos de ejemplo</p>
      </div>
    </div>
  </section>
);
export default FamiliesSection;
