import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { roleHome } from '@/lib/roleHome';
import { demoUi } from '@/demo/ui';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustBar from '@/components/landing/TrustBar';
import ProblemSection from '@/components/landing/ProblemSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import AiSection from '@/components/landing/AiSection';
import FamiliesSection from '@/components/landing/FamiliesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import FaqSection, { FAQ_ITEMS } from '@/components/landing/FaqSection';
import FinalCta from '@/components/landing/FinalCta';
import LandingFooter from '@/components/landing/LandingFooter';
import { LeadForm } from '@/components/demo/LeadForm';
import { INSTITUTIONAL_VIDEO } from '@/config/media';

const VideoModal = lazy(() => import('@/components/landing/VideoModal'));

const LandingPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (isLoading || isDemoMode) return;
    if (isAuthenticated && user) navigate(roleHome(user.role), { replace: true });
  }, [isAuthenticated, isDemoMode, isLoading, user, navigate]);

  // Datos estructurados para buscadores
  useEffect(() => {
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'NETIA',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'Software para la gestión de clubes y asociaciones deportivas: socios, cuotas, aptos médicos y comunicación.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ]);
    document.head.appendChild(ld);
    return () => { document.head.removeChild(ld); };
  }, []);

  const openContact = () => demoUi.openLead();

  return (
    <div className="min-h-screen-dvh bg-background pb-20 md:pb-0">
      <LandingNavbar onContactClick={openContact} />
      <main>
        <HeroSection onContactClick={openContact} onVideoClick={() => setVideoOpen(true)} />
        <TrustBar />
        <ProblemSection />
        <FeaturesSection />
        <AiSection />
        <FamiliesSection />
        <HowItWorksSection />
        <PricingSection onContactClick={openContact} />
        <FaqSection />
        <FinalCta onContactClick={openContact} />
      </main>
      <LandingFooter onContactClick={openContact} />

      {/* CTA fijo en mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 pb-safe backdrop-blur md:hidden">
        <Button asChild className="h-11 w-full text-base"><Link to="/demo">Probá la demo, sin registrarte</Link></Button>
      </div>

      <LeadForm />
      {INSTITUTIONAL_VIDEO.src && (
        <Suspense fallback={null}>{videoOpen && <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />}</Suspense>
      )}
    </div>
  );
};

export default LandingPage;
