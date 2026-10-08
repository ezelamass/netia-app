import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TodayAction as TodayActionType } from '@/hooks/useDailyLog';
import { Button } from '@/components/ui/button';
import { AGENTS } from '@/lib/avatars';

interface TodayActionProps {
  action: TodayActionType;
  onStart?: () => void;
  onComplete?: () => void;
}

const avatarImages = {
  TINO: AGENTS.TINO.image,
  ZAHIA: AGENTS.ZAHIA.image,
  ROMA: AGENTS.ROMA.image,
};

const avatarGradients = {
  TINO: 'from-blue-600/20 to-blue-400/10',
  ZAHIA: 'from-emerald-600/20 to-emerald-400/10',
  ROMA: 'from-violet-600/20 to-violet-400/10',
};

const avatarAccents = {
  TINO: 'border-blue-500/30',
  ZAHIA: 'border-emerald-500/30',
  ROMA: 'border-violet-500/30',
};

export const TodayActionCard = ({ action, onStart, onComplete }: TodayActionProps) => {
  const gradient = avatarGradients[action.avatar];
  const accent = avatarAccents[action.avatar];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4",
        "bg-gradient-to-br backdrop-blur-sm",
        gradient,
        accent,
        action.isCompleted && "opacity-80"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <img
          src={avatarImages[action.avatar]}
          alt={action.avatar}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50 ring-offset-1"
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {action.type === 'training' ? '🏋️' : 
               action.type === 'nutrition' ? '🍎' : 
               action.type === 'mental' ? '🧠' : '🌴'}
            </span>
            <h4 className={cn(
              "font-semibold text-sm truncate",
              action.isCompleted && "line-through opacity-70"
            )}>
              {action.title}
            </h4>
          </div>
          
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {action.description}
          </p>
          
          {action.duration && (
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              ⏱️ {action.duration}
            </p>
          )}
        </div>
        
        {/* Action button */}
        {action.isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <Check className="w-5 h-5" />
            <span className="text-xs font-medium">¡Bien hecho! 🎉</span>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={onStart || onComplete}
            className="gap-1 shrink-0"
          >
            Empezar
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
