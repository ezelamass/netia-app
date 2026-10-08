import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { CalendarEvent, getEventConfig } from '@/hooks/useCalendarEvents';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/avatars';

interface EventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
  onToggleComplete?: (eventId: string, completed: boolean) => void;
}

const avatarImages = {
  TINO: AGENTS.TINO.image,
  ZAHIA: AGENTS.ZAHIA.image,
  ROMA: AGENTS.ROMA.image,
};

export const EventCard = ({ event, compact = false, onClick, onToggleComplete }: EventCardProps) => {
  const config = getEventConfig(event.type);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(event.id, !event.isCompleted);
  };

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "w-full text-left p-2 rounded-lg border transition-all",
          "bg-background/80 backdrop-blur-sm hover:bg-background",
          event.isCompleted && "opacity-60"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", config.bgColor)} />
          <span className="text-xs font-medium truncate flex-1">
            {event.title}
          </span>
          {event.startTime && (
            <span className="text-[10px] text-muted-foreground">
              {event.startTime}
            </span>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        "w-full text-left p-3 rounded-xl border transition-all",
        "bg-background/80 backdrop-blur-sm hover:shadow-md",
        event.isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Toggle complete button */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            "flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            event.isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10"
          )}
          aria-label={event.isCompleted ? "Marcar como pendiente" : "Marcar como completado"}
        >
          {event.isCompleted ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Circle className="w-3 h-3 opacity-0" />
          )}
        </button>

        {/* Content area - clickable */}
        <button
          onClick={onClick}
          className="flex-1 min-w-0 text-left flex items-start gap-3"
        >
          {/* Avatar or emoji */}
          {event.avatar ? (
            <img
              src={avatarImages[event.avatar]}
              alt={event.avatar}
              className={cn(
                "w-10 h-10 rounded-full object-cover ring-2 ring-offset-1",
                event.type === 'training' ? 'ring-blue-600' 
                  : event.type === 'nutrition' ? 'ring-emerald-500' 
                  : 'ring-violet-500'
              )}
            />
          ) : (
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg",
              config.bgColor,
              "text-white"
            )}>
              {config.emoji}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-medium text-sm truncate",
                event.isCompleted && "line-through"
              )}>
                {event.title}
              </h4>
            </div>
            
            {event.startTime && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </p>
            )}
            
            {event.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </button>
        
        {/* Status indicators */}
        <div className="flex flex-col items-end gap-1">
          {event.isRecurring && (
            <span className="text-[10px] text-muted-foreground">🔄</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
