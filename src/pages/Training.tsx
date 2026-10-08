import { Suspense, lazy, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { useTrainingPlan, TRAINING_STAGES } from '@/hooks/useTrainingPlan';
import type { TrainingPlan } from '@/hooks/useTrainingPlan';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  StageProgressBar,
  CycleGoalCard,
  WeeklyMicrocycle,
  SessionDetail,
  ComplianceCard,
  LoadRecoveryCard,
} from '@/components/training';
import { Dumbbell, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { CardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';

const DiagnosticRadar = lazy(() => import('@/components/training/DiagnosticRadar').then((m) => ({ default: m.DiagnosticRadar })));

const Training = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plan, isLoading } = useTrainingPlan();
  const [userSport, setUserSport] = useState<string | null>(null);
  const [sportLoading, setSportLoading] = useState(true);

  // Fetch user's actual sport to decide empty-state messaging
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('sport')
        .eq('id', user.id)
        .maybeSingle();
      setUserSport(data?.sport ?? null);
      setSportLoading(false);
    })();
  }, [user?.id]);

  const todayIndex = plan?.weekSessions.find(s => s.status === 'today')?.dayIndex ?? 3;
  const [selectedDay, setSelectedDay] = useState<number>(todayIndex);

  const selectedSession = plan?.weekSessions.find(s => s.dayIndex === selectedDay) || plan?.weekSessions[0];

  if (isLoading || sportLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 pb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </AppLayout>
    );
  }

  // Empty state: no plan yet
  if (!plan) {
    const isTenis = userSport?.toLowerCase() === 'tenis';
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center space-y-4 p-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
              {isTenis ? (
                <Clock className="w-7 h-7 text-primary-foreground" />
              ) : (
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isTenis
                ? 'Tu plan se está preparando'
                : userSport
                  ? `Próximamente disponible para ${userSport}`
                  : 'Completá tu perfil'}
            </h1>
            <p className="text-muted-foreground">
              {isTenis
                ? 'Estamos armando tu plan personalizado. Mientras tanto, registrá tu día para que podamos ajustarlo a vos.'
                : userSport
                  ? 'Estamos trabajando para traer contenido específico de tu deporte. Por ahora te avisamos cuando esté listo.'
                  : 'Necesitamos saber tu deporte para armar tu plan de entrenamiento.'}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Volver al panel
              </Button>
              {!userSport && (
                <Button onClick={() => navigate('/onboarding')} className="gradient-netia text-white border-0">
                  Completar perfil
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Mi Plan de Entrenamiento</h1>
              <p className="text-xs text-muted-foreground">{plan.sport} · {plan.category} · {plan.cycleName}</p>
            </div>
          </div>
        </motion.div>

        {/* Stage Progress */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-sm border border-border"
        >
          <StageProgressBar currentStage={plan.currentStage} />
        </motion.div>

        {/* Goal + Diagnostic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CycleGoalCard
            objective={plan.objective}
            cycleName={plan.cycleName}
            currentWeek={plan.currentWeek}
            totalWeeks={plan.totalWeeks}
          />
          <Suspense fallback={<CardSkeleton />}>
            <DiagnosticRadar diagnostic={plan.diagnostic} />
          </Suspense>
        </div>

        {/* Weekly Microcycle */}
        {plan.weekSessions.length > 0 && (
          <>
            <WeeklyMicrocycle
              sessions={plan.weekSessions}
              onSelectDay={setSelectedDay}
              selectedDay={selectedDay}
            />
            {selectedSession && <SessionDetail session={selectedSession} />}
          </>
        )}

        {/* Compliance + Load Recovery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ComplianceCard compliance={plan.compliance} />
          <LoadRecoveryCard data={plan.loadRecovery} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Training;
