import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LEVEL_CONFIG, type PlayerLevel } from '@/types/gamification';

interface XPProgressBarProps {
  currentXP: number;
  levelProgress: number;
  currentLevel: PlayerLevel;
  nextLevelXP: number;
  compact?: boolean;
}

const barColors: Record<PlayerLevel, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-slate-400 to-slate-300',
  gold: 'from-yellow-500 to-amber-400',
  elite: 'from-cyan-400 to-blue-500',
};

export const XPProgressBar = ({ currentXP, levelProgress, currentLevel, nextLevelXP, compact }: XPProgressBarProps) => {
  const config = LEVEL_CONFIG[currentLevel];

  return (
    <div className="w-full">
      {!compact && (
        <div className="flex items-center justify-between mb-1.5">
          <span className={cn('text-xs font-semibold', config.color)}>
            {config.emoji} {config.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(levelProgress, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', barColors[currentLevel])}
        />
      </div>
      {compact && (
        <p className="text-xs text-muted-foreground mt-0.5 text-right">
          {currentXP.toLocaleString()} XP
        </p>
      )}
    </div>
  );
};
