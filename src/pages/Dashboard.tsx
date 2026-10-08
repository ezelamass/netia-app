import { AppLayout } from '@/layouts/AppLayout';
import { TodayCard } from '@/components/dashboard/TodayCard';
import { ProgressWidget } from '@/components/dashboard/ProgressWidget';
import { HealthWidget } from '@/components/dashboard/HealthWidget';
import { TechniqueWidget } from '@/components/dashboard/TechniqueWidget';
import { PhysicalTrainingWidget } from '@/components/dashboard/PhysicalTrainingWidget';
import { EvolutionWidget } from '@/components/dashboard/EvolutionWidget';
import { GamificationWidget } from '@/components/dashboard/GamificationWidget';
import { JoinClubModal } from '@/components/enrollment/JoinClubModal';
import { EnrollmentsList } from '@/components/enrollment/EnrollmentsList';
import { AvatarMessageWidget } from '@/components/dashboard/AvatarMessageWidget';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CardSkeleton } from '@/components/skeletons';

const Dashboard = () => {
  const { profile, stats, health, weeklyCompliance, diagnosticScores, isLoading } = useDashboardData();

  const userName = profile?.fullName?.split(' ')[0] || 'Deportista';
  const sport = profile?.sport || 'Deporte';
  const age = profile?.age || 0;
  const streak = stats?.streak || 0;

  const sleepFormatted = health
    ? `${Math.floor(health.sleepHours)}h ${Math.round((health.sleepHours % 1) * 60)}m`
    : '—';

  return (
    <AppLayout>
      {/* Hero - Today Card */}
      <div className="mb-6">
        <TodayCard />
      </div>

      {/* Avatar Message */}
      <div className="mb-6">
        <AvatarMessageWidget
          streak={streak}
          hasLogToday={!!health}
          energyLevel={health?.energyLevel ?? null}
        />
      </div>

      {/* Club Enrollment */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-end">
          <JoinClubModal />
        </div>
        <EnrollmentsList />
      </div>

      {/* Gamification + Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GamificationWidget delay={0.05} />
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <ProgressWidget
            userName={userName}
            sport={sport}
            age={age}
            streak={streak}
            weeklyCompliance={weeklyCompliance}
            delay={0.1}
          />
        )}
      </div>

      {/* Second Row - Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <HealthWidget
            hydration={health?.hydration ?? 0}
            sleep={sleepFormatted}
            recovery={health?.recovery ?? 'optimal'}
            delay={0.2}
          />
        )}
      </div>

      {/* Third Row - Technique and Physical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <TechniqueWidget
              correctDecisions={diagnosticScores.technique > 0 ? Math.round(diagnosticScores.technique * 10) : 0}
              concentration={diagnosticScores.mental > 0 ? diagnosticScores.mental : 0}
              reactionTime={0}
              delay={0.3}
            />
            <PhysicalTrainingWidget
              maxSpeed={0}
              resistance={diagnosticScores.physical > 0 ? Math.min(5, Math.round(diagnosticScores.physical / 2)) : 0}
              attendance={{ completed: stats?.totalLogs ?? 0, total: 7 }}
              delay={0.35}
            />
          </>
        )}
      </div>

      {/* Evolution */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <EvolutionWidget
            physical={diagnosticScores.physical}
            technique={diagnosticScores.technique}
            mental={diagnosticScores.mental}
            delay={0.4}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
