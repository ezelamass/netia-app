import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { PageTransition } from '@/layouts/PageTransition';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import VisionSection from '@/components/landing/VisionSection';
import CampusSection from '@/components/landing/CampusSection';
import AvatarsSection from '@/components/landing/AvatarsSection';
import ParentalControlSection from '@/components/landing/ParentalControlSection';
import CtaBanner from '@/components/landing/CtaBanner';
import LandingFooter from '@/components/landing/LandingFooter';

const ROLE_DASHBOARD: Record<string, string> = {
  player: '/dashboard',
  parent: '/parent/dashboard',
  coach: '/club/dashboard',
  club_admin: '/club/dashboard',
  admin: '/admin/dashboard',
};

function LandingContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const navigate = useNavigate();
  const goDemo = () => navigate('/demo');

  useEffect(() => {
    // Wait for auth to settle so we don't redirect on a half-loaded state.
    if (isLoading) return;
    // Demo mode owns its own navigation in DemoContext — don't race it.
    if (isDemoMode) return;
    if (isAuthenticated && user) {
      const target = ROLE_DASHBOARD[user.role] ?? '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, isDemoMode, isLoading, user, navigate]);

  return (
    <>
      <div className="min-h-screen bg-white">
        <LandingNavbar onDemoClick={goDemo} onTourClick={goDemo} />
        <HeroSection onDemoClick={goDemo} />
        <StatsSection />
        <VisionSection />
        <CampusSection />
        <AvatarsSection />
        <ParentalControlSection />
        <CtaBanner onDemoClick={goDemo} />
        <LandingFooter />
      </div>
    </>
  );
}

const LandingPage = () => {
  return (
    <PageTransition>
      <LandingContent />
    </PageTransition>
  );
};

export default LandingPage;
