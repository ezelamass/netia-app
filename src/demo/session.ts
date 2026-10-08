/**
 * Estado de la sesión demo. Vive fuera de React (store externo) para que
 * AuthContext, RouteGuard y el cliente Supabase puedan consultarlo de forma
 * síncrona, sin polling ni cuentas reales.
 */
import type { UserRole } from '@/contexts/AuthContext';
import { DEMO_USER_IDS } from '@/demo/ids';

export type DemoScenario = 'inicio' | 'morosidad' | 'aptos';

export interface DemoSessionState {
  active: boolean;
  role: UserRole | null;
  scenario: DemoScenario;
  /** ?modo=presentacion: oculta banner y ayudas (para grabar videos). */
  presentation: boolean;
  /** Epoch ms del inicio, para el CTA a los 3 minutos. */
  startedAt: number | null;
}

const KEY = 'netia_demo_session';
const INITIAL: DemoSessionState = { active: false, role: null, scenario: 'inicio', presentation: false, startedAt: null };

const load = (): DemoSessionState => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...INITIAL, ...JSON.parse(raw) };
  } catch { /* sin storage */ }
  return INITIAL;
};

let state: DemoSessionState = load();
const listeners = new Set<() => void>();

const commit = (next: DemoSessionState) => {
  state = next;
  try {
    if (next.active) sessionStorage.setItem(KEY, JSON.stringify(next));
    else sessionStorage.removeItem(KEY);
  } catch { /* sin storage */ }
  listeners.forEach((l) => l());
};

export const demoSession = {
  get: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  start: (role: UserRole, opts?: { scenario?: DemoScenario; presentation?: boolean }) =>
    commit({
      active: true,
      role,
      scenario: opts?.scenario ?? 'inicio',
      presentation: opts?.presentation ?? state.presentation,
      startedAt: state.startedAt ?? Date.now(),
    }),
  setRole: (role: UserRole) => commit({ ...state, active: true, role }),
  setScenario: (scenario: DemoScenario) => commit({ ...state, scenario }),
  exit: () => commit(INITIAL),
};

export const isDemoActive = () => state.active;

// ─── Usuarios falsos por rol ─────────────────────────────────────────
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  club_admin: { id: DEMO_USER_IDS.coach, name: 'Ricardo Sosa', email: 'direccion@losceibos.demo', role: 'club_admin' },
  coach: { id: DEMO_USER_IDS.coach, name: 'Martín Acosta', email: 'martin@losceibos.demo', role: 'coach' },
  parent: { id: '7a1c0de0-0000-4000-a000-0000000000f1', name: 'Carolina Ibarra', email: 'carolina.ibarra@mail.com', role: 'parent' },
  player: { id: DEMO_USER_IDS.player, name: 'Santiago Morales', email: 'santiago@mail.com', role: 'player' },
  admin: { id: DEMO_USER_IDS.admin, name: 'Administrador', email: 'admin@netia.demo', role: 'admin' },
};
