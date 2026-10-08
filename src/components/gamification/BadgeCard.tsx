import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface BadgeCardProps {
  badge: {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    requirement: number;
    current: number;
    progress: number;
    isUnlocked: boolean;
  };
  index?: number;
  compact?: boolean;
  /** Recién desbloqueado: el ícono entra con pop-in (spring) */
  celebrate?: boolean;
}

const categoryColors: Record<string, { bg: string; border: string }> = {
  streak: { bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  xp: { bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  wellness: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  training: { bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export const BadgeCard = ({ badge, index = 0, compact, celebrate }: BadgeCardProps) => {
  const colors = categoryColors[badge.category] || categoryColors.streak;

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.05 }}
        title={badge.title}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-lg',
          badge.isUnlocked ? colors.bg : 'bg-muted grayscale opacity-40'
        )}
      >
        {badge.icon}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl border transition-all',
        badge.isUnlocked
          ? `${colors.bg} ${colors.border}`
          : 'bg-muted/30 border-border/50 opacity-70'
      )}
    >
      <div className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0',
        badge.isUnlocked ? colors.bg : 'bg-muted',
        celebrate && 'animate-pop-in'
      )}>
        {badge.isUnlocked ? badge.icon : '🔒'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{badge.title}</h4>
          {badge.isUnlocked && (
            <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full">
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{badge.description}</p>

        {!badge.isUnlocked && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{badge.current} / {badge.requirement}</span>
              <span>{Math.round(badge.progress)}%</span>
            </div>
            <Progress value={badge.progress} className="h-1.5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
