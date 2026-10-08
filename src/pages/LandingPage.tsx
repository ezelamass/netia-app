import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/layouts/PageTransition';
import { roleHome } from '@/lib/roleHome';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import VisionSection from '@/components/landing/VisionSection';
import CampusSection from '@/components/landing/CampusSection';
import AvatarsSection from '@/components/landing/AvatarsSection';
import ParentalControlSection from '@/components/landing/ParentalControlSection';
import CtaBanner from '@/components/landing/CtaBanner';
import LandingFooter from '@/components/landing/LandingFooter';

const LandingPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const goDemo = () => navigate('/demo');

  useEffect(() => { document.documentElement.classList.remove('dark'); }, []);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user) navigate(roleHome(user.role), { replace: true });
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen overflow-x-clip bg-white">
        <LandingNavbar onDemoClick={goDemo} />
        <HeroSection onDemoClick={goDemo} />
        <StatsSection />
        <VisionSection />
        <CampusSection />
        <AvatarsSection />
        <ParentalControlSection />
        <section className="bg-white px-4 py-10">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 rounded-2xl border border-secondary/30 bg-secondary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 h-6 w-6 shrink-0 text-secondary" aria-hidden="true" />
              <div>
                <h2 className="font-heading text-xl font-bold">¿Tenés un club o una asociación deportiva?</h2>
                <p className="text-sm text-muted-foreground">Mirá cómo NETIA ordena socios, cuotas y aptos médicos y se la da a todas tus familias.</p>
              </div>
            </div>
            <Link to="/clubes" className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white">
              Ver NETIA para clubes <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
        <CtaBanner onDemoClick={goDemo} />
        <LandingFooter />
      </div>
    </PageTransition>
  );
};

export default LandingPage;
