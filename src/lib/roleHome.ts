import type { UserRole } from '@/contexts/AuthContext';

export const roleHome = (role?: UserRole): string => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'coach':
    case 'club_admin': return '/club/dashboard';
    case 'parent': return '/parent/dashboard';
    default: return '/dashboard';
  }
};
