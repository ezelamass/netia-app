import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FinalCta = ({ onContactClick }: { onContactClick: () => void }) => (
  <section id="contacto" className="scroll-mt-20 bg-primary py-16 text-primary-foreground lg:py-20">
    <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
      <h2 className="font-heading text-3xl font-bold lg:text-4xl">Mirá cómo se vería tu club en NETIA</h2>
      <p className="mt-3 text-primary-foreground/85">Probá la demo en un minuto o dejanos tus datos y armamos una propuesta.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" variant="secondary" className="h-12 px-7 text-base"><Link to="/demo">Probá la demo</Link></Button>
        <Button size="lg" variant="outline" className="h-12 border-white/60 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white" onClick={onContactClick}>Quiero esto para mi club</Button>
      </div>
    </div>
  </section>
);
export default FinalCta;
