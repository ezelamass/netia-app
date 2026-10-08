import { motion } from 'framer-motion';
import { Calendar, Target, Flame } from 'lucide-react';
import { CalendarEvent, getEventConfig } from '@/hooks/useCalendarEvents';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/avatars';

interface CalendarSummaryProps {
  nextEvent: CalendarEvent | null;
  weekStats: { total: number; completed: number; pending: number };
  streak: number;
}

const avatarImages = {
  TINO: AGENTS.TINO.image,
  ZAHIA: AGENTS.ZAHIA.image,
  ROMA: AGENTS.ROMA.image,
};

export const CalendarSummary = ({ nextEvent, weekStats, streak }: CalendarSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {/* Next event */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 md:col-span-2 bg-background/60 backdrop-blur-sm rounded-xl border p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Próximo evento</h3>
        </div>
        
        {nextEvent ? (
          <div className="flex items-center gap-3">
            {nextEvent.avatar ? (
              <img
                src={avatarImages[nextEvent.avatar]}
                alt={nextEvent.avatar}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-primary/30"
              />
            ) : (
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-xl",
                getEventConfig(nextEvent.type).bgColor,
                "text-white"
              )}>
                {getEventConfig(nextEvent.type).emoji}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{nextEvent.title}</h4>
              <p className="text-sm text-muted-foreground">
                {format(nextEvent.date, "EEEE d 'de' MMMM", { locale: es })}
                {nextEvent.startTime && ` • ${nextEvent.startTime}`}
              </p>
              <p className="text-xs text-primary mt-1">
                {formatDistanceToNow(nextEvent.date, { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay eventos próximos</p>
        )}
      </motion.div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
        {/* Week progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background/60 backdrop-blur-sm rounded-xl border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-medium text-muted-foreground">Esta semana</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{weekStats.completed}</span>
            <span className="text-muted-foreground">/{weekStats.total}</span>
          </div>
          <p className="text-xs text-muted-foreground">entrenamientos</p>
        </motion.div>
        
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background/60 backdrop-blur-sm rounded-xl border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-medium text-muted-foreground">Racha</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{streak}</span>
            <span className="text-muted-foreground">días</span>
          </div>
          <p className="text-xs text-muted-foreground">consecutivos 🔥</p>
        </motion.div>
      </div>
    </div>
  );
};
