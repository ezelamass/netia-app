import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/avatars';
import { 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  MessageCircle,
  Rocket,
  Target
} from 'lucide-react';

export type EmptyStateVariant = 
  | 'no-log-today' 
  | 'new-user' 
  | 'no-events' 
  | 'first-chat' 
  | 'no-leaderboard' 
  | 'no-history' 
  | 'no-players' 
  | 'no-notifications'
  | 'generic';

export type AvatarType = 'TINO' | 'ZAHIA' | 'ROMA' | 'all';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  avatar?: AvatarType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  progress?: { current: number; total: number };
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

const AVATAR_IMAGES = {
  TINO: AGENTS.TINO.image,
  ZAHIA: AGENTS.ZAHIA.image,
  ROMA: AGENTS.ROMA.image,
};

// Default content for each variant
const VARIANT_DEFAULTS: Record<EmptyStateVariant, {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: React.ReactNode;
  avatar?: AvatarType;
}> = {
  'no-log-today': {
    title: '¡Buenos días, campeón!',
    description: 'Todavía no registraste cómo te sentís hoy. Son solo 30 segundos.',
    actionLabel: 'Registrar ahora',
    avatar: 'TINO',
    icon: <Target className="w-6 h-6" />,
  },
  'new-user': {
    title: '¡Bienvenido a NETIA!',
    description: 'Tu aventura deportiva empieza hoy. Completá tu primer registro y conocé a tus coaches IA.',
    actionLabel: 'Empezar',
    avatar: 'all',
    icon: <Rocket className="w-6 h-6" />,
  },
  'no-events': {
    title: 'Tu calendario está vacío',
    description: 'Agregá tus entrenamientos, torneos y días de descanso para que TINO te ayude a planificar mejor.',
    actionLabel: 'Agregar evento',
    icon: <Calendar className="w-6 h-6" />,
  },
  'first-chat': {
    title: '¡Hola! Soy tu coach',
    description: 'Estoy acá para ayudarte. Preguntame lo que quieras.',
    avatar: 'TINO',
    icon: <MessageCircle className="w-6 h-6" />,
  },
  'no-leaderboard': {
    title: 'El ranking se está armando',
    description: 'Todavía no hay suficientes atletas activos esta semana. ¡Seguí entrenando para aparecer!',
    actionLabel: 'Ir a entrenar',
    icon: <Trophy className="w-6 h-6" />,
  },
  'no-history': {
    title: 'Necesitamos más datos',
    description: 'Registrá al menos 7 días para ver tus tendencias de sueño, hidratación y energía.',
    actionLabel: 'Registrar hoy',
    icon: <TrendingUp className="w-6 h-6" />,
  },
  'no-players': {
    title: 'Tu plantilla está vacía',
    description: 'Invitá a tus jugadores para empezar a trackear su progreso y bienestar.',
    actionLabel: 'Invitar jugadores',
    icon: <Users className="w-6 h-6" />,
  },
  'no-notifications': {
    title: 'Todo en orden',
    description: 'No tenés alertas pendientes. ¡Seguí así!',
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
  'generic': {
    title: 'Nada que mostrar',
    description: 'No hay contenido disponible en este momento.',
  },
};

const AvatarDisplay = ({ avatar, className }: { avatar: AvatarType; className?: string }) => {
  if (avatar === 'all') {
    return (
      <div className={cn("flex -space-x-4", className)}>
        {(['TINO', 'ZAHIA', 'ROMA'] as const).map((a, index) => (
          <motion.div
            key={a}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "w-16 h-16 rounded-full overflow-hidden border-4 border-background shadow-lg",
              index === 0 && "z-30",
              index === 1 && "z-20",
              index === 2 && "z-10"
            )}
          >
            <img src={AVATAR_IMAGES[a]} alt={a} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("w-20 h-20 rounded-full overflow-hidden border-4 border-background shadow-lg", className)}
    >
      <img src={AVATAR_IMAGES[avatar]} alt={avatar} className="w-full h-full object-cover" />
    </motion.div>
  );
};

export const EmptyState = ({
  variant = 'generic',
  avatar,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  progress,
  suggestions,
  onSuggestionClick,
  className,
}: EmptyStateProps) => {
  const defaults = VARIANT_DEFAULTS[variant];
  const displayAvatar = avatar ?? defaults.avatar;
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;
  const displayActionLabel = actionLabel ?? defaults.actionLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl",
        "bg-muted/30 border border-border/50",
        className
      )}
      role="status"
      aria-label={displayTitle}
    >
      {/* Avatar or Icon */}
      <div className="mb-6">
        {displayAvatar ? (
          <AvatarDisplay avatar={displayAvatar} />
        ) : defaults.icon ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            {defaults.icon}
          </motion.div>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-foreground mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>

      {/* Progress bar if provided */}
      {progress && (
        <div className="w-full max-w-xs mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progreso</span>
            <span>{progress.current}/{progress.total} días</span>
          </div>
          <Progress value={(progress.current / progress.total) * 100} className="h-2" />
        </div>
      )}

      {/* Suggestions for chat */}
      {suggestions && suggestions.length > 0 && (
        <div className="w-full max-w-sm mb-6">
          <p className="text-xs text-muted-foreground mb-3">Sugerencias:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-sm px-3 py-1.5 rounded-full bg-background border border-border hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {displayActionLabel && onAction && (
          <Button onClick={onAction} className="gap-2">
            {displayActionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
};
