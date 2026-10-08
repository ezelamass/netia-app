import { motion } from 'framer-motion';
import { Droplet, Moon, Heart } from 'lucide-react';
import { AgentAvatar } from '@/components/play/AgentAvatar';

interface HealthWidgetProps {
  hydration: number;
  sleep: string;
  recovery: 'optimal' | 'good' | 'needs-rest';
  delay?: number;
}

const recoveryConfig = {
  optimal: { text: '🟢 Óptima', color: 'text-success' },
  good: { text: '🟡 Buena', color: 'text-warning' },
  'needs-rest': { text: '🔴 Necesita descanso', color: 'text-danger' },
};

export const HealthWidget = ({
  hydration,
  sleep,
  recovery,
  delay = 0,
}: HealthWidgetProps) => {
  const recoveryStatus = recoveryConfig[recovery];

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
          Salud e Hidratación
        </h3>
        <div className="w-16 h-16">
          <AgentAvatar agent="ZAHIA" size={48} float />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4 mb-6">
        {/* Hydration */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Hidratación diaria</p>
            <p className="text-xl font-display font-bold text-foreground">{hydration}L</p>
          </div>
        </div>

        {/* Sleep */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Sueño promedio</p>
            <p className="text-xl font-display font-bold text-foreground">{sleep}</p>
          </div>
        </div>

        {/* Recovery */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Recuperación muscular</p>
            <p className={`text-lg font-display font-bold ${recoveryStatus.color}`}>
              {recoveryStatus.text}
            </p>
          </div>
        </div>
      </div>

      {/* ZAHIA Advice */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-4 border border-teal-100">
        <p className="text-sm text-foreground font-medium">
          <span className="font-bold text-primary">ZAHIA:</span>{' '}
          "Llevá tu botella siempre al agua. Una buena hidratación mejora tus reflejos."
        </p>
      </div>
    </motion.div>
  );
};
