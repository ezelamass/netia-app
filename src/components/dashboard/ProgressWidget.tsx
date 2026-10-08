import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import { AgentAvatar } from '@/components/play/AgentAvatar';

interface ProgressWidgetProps {
  userName: string;
  sport: string;
  age: number;
  streak: number;
  weeklyCompliance: number;
  delay?: number;
}

export const ProgressWidget = ({
  userName,
  sport,
  age,
  streak,
  weeklyCompliance,
  delay = 0,
}: ProgressWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="font-semibold">👦 {userName}</span>
            <span>|</span>
            <span>⚽ {sport}</span>
            <span>|</span>
            <span>Edad: {age}</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-foreground">
            Progreso
          </h3>
        </div>

        {/* Mini Avatar */}
        <div className="w-20 h-20 relative">
          <AgentAvatar agent="TINO" size={48} float />
        </div>
      </div>

      {/* Streak */}
      <div className="mb-4">
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Racha activa</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {streak} días seguidos 💥
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Compliance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Cumplimiento semanal</span>
          <span className="font-bold text-success">{weeklyCompliance}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyCompliance}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
            className="h-full gradient-teal rounded-full"
          />
        </div>
      </div>

      {/* Training content hint */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Días consecutivos de entrenamiento y contenidos completados
        </p>
      </div>
    </motion.div>
  );
};
