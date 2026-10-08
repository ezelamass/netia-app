import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Enrollment {
  id: string;
  clubId: string;
  clubName: string;
  role: string;
  status: string;
  joinedAt: Date;
}

export interface Club {
  id: string;
  name: string;
  logoUrl?: string;
  city?: string;
  sport?: string;
  inviteCode?: string;
  isActive: boolean;
}

const EMPTY: Enrollment[] = [];

async function fetchEnrollmentsFor(userId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, clubs(name, logo_url, city, sport)')
    .eq('user_id', userId);
  if (error || !data) return EMPTY;
  return data.map((row) => ({
    id: row.id,
    clubId: row.club_id,
    clubName: (row as { clubs?: { name?: string } }).clubs?.name || 'Club',
    role: row.role,
    status: row.status,
    joinedAt: new Date(row.joined_at),
  }));
}

export const useEnrollment = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: () => fetchEnrollmentsFor(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
  const enrollments = query.data ?? EMPTY;
  const isLoading = !!user && query.isLoading;
  const fetchEnrollments = useCallback(
    () => qc.invalidateQueries({ queryKey: ['enrollments', user?.id] }),
    [qc, user?.id],
  );

  const joinClubByCode = async (inviteCode: string) => {
    if (!user) { toast.error('Debes iniciar sesión'); return false; }

    // Find club by invite code
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (clubError || !club) {
      toast.error('Código de invitación inválido');
      return false;
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('club_id', club.id)
      .maybeSingle();

    if (existing) {
      toast.info('Ya estás inscrito en este club');
      return false;
    }

    // Create enrollment
    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        club_id: club.id,
        role: 'player',
        status: 'pending',
      });

    if (error) {
      toast.error('Error al unirse al club');
      return false;
    }

    toast.success(`¡Solicitud enviada a ${club.name}!`);
    fetchEnrollments();
    return true;
  };

  return { enrollments, isLoading, fetchEnrollments, joinClubByCode };
};
