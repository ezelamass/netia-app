import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTrainingPlan } from '@/hooks/useTrainingPlan';
import { GuidedSession } from '@/components/training/GuidedSession';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const TrainingSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plan, isLoading, completeSession, xpPerSession } = useTrainingPlan();
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return <div className="fixed inset-0 z-[60] bg-background p-6"><Skeleton className="h-full w-full rounded-2xl" /></div>;
  }
  const session = plan?.weekSessions.find((s) => s.status === 'today');
  if (!session || session.type === 'rest' || !session.exercises.length) return <Navigate to="/training" replace />;

  const finish = async (rpe: number) => {
    setSaving(true);
    const ok = await completeSession(session.id, rpe);
    setSaving(false);
    if (!ok) {
      toast({ title: 'No pudimos guardar', description: 'Probá de nuevo en un rato.', variant: 'destructive' });
      return;
    }
    if (!prefersReducedMotion()) confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, disableForReducedMotion: true });
    toast({ title: `¡Sesión completa! +${xpPerSession} XP` });
    navigate('/training', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background" role="dialog" aria-label={`Sesión guiada: ${session.title}`}>
      <GuidedSession session={session} saving={saving} onExit={() => navigate('/training')} onFinish={finish} />
    </div>
  );
};

export default TrainingSession;
