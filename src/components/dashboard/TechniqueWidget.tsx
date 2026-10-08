import { motion } from 'framer-motion';
import { Brain, Target, Zap } from 'lucide-react';
import { AgentAvatar } from '@/components/play/AgentAvatar';

interface TechniqueWidgetProps {
  correctDecisions: number;
  concentration: number;
  reactionTime: number;
  delay?: number;
}

export const TechniqueWidget = ({
  correctDecisions,
  concentration,
  reactionTime,
  delay = 0,
}: TechniqueWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-2xl text-foreground">
          Técnica y Táctica
        </h3>
        <div className="w-16 h-16">
          <AgentAvatar agent="ROMA" size={48} float />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4 mb-6">
        {/* Correct Decisions */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Decisiones correctas</p>
            <p className="text-xl font-display font-bold text-foreground">{correctDecisions}%</p>
          </div>
        </div>

        {/* Concentration */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Concentración promedio</p>
            <p className="text-xl font-display font-bold text-foreground">{concentration}/10</p>
          </div>
        </div>

        {/* Reaction Time */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Tiempo de reacción</p>
            <p className="text-xl font-display font-bold text-foreground">{reactionTime}s</p>
          </div>
        </div>
      </div>

      {/* ROMA Advice */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
        <p className="text-sm text-foreground font-medium">
          <span className="font-bold text-primary">ROMA:</span>{' '}
          "Visualizá el recorrido antes de salir al agua. Tu mente guía tu timón."
        </p>
      </div>
    </motion.div>
  );
};
