import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Medal, Filter } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useGamification } from '@/hooks/useGamification';
import { calculateStatus, INDICATORS } from '@/hooks/useWellnessStatus';
import { Sparkline } from '@/components/dashboard/Sparkline';
import { LevelBadge, XPProgressBar, BadgeCard, StreakDisplay } from '@/components/gamification';

const Achievements = () => {
  const { logs, getStreak, getXP, getLogsForDays } = useDailyLog();
  const {
    currentLevel, currentXP, nextLevelXP, levelProgress,
    badgeProgress, unlockedCount, totalBadges,
  } = useGamification();

  const streak = getStreak();
  const recentLogs = getLogsForDays(28);

  // Historical data for charts
  const historicalData = useMemo(() => {
    const last7Days = getLogsForDays(7);
    return {
      sleep: last7Days.map(l => l.sleep),
      hydration: last7Days.map(l => l.hydration),
      energy: last7Days.map(l => l.energy),
      pain: last7Days.map(l => 10 - l.pain),
    };
  }, [getLogsForDays]);

  const weeklyAverages = useMemo(() => {
    const last7Days = getLogsForDays(7);
    if (last7Days.length === 0) return { sleep: 0, hydration: 0, energy: 0, pain: 0 };
    return {
      sleep: last7Days.reduce((sum, l) => sum + l.sleep, 0) / last7Days.length,
      hydration: last7Days.reduce((sum, l) => sum + l.hydration, 0) / last7Days.length,
      energy: last7Days.reduce((sum, l) => sum + l.energy, 0) / last7Days.length,
      pain: last7Days.reduce((sum, l) => sum + l.pain, 0) / last7Days.length,
    };
  }, [getLogsForDays]);

  // Heatmap
  const heatmapData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 28 }, (_, i) => {
      const date = subDays(today, 27 - i);
      const log = logs.find(l => format(l.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
      return { date, status: log ? calculateStatus(log) : 'none' as const };
    });
  }, [logs]);

  const unlockedBadges = badgeProgress.filter(b => b.isUnlocked);

  // Logro desbloqueado: pop-in con spring + confeti chico (importado recién al disparar).
  // La primera visita no celebra lo que ya estaba: solo lo que se desbloqueó desde la última vez.
  const [justUnlocked, setJustUnlocked] = useState<ReadonlySet<string>>(new Set());
  const unlockedKey = unlockedBadges.map(b => b.id).join(',');
  useEffect(() => {
    try {
      const KEY = 'netia_seen_badges';
      const raw = localStorage.getItem(KEY);
      const now = unlockedKey ? unlockedKey.split(',') : [];
      if (raw !== null) {
        const seen = new Set<string>(JSON.parse(raw));
        const fresh = now.filter(id => !seen.has(id));
        if (fresh.length) {
          setJustUnlocked(new Set(fresh));
          void import('canvas-confetti').then(m => m.default({ particleCount: 40, spread: 70, origin: { y: 0.35 }, scalar: 0.8, disableForReducedMotion: true }));
        }
      }
      localStorage.setItem(KEY, JSON.stringify(now));
    } catch { /* sin storage */ }
  }, [unlockedKey]);
  const lockedBadges = badgeProgress.filter(b => !b.isUnlocked);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero: Level + XP + Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <LevelBadge level={currentLevel} size="lg" />
                <StreakDisplay streak={streak} />
              </div>
              <XPProgressBar
                currentXP={currentXP}
                levelProgress={levelProgress}
                currentLevel={currentLevel}
                nextLevelXP={nextLevelXP}
              />
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{currentXP.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-muted-foreground">Días racha</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{unlockedCount}/{totalBadges}</p>
                  <p className="text-xs text-muted-foreground">Insignias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Actividad · 28 días
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-muted-foreground mb-1">{day}</div>
                ))}
                {heatmapData.map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className={cn(
                      'aspect-square rounded-sm',
                      day.status === 'green' && 'bg-emerald-500',
                      day.status === 'yellow' && 'bg-yellow-500',
                      day.status === 'red' && 'bg-red-500',
                      day.status === 'none' && 'bg-muted'
                    )}
                    title={format(day.date, 'd MMM', { locale: es })}
                  />
                ))}
              </div>
              <div className="flex items-center justify-end gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted" /> Sin datos</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Verde</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500" /> Atención</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> Alerta</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Promedios semanales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {INDICATORS.map(indicator => {
                  const key = indicator.key as keyof typeof weeklyAverages;
                  const avg = weeklyAverages[key];
                  const data = historicalData[key];
                  return (
                    <div key={indicator.key} className="p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{indicator.emoji}</span>
                        <span className="text-sm font-medium">{indicator.label}</span>
                      </div>
                      <p className="text-2xl font-bold mb-2">
                        {avg.toFixed(1)}
                        <span className="text-sm font-normal text-muted-foreground">{indicator.unit}</span>
                      </p>
                      <Sparkline
                        data={data}
                        color={
                          indicator.key === 'sleep' && avg >= 7 ? '#22C55E' :
                          indicator.key === 'hydration' && avg >= 1.5 ? '#22C55E' :
                          indicator.key === 'energy' && avg >= 4 ? '#22C55E' :
                          indicator.key === 'pain' && avg <= 2 ? '#22C55E' :
                          '#EAB308'
                        }
                        width={80}
                        height={24}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Badges with tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Medal className="w-5 h-5" />
                Insignias ({unlockedCount}/{totalBadges})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-3">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="streak">Racha</TabsTrigger>
                  <TabsTrigger value="xp">XP</TabsTrigger>
                  <TabsTrigger value="wellness">Bienestar</TabsTrigger>
                  <TabsTrigger value="training">Entreno</TabsTrigger>
                </TabsList>

                {['all', 'streak', 'xp', 'wellness', 'training'].map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-2">
                    {(tab === 'all' ? badgeProgress : badgeProgress.filter(b => b.category === tab))
                      .sort((a, b) => (b.isUnlocked ? 1 : 0) - (a.isUnlocked ? 1 : 0))
                      .map((badge, i) => (
                        <BadgeCard key={badge.id} badge={badge} index={i} celebrate={justUnlocked.has(badge.id)} />
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Historial reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentLogs.slice().reverse().slice(0, 14).map(log => {
                  const status = calculateStatus(log);
                  return (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        'w-3 h-3 rounded-full shrink-0',
                        status === 'green' && 'bg-emerald-500',
                        status === 'yellow' && 'bg-yellow-500',
                        status === 'red' && 'bg-red-500'
                      )} />
                      <span className="text-sm text-muted-foreground w-24">
                        {format(log.date, 'd MMM', { locale: es })}
                      </span>
                      <div className="flex-1 flex items-center gap-3 text-xs">
                        <span>😴 {log.sleep.toFixed(1)}h</span>
                        <span>💧 {log.hydration.toFixed(1)}L</span>
                        <span>⚡ {log.energy}/5</span>
                        <span>🦵 {log.pain}/10</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Achievements;
