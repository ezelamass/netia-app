import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Building2, Heart, type LucideIcon } from 'lucide-react';
import { resetMockDataset } from '@/integrations/supabase/demo-mock-client';
import type { UserRole } from '@/contexts/AuthContext';
import { demoSession, type DemoScenario } from '@/demo/session';
import { clubStore } from '@/demo/store';

/**
 * Roles de la demo (fuente única para banner y picker).
 * La demo corre 100% en el navegador: sin cuentas, sin red, sin Supabase Auth.
 */
export interface DemoRoleConfig {
  role: UserRole;
  /** Segmento de la URL: /demo/<slug> */
  slug: 'club' | 'entrenador' | 'familia' | 'jugador';
  dashboard: string;
  label: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
  iconColor: string;
}

export const DEMO_ROLES: DemoRoleConfig[] = [
  {
    role: 'club_admin',
    slug: 'club',
    dashboard: '/club/dashboard',
    label: 'Director de club',
    icon: Building2,
    description: 'Socios, cuotas, aptos médicos y comunicación de todo el club en un panel.',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-600',
  },
  {
    role: 'coach',
    slug: 'entrenador',
    dashboard: '/club/dashboard',
    label: 'Entrenador',
    icon: Users,
    description: 'Tomá lista en segundos y mirá el semáforo de riesgo de tu categoría.',
    gradient: 'from-orange-500/10 to-amber-500/10',
    iconColor: 'text-orange-600',
  },
  {
    role: 'parent',
    slug: 'familia',
    dashboard: '/parent/dashboard',
    label: 'Familia',
    icon: Heart,
    description: 'Cuota, apto médico y avisos del club de tu hijo/a, desde el celular.',
    gradient: 'from-pink-500/10 to-rose-500/10',
    iconColor: 'text-pink-600',
  },
  {
    role: 'player',
    slug: 'jugador',
    dashboard: '/dashboard',
    label: 'Jugador',
    icon: Trophy,
    description: 'Entrenamientos, logros y el asistente IA que te acompaña.',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600',
  },
];

export const getDemoConfig = (role: UserRole): DemoRoleConfig | undefined =>
  DEMO_ROLES.find((r) => r.role === role);

export const getDemoConfigBySlug = (slug?: string): DemoRoleConfig | undefined =>
  DEMO_ROLES.find((r) => r.slug === slug);

export interface DemoLoginResult {
  ok: boolean;
  error?: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoRole: UserRole | null;
  scenario: DemoScenario;
  presentation: boolean;
  isSwitching: boolean;
  demoLogin: (role: UserRole, opts?: { scenario?: DemoScenario; presentation?: boolean }) => Promise<DemoLoginResult>;
  switchDemoRole: (role: UserRole) => Promise<DemoLoginResult>;
  resetDemo: () => void;
  exitDemo: () => Promise<void>;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const s = useSyncExternalStore(demoSession.subscribe, demoSession.get);

  const demoLogin = useCallback<DemoContextType['demoLogin']>(
    async (role, opts) => {
      const cfg = getDemoConfig(role);
      if (!cfg) return { ok: false, error: `Rol demo desconocido: ${role}` };
      demoSession.start(role, opts);
      const qs = new URLSearchParams();
      if (opts?.scenario && opts.scenario !== 'inicio') qs.set('escenario', opts.scenario);
      if (opts?.presentation) qs.set('modo', 'presentacion');
      navigate(cfg.dashboard + (qs.toString() ? `?${qs}` : ''), { replace: true });
      return { ok: true };
    },
    [navigate],
  );

  const switchDemoRole = useCallback<DemoContextType['switchDemoRole']>(
    async (role) => {
      const cfg = getDemoConfig(role);
      if (!cfg) return { ok: false, error: `Rol demo desconocido: ${role}` };
      demoSession.setRole(role);
      navigate(cfg.dashboard, { replace: true });
      return { ok: true };
    },
    [navigate],
  );

  const resetDemo = useCallback(() => {
    clubStore.reset();
    resetMockDataset();
  }, []);

  const exitDemo = useCallback(async () => {
    demoSession.exit();
    resetDemo();
    navigate('/');
  }, [navigate, resetDemo]);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode: s.active,
        demoRole: s.role,
        scenario: s.scenario,
        presentation: s.presentation,
        isSwitching: false,
        demoLogin,
        switchDemoRole,
        resetDemo,
        exitDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};
