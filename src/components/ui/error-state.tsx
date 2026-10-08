import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  WifiOff, 
  ServerCrash, 
  AlertTriangle, 
  FileX, 
  RefreshCw,
  Home,
  MessageSquareOff
} from 'lucide-react';
import { AGENTS } from '@/lib/avatars';

export type ErrorStateVariant = 
  | 'offline' 
  | 'server' 
  | 'save-failed' 
  | 'load-failed' 
  | 'chat-failed' 
  | 'not-found'
  | 'generic';

export type AvatarId = 'TINO' | 'ZAHIA' | 'ROMA';

export interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoHome?: boolean;
  context?: string;
  avatar?: AvatarId;
  className?: string;
}

// Imágenes por agente
const AVATAR_IMAGES = {
  TINO: AGENTS.TINO.image,
  ZAHIA: AGENTS.ZAHIA.image,
  ROMA: AGENTS.ROMA.image,
};

// Default content for each variant
const VARIANT_DEFAULTS: Record<ErrorStateVariant, {
  title: string;
  description: string;
  icon: React.ReactNode;
  showRetry: boolean;
  showGoHome: boolean;
}> = {
  'offline': {
    title: 'Sin conexión a internet',
    description: 'Parece que estás offline. Verificá tu conexión e intentá de nuevo.',
    icon: <WifiOff className="w-8 h-8" />,
    showRetry: true,
    showGoHome: false,
  },
  'server': {
    title: 'Algo salió mal',
    description: 'Estamos teniendo problemas técnicos. Intentá en unos minutos.',
    icon: <ServerCrash className="w-8 h-8" />,
    showRetry: true,
    showGoHome: true,
  },
  'save-failed': {
    title: 'No pudimos guardar tus datos',
    description: 'Tus cambios no se guardaron. ¿Querés intentar de nuevo?',
    icon: <AlertTriangle className="w-8 h-8" />,
    showRetry: true,
    showGoHome: false,
  },
  'load-failed': {
    title: 'No pudimos cargar el contenido',
    description: 'Hubo un problema al cargar la información.',
    icon: <FileX className="w-8 h-8" />,
    showRetry: true,
    showGoHome: false,
  },
  'chat-failed': {
    title: 'No puede responder ahora',
    description: 'Estamos teniendo problemas de conexión. Probá en unos minutos.',
    icon: <MessageSquareOff className="w-8 h-8" />,
    showRetry: true,
    showGoHome: false,
  },
  'not-found': {
    title: 'Página no encontrada',
    description: 'Parece que esta página no existe o fue movida.',
    icon: <FileX className="w-8 h-8" />,
    showRetry: false,
    showGoHome: true,
  },
  'generic': {
    title: 'Ocurrió un error',
    description: 'Algo no funcionó como esperábamos.',
    icon: <AlertTriangle className="w-8 h-8" />,
    showRetry: true,
    showGoHome: true,
  },
};

export const ErrorState = ({
  variant = 'generic',
  title,
  description,
  onRetry,
  onGoHome,
  showRetry,
  showGoHome,
  context,
  avatar,
  className,
}: ErrorStateProps) => {
  const defaults = VARIANT_DEFAULTS[variant];
  const displayTitle = title ?? (avatar && variant === 'chat-failed' 
    ? `${avatar} no puede responder ahora` 
    : defaults.title);
  const displayDescription = description ?? (context 
    ? defaults.description.replace('el contenido', context)
    : defaults.description);
  const shouldShowRetry = showRetry ?? defaults.showRetry;
  const shouldShowGoHome = showGoHome ?? defaults.showGoHome;

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none",
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl",
        "bg-destructive/5 border border-destructive/20",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Avatar or Icon */}
      <div className="mb-6">
        {avatar ? (
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-background shadow-lg opacity-70 grayscale">
              <img src={AVATAR_IMAGES[avatar]} alt={avatar} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            {defaults.icon}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-foreground mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {shouldShowRetry && onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
        )}
        {shouldShowGoHome && onGoHome && (
          <Button onClick={onGoHome} className="gap-2">
            <Home className="w-4 h-4" />
            Ir al inicio
          </Button>
        )}
      </div>
    </div>
  );
};
