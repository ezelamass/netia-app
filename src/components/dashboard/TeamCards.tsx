import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { AGENTS, AVATAR_IDS, type AvatarId } from '@/lib/avatars';
import { AgentAvatar } from '@/components/play/AgentAvatar';
import { cn } from '@/lib/utils';

interface TeamCardsProps {
  streak: number;
  hasLogToday: boolean;
  energyLevel: number | null;
  hydrationLiters: number | null;
}

const DAY_TIPS = [
  'Domingo de recarga: descansá y dormí bien.',
  'Lunes para arrancar con todo. Calentá bien.',
  'Martes de intensidad: enfocate en lo que más te cuesta.',
  'Mitad de semana. Mantené el ritmo, vas muy bien.',
  'Jueves de técnica: cada repetición cuenta.',
  'Viernes de cierre fuerte. No aflojes.',
  'Sábado de partido o de descanso activo.',
];

/** Consejo de una línea por agente, según racha, energía y registro del día. */
export const teamTips = ({ streak, hasLogToday, energyLevel, hydrationLiters }: TeamCardsProps): Record<AvatarId, string> => ({
  TINO: !hasLogToday
    ? 'Registrá tu día y armamos el entrenamiento a tu medida.'
    : streak >= 7
      ? `¡${streak} días seguidos! Sos imparable, seguí así.`
      : energyLevel !== null && energyLevel <= 2
        ? 'Tu energía está baja: hoy conviene entrenar suave.'
        : DAY_TIPS[new Date().getDay()],
  ZAHIA: !hasLogToday
    ? 'Contame cuánta agua tomaste y armamos tu plan de hidratación.'
    : hydrationLiters !== null && hydrationLiters < 1.5
      ? 'Te falta agua hoy: tomá un vaso ahora y llevá una botella al entreno.'
      : '¡Buena hidratación! Sumá una fruta antes de entrenar.',
  ROMA: energyLevel !== null && energyLevel <= 3
    ? 'Con poca energía, probá 5 respiraciones 4-2-6 antes de entrenar.'
    : 'Antes de entrenar, visualizá tu primer punto durante 30 segundos.',
});

const ACCENT: Record<AvatarId, string> = {
  TINO: 'border-t-tino',
  ZAHIA: 'border-t-zahia',
  ROMA: 'border-t-roma',
};

export const TeamCards = memo((props: TeamCardsProps) => {
  const tips = useMemo(() => teamTips(props), [props.streak, props.hasLogToday, props.energyLevel, props.hydrationLiters]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
      {AVATAR_IDS.map((id) => {
        const agent = AGENTS[id];
        return (
          <li key={id} className={cn('flex w-[250px] shrink-0 snap-start flex-col gap-2 rounded-2xl border border-t-[3px] border-border/60 bg-card p-3 shadow-card md:w-auto', ACCENT[id])}>
            <div className="flex items-center gap-2">
              <AgentAvatar agent={id} size={32} />
              <div className="leading-tight">
                <p className="text-sm font-semibold">{agent.name}</p>
                <p className="text-[11px] text-muted-foreground">{agent.area}</p>
              </div>
            </div>
            <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{tips[id]}</p>
            <Link
              to={`/chat?agente=${id.toLowerCase()}&q=${encodeURIComponent(agent.suggestions[0])}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 self-start rounded-full bg-primary-soft px-3 text-xs font-semibold text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Preguntar
            </Link>
          </li>
        );
      })}
    </ul>
  );
});
TeamCards.displayName = 'TeamCards';
