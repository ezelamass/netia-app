import { createContext, useContext, useState, useEffect, useSyncExternalStore, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { demoSession, DEMO_USERS } from '@/demo/session';

export type UserRole = 'player' | 'parent' | 'coach' | 'club_admin' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Priority order: highest-privilege role wins when a user has multiple rows
// in user_roles. Without this, a `.limit(1)` fetch could return 'player' for
// an admin and send them to the wrong dashboard.
const ROLE_PRIORITY: UserRole[] = ['admin', 'club_admin', 'coach', 'parent', 'player'];

const pickHighestRole = (roles: Array<string | null | undefined>): UserRole => {
  const validRoles: UserRole[] = ['player', 'parent', 'coach', 'club_admin', 'admin'];
  const valid = roles.filter((r): r is UserRole => !!r && validRoles.includes(r as UserRole));
  if (valid.length === 0) return 'player';
  for (const candidate of ROLE_PRIORITY) {
    if (valid.includes(candidate)) return candidate;
  }
  return 'player';
};

const buildUser = async (supabaseUser: SupabaseUser): Promise<User> => {
  // Fetch ALL roles for this user, then pick the highest-privilege one.
  // This fixes the case where a user has multiple rows in user_roles
  // (e.g. admin + player) and a single-row fetch could pick the wrong one.
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id);

  if (roleError) {
    console.error('Failed to fetch user role:', roleError);
    throw new Error(`Role fetch failed: ${roleError.message}`);
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', supabaseUser.id)
    .maybeSingle();

  if (profileError) {
    console.error('Failed to fetch profile:', profileError);
  }

  return {
    id: supabaseUser.id,
    name: profile?.full_name || supabaseUser.user_metadata?.full_name || '',
    email: supabaseUser.email || '',
    role: pickHighestRole((roleData ?? []).map((r) => r.role)),
    avatar: profile?.avatar_url || undefined,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [realUser, setUser] = useState<User | null>(null);
  const [realLoading, setIsLoading] = useState(true);
  // Demo: usuario inyectado, sin pasar por Supabase Auth.
  const demo = useSyncExternalStore(demoSession.subscribe, demoSession.get);
  const demoUser = demo.active && demo.role ? DEMO_USERS[demo.role] ?? null : null;
  const user: User | null = demoUser ?? realUser;
  const isLoading = demoUser ? false : realLoading;

  useEffect(() => {
    let mounted = true;

    // The callback runs inside Supabase's auth lock; any awaited query that
    // internally refreshes the token deadlocks here. Defer DB work with
    // setTimeout(0) so it runs after the lock is released.
    // https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const supabaseUser = session?.user ?? null;

      if (!supabaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setTimeout(async () => {
        try {
          const appUser = await buildUser(supabaseUser);
          if (mounted) setUser(appUser);
        } catch (err) {
          console.error('Failed to build user:', err);
          if (mounted) setUser(null);
        } finally {
          if (mounted) setIsLoading(false);
        }
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole = 'player') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (demoSession.get().active) {
      demoSession.exit();
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
