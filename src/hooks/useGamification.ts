import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerStats, Badge, calculateLevel, getNextLevelXP, LEVEL_THRESHOLDS, PlayerLevel } from '@/types/gamification';
import { useDailyLog } from './useDailyLog';
import { calculateStatus } from './useWellnessStatus';

interface BadgeWithProgress extends Badge {
  current: number;
  progress: number;
}

type DbBadge = { id: string; title: string; description: string; icon: string; category: string; requirement: number; xp_reward: number };

interface GamificationData {
  stats: PlayerStats | null;
  dbBadges: DbBadge[];
  earned: Array<{ badge_id: string; earned_at?: string | null }>;
}

const EMPTY_BADGES: DbBadge[] = [];
const EMPTY_EARNED: GamificationData['earned'] = [];

async function fetchGamification(userId: string): Promise<GamificationData> {
  const [statsRes, badgesRes, earnedRes] = await Promise.all([
    supabase.from('player_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('badges').select('*'),
    supabase.from('player_badges').select('badge_id, earned_at').eq('user_id', userId),
  ]);
  return {
    stats: !statsRes.error && statsRes.data ? {
      xp: statsRes.data.xp,
      level: statsRes.data.level as PlayerLevel,
      currentStreak: statsRes.data.current_streak,
      longestStreak: statsRes.data.longest_streak,
      totalLogs: statsRes.data.total_logs,
      totalTrainingMin: statsRes.data.total_training_min,
      badges: [],
    } : null,
    dbBadges: !badgesRes.error && badgesRes.data ? (badgesRes.data as unknown as DbBadge[]) : EMPTY_BADGES,
    earned: !earnedRes.error && earnedRes.data ? earnedRes.data : EMPTY_EARNED,
  };
}

export const useGamification = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { logs, getStreak, getXP } = useDailyLog();
  const query = useQuery({
    queryKey: ['gamification', user?.id],
    queryFn: () => fetchGamification(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
  const stats = query.data?.stats ?? null;
  const dbBadges = query.data?.dbBadges ?? EMPTY_BADGES;
  const earned = query.data?.earned ?? EMPTY_EARNED;
  const earnedBadgeIds = useMemo(() => new Set(earned.map((r) => r.badge_id)), [earned]);
  const isLoading = !!user && query.isLoading;
  const attempted = useRef<Set<string>>(new Set());

  // Calculate badge progress from local data
  const badgeProgress = useMemo((): BadgeWithProgress[] => {
    const streak = getStreak();
    const xp = getXP();
    const greenDays = logs.filter(log => calculateStatus(log) === 'green').length;
    const goodSleepDays = logs.filter(log => log.sleep >= 8).length;
    const goodHydrationDays = logs.filter(log => log.hydration >= 2).length;
    const trainingDays = logs.filter(log => log.trained).length;

    return dbBadges.map(badge => {
      let current = 0;
      switch (badge.id) {
        case 'streak-7': case 'streak-30': case 'streak-100': current = streak; break;
        case 'xp-500': case 'xp-1000': case 'xp-2500': current = xp; break;
        case 'green-5': current = greenDays; break;
        case 'sleep-7': current = goodSleepDays; break;
        case 'hydration-7': current = goodHydrationDays; break;
        case 'training-10': case 'training-50': case 'training-100': current = trainingDays; break;
      }

      const isUnlocked = earnedBadgeIds.has(badge.id) || current >= badge.requirement;

      return {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        category: badge.category as Badge['category'],
        requirement: badge.requirement,
        isUnlocked,
        current,
        progress: badge.requirement > 0 ? Math.min((current / badge.requirement) * 100, 100) : isUnlocked ? 100 : 0,
      };
    });
  }, [logs, getStreak, getXP, dbBadges, earnedBadgeIds]);

  // Auto-award badges
  const awardNewBadges = useCallback(async () => {
    if (!user) return;
    const newlyEarned = badgeProgress.filter(b => b.isUnlocked && !earnedBadgeIds.has(b.id) && !attempted.current.has(b.id));
    if (newlyEarned.length === 0) return;

    for (const badge of newlyEarned) {
      attempted.current.add(badge.id);
      await supabase.from('player_badges').upsert(
        { user_id: user.id, badge_id: badge.id },
        { onConflict: 'user_id,badge_id' }
      );
    }
    qc.invalidateQueries({ queryKey: ['gamification', user.id] });
  }, [user, badgeProgress, earnedBadgeIds, qc]);

  useEffect(() => { awardNewBadges(); }, [awardNewBadges]);

  const currentLevel = useMemo(() => calculateLevel(getXP()), [getXP]);
  const nextLevelXP = useMemo(() => getNextLevelXP(currentLevel), [currentLevel]);
  const currentXP = getXP();
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel];
  const levelProgress = nextLevelXP > currentLevelXP
    ? ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100;

  const syncStats = useCallback(async () => {
    if (!user) return;
    const streak = getStreak();
    const xp = getXP();

    await supabase
      .from('player_stats')
      .update({
        xp,
        level: calculateLevel(xp),
        current_streak: streak,
        longest_streak: Math.max(streak, stats?.longestStreak || 0),
        total_logs: logs.length,
        total_training_min: logs.reduce((sum, l) => sum + (l.trainingDurationMin || 0), 0),
      })
      .eq('user_id', user.id);
  }, [user, logs, getStreak, getXP, stats]);

  return {
    stats, isLoading, badgeProgress, earned, currentLevel, currentXP,
    nextLevelXP, levelProgress, syncStats,
    unlockedCount: badgeProgress.filter(b => b.isUnlocked).length,
    totalBadges: dbBadges.length,
  };
};
