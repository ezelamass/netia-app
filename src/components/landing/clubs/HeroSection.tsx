import { Link } from 'react-router-dom';
import { CalendarCheck, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INSTITUTIONAL_VIDEO } from '@/config/media';

interface Props {
  onContactClick: () => void;
  onVideoClick: () => void;
}

const HeroSection = ({ onContactClick, onVideoClick }: Props) => (
  <section className="w-full overflow-hidden bg-gradient-to-b from-info-soft/60 to-background">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-20">
      <div>
        <p className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Software para clubes y asociaciones deportivas
        </p>
        <h1 className="font-heading text-[clamp(1.9rem,4.6vw,3.2rem)] font-bold leading-[1.1]">
          Gestioná tu club sin planillas: socios, cuotas y aptos médicos en un solo lugar.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          NETIA ordena la administración de tu club y se la das a todas tus familias: ellas ven cuotas, avisos y aptos, y los chicos entrenan con asistentes de IA.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-7 text-base">
            <Link to="/demo">Probá la demo, sin registrarte</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-7 text-base" onClick={onContactClick}>
            <CalendarCheck className="mr-2 h-4 w-4" aria-hidden="true" />Agendá una reunión de 15 min
          </Button>
        </div>
        {INSTITUTIONAL_VIDEO.src && (
          <button type="button" onClick={onVideoClick} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"><Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" /></span>
            Ver video (1:20)
          </button>
        )}
      </div>

      <div className="relative">
        <div className="rounded-xl border border-border bg-card p-1.5 shadow-pop">
          <div className="mb-1.5 flex items-center gap-1.5 px-2 pt-1" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/60" /><span className="h-2.5 w-2.5 rounded-full bg-warning/60" /><span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          <img
            src="/landing/panel-desktop.webp"
            alt="Panel de inicio de NETIA con socios activos, cuotas al día y aptos por vencer"
            width={1440}
            height={900}
            {...({ fetchpriority: "high" } as Record<string, string>)}
            className="h-auto w-full rounded-lg"
          />
        </div>
        <div className="absolute -left-2 -top-3 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-pop sm:-left-6" aria-hidden="true">
          <span className="text-muted-foreground">Cuotas al día </span><span className="font-bold text-success tabular">82%</span>
        </div>
        <div className="absolute -bottom-3 right-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-pop sm:-right-4" aria-hidden="true">
          <span className="font-bold text-warning tabular">14</span><span className="text-muted-foreground"> aptos por vencer</span>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Captura de la demo · datos de ejemplo</p>
      </div>
    </div>
  </section>
);

export default HeroSection;
