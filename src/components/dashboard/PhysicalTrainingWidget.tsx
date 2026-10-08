import { motion } from 'framer-motion';
import { Zap, Activity, CheckCircle2 } from 'lucide-react';
import { AgentAvatar } from '@/components/play/AgentAvatar';

interface PhysicalTrainingWidgetProps {
  maxSpeed: number;
  resistance: number;
  attendance: { completed: number; total: number };
  delay?: number;
}

export const PhysicalTrainingWidget = ({
  maxSpeed,
  resistance,
  attendance,
  delay = 0,
}: PhysicalTrainingWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-2xl text-foreground">
            💪 Entrenamiento Físico
          </h3>
        </div>
        <div className="w-16 h-16">
          <AgentAvatar agent="TINO" size={48} float />
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4 mb-6">
        {/* Max Speed */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Velocidad máxima</p>
            <p className="text-xl font-display font-bold text-foreground">{maxSpeed} km/h</p>
          </div>
        </div>

        {/* Resistance */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Resistencia</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-display font-bold text-foreground">{resistance}/5</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-6 rounded-full ${
                      level <= resistance ? 'bg-success' : 'bg-secondary'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">Asistencia semanal</p>
            <p className="text-xl font-display font-bold text-foreground">
              {attendance.completed}/{attendance.total}
            </p>
          </div>
        </div>
      </div>

      {/* TINO Encouragement */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
        <p className="text-sm text-foreground font-medium">
          <span className="font-bold text-primary">TINO:</span>{' '}
          "¡Gran semana, seguí así!"
        </p>
      </div>
    </motion.div>
  );
};
