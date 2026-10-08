import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PartyPopper, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { AvatarGuide } from '@/components/onboarding/AvatarGuide';
import { Button } from '@/components/ui/button';
import { getRecommendation, getAvatarIntros, getRoleMessage } from '@/lib/onboarding-recommendations';
import type { OnboardingData } from '@/contexts/OnboardingContext';
import netiaLogo from '@/assets/netia-logo.png';

const getRedirectForRole = (role: UserRole): string => {
  switch (role) {
    case 'parent': return '/parent/dashboard';
    case 'coach':
    case 'club_admin': return '/club/dashboard';
    case 'admin': return '/admin/dashboard';
    default: return '/dashboard';
  }
};

const OnboardingResult = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const role = user?.role ?? 'player';

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.onboarding && typeof profile.onboarding === 'object') {
        setOnboardingData(profile.onboarding as Partial<OnboardingData>);
      }
      setIsLoading(false);
    })();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const data = onboardingData || {};
  const fullName = (data as any).fullName || user?.name || 'Deportista';
  const firstName = fullName.split(' ')[0];
  const selectedAvatar = (data as any).selectedAvatar || 'tino';

  const handleContinue = () => {
    navigate(getRedirectForRole(role));
  };

  // Non-player roles get a simplified screen
  if (role !== 'player') {
    const { title, message } = getRoleMessage(role, fullName);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col">
        <header className="p-4 flex items-center justify-center gap-3">
          <img src={netiaLogo} alt="NETIA" className="h-8" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center mb-8"
          >
            <PartyPopper className="w-20 h-20 text-secondary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground text-lg max-w-md">{message}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button onClick={handleContinue} size="lg" className="gradient-netia text-white border-0 h-12 px-8">
              Ir a mi Panel <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Player: full result screen
  const recommendation = getRecommendation({
    role,
    level: (data as any).level || 'principiante',
    mainGoal: (data as any).mainGoal || '',
    mainSport: (data as any).mainSport,
    areasToImprove: (data as any).areasToImprove || [],
    selectedAvatar,
    fullName,
    trainingDaysPerWeek: (data as any).trainingDaysPerWeek || 3,
  });

  const otherAvatars = getAvatarIntros(selectedAvatar);

  const avatarGradients: Record<string, string> = {
    tino: 'from-tino to-tino/80',
    zahia: 'from-zahia to-zahia/80',
    roma: 'from-roma to-roma/80',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-center gap-3 border-b border-border/50">
        <img src={netiaLogo} alt="NETIA" className="h-8" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-28">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Celebration */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <PartyPopper className="w-16 h-16 text-secondary mx-auto mb-3" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-1">¡Felicitaciones, {firstName}! 🎉</h1>
            <p className="text-muted-foreground">Ya analizamos tu perfil. Esto es lo que encontramos:</p>
          </motion.div>

          {/* Level Badge */}
          <motion.div
            className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${avatarGradients[selectedAvatar] || avatarGradients.tino}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-4xl mb-2">{recommendation.levelEmoji}</div>
            <h2 className="text-xl font-bold mb-1">{recommendation.levelLabel}</h2>
            <p className="text-sm opacity-90">{recommendation.objectiveSuggestion}</p>
            <div className="mt-3 text-xs opacity-70 flex flex-wrap gap-2">
              {((data as any).areasToImprove || []).map((area: string) => (
                <span key={area} className="bg-white/20 px-2 py-0.5 rounded-full capitalize">{area}</span>
              ))}
            </div>
          </motion.div>

          {/* Main Avatar Message */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AvatarGuide
              avatar={selectedAvatar as 'tino' | 'zahia' | 'roma'}
              message={recommendation.avatarMessage}
            />
          </motion.div>

          {/* Training Tip Card */}
          <motion.div
            className="glass rounded-2xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="font-semibold text-sm mb-1 text-foreground">💡 Recomendación para hoy</h3>
            <p className="text-sm text-muted-foreground">{recommendation.trainingTip}</p>
          </motion.div>

          {/* Other Avatars Introduction */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">
              Tu equipo de avatares
            </p>
            {otherAvatars.map((av, i) => (
              <motion.div
                key={av.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.2 }}
              >
                <AvatarGuide
                  avatar={av.name.toLowerCase() as 'tino' | 'zahia' | 'roma'}
                  message={av.intro}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="max-w-lg mx-auto">
          <Button onClick={handleContinue} className="w-full h-12 gradient-netia text-white border-0">
            Ir a mi Dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingResult;
