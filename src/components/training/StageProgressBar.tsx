import { TRAINING_STAGES, TrainingStage } from '@/hooks/useTrainingPlan';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface StageProgressBarProps {
  currentStage: TrainingStage;
}

export function StageProgressBar({ currentStage }: StageProgressBarProps) {
  const currentIndex = TRAINING_STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentIndex / (TRAINING_STAGES.length - 1)) * (100 - 8)}%` }}
        />

        {TRAINING_STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-1.5 relative z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground border border-border'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stage.shortLabel}
              </motion.div>
              <span className={cn(
                'text-xs font-medium text-center leading-tight max-w-[70px]',
                isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: compact */}
      <div className="sm:hidden flex items-center gap-1.5 justify-center">
        {TRAINING_STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/20',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}>
                {isCompleted ? <Check className="w-3 h-3" /> : stage.shortLabel}
              </div>
              {isCurrent && (
                <span className="text-xs font-medium text-primary">{stage.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
