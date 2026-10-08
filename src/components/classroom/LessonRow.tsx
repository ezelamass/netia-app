import { Check, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LessonRowProps {
  id: string;
  title: string;
  durationMin: number;
  number: number;
  isCompleted: boolean;
  isLocked: boolean;
  hasQuiz: boolean;
  onClick: () => void;
  index: number;
}

export function LessonRow({
  title, durationMin, number, isCompleted, isLocked, hasQuiz, onClick, index,
}: LessonRowProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer',
        isCompleted && 'bg-emerald-50/50 dark:bg-emerald-950/10'
      )}
    >
      {/* Status circle */}
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
        isCompleted && 'bg-emerald-500',
        !isCompleted && !isLocked && 'bg-muted',
        isLocked && 'bg-muted',
      )}>
        {isCompleted ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : isLocked ? (
          <Lock className="w-3 h-3 text-muted-foreground" />
        ) : (
          <span className="text-xs font-bold text-muted-foreground">{number}</span>
        )}
      </div>

      {/* Title + duration */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', isCompleted && 'text-emerald-700 dark:text-emerald-400')}>
          {title}
        </p>
        {durationMin > 0 && (
          <p className="text-xs text-muted-foreground">{durationMin} min</p>
        )}
      </div>

      {/* Quiz badge */}
      {hasQuiz && (
        <Badge variant="secondary" className="text-xs shrink-0">Quiz</Badge>
      )}
    </motion.button>
  );
}
