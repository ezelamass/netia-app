import {
  Home, Dumbbell, Calendar, MessageCircle, Trophy, Users, FileText, Bell, Shield, UserCog,
  BarChart3, Award, Heart, GraduationCap, Wallet, Layers, ClipboardCheck, Swords, Stethoscope,
  Activity, Megaphone, Settings, type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { loaders } from '@/routes/lazyPages';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  /** Texto corto para la barra inferior en mobile */
  short?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const clubGroups: NavGroup[] = [
  {
    label: 'Gestión',
    items: [
      { label: 'Inicio', short: 'Inicio', icon: Home, href: '/club/dashboard' },
      { label: 'Socios y deportistas', short: 'Socios', icon: Users, href: '/club/members' },
      { label: 'Categorías y equipos', short: 'Categorías', icon: Layers, href: '/club/teams' },
      { label: 'Calendario y partidos', short: 'Partidos', icon: Swords, href: '/club/fixtures' },
      { label: 'Asistencia', short: 'Asistencia', icon: ClipboardCheck, href: '/club/attendance' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { label: 'Cuotas y pagos', short: 'Cuotas', icon: Wallet, href: '/club/fees' },
      { label: 'Aptos médicos', icon: Stethoscope, href: '/club/medical' },
      { label: 'Comunicación', icon: Megaphone, href: '/club/communication' },
      { label: 'Informes', icon: FileText, href: '/club/reports' },
    ],
  },
  {
    label: 'Rendimiento',
    items: [
      { label: 'Carga y semáforo', icon: Activity, href: '/club/training-load' },
      { label: 'Aula', icon: GraduationCap, href: '/classroom' },
      { label: 'Asistente IA', icon: MessageCircle, href: '/chat' },
    ],
  },
];

const playerGroups: NavGroup[] = [
  {
    label: 'Mi día',
    items: [
      { label: 'Inicio', icon: Home, href: '/dashboard' },
      { label: 'Entrenar', icon: Dumbbell, href: '/training' },
      { label: 'Calendario', icon: Calendar, href: '/calendar' },
      { label: 'Chat IA', icon: MessageCircle, href: '/chat' },
    ],
  },
  {
    label: 'Progreso',
    items: [
      { label: 'Logros', icon: Award, href: '/achievements' },
      { label: 'Ranking', icon: Trophy, href: '/leaderboard' },
      { label: 'Aula', icon: GraduationCap, href: '/classroom' },
    ],
  },
];

const parentGroups: NavGroup[] = [
  {
    label: 'Familia',
    items: [
      { label: 'Panel', icon: Home, href: '/parent/dashboard' },
      { label: 'Hijo/a', icon: Users, href: '/parent/child' },
      { label: 'Apto médico', short: 'Apto', icon: Heart, href: '/parent/medical' },
      { label: 'Cuotas del hijo/a', short: 'Cuotas', icon: Wallet, href: '/parent/fees' },
      { label: 'Avisos del club', short: 'Avisos', icon: Bell, href: '/parent/announcements' },
    ],
  },
];

const adminGroups: NavGroup[] = [
  {
    label: 'Plataforma',
    items: [
      { label: 'Dashboard', icon: Shield, href: '/admin/dashboard' },
      { label: 'Usuarios', icon: UserCog, href: '/admin/users' },
      { label: 'Cursos', icon: GraduationCap, href: '/admin/courses' },
      { label: 'Analíticas', icon: BarChart3, href: '/admin/analytics' },
    ],
  },
];

export const getNavGroups = (role?: UserRole): NavGroup[] => {
  switch (role) {
    case 'admin': return adminGroups;
    case 'coach':
    case 'club_admin': return clubGroups;
    case 'parent': return parentGroups;
    default: return playerGroups;
  }
};

export const footerNav: NavItem[] = [
  { label: 'Configuración', icon: Settings, href: '/settings' },
];

/** Hasta 4 ítems principales para la barra inferior; el resto va en "Más". */
export const getMobileNav = (role?: UserRole) => {
  const flat = getNavGroups(role).flatMap((g) => g.items);
  const preferred = role === 'coach' || role === 'club_admin'
    ? ['/club/dashboard', '/club/members', '/club/fees', '/club/attendance']
    : [];
  const primary = preferred.length
    ? preferred.map((h) => flat.find((i) => i.href === h)).filter((i): i is NavItem => !!i)
    : flat.slice(0, 4);
  const more = flat.filter((i) => !primary.includes(i));
  return { primary, more };
};

export const roleLabels: Record<UserRole, string> = {
  player: 'Jugador',
  parent: 'Familia',
  coach: 'Entrenador',
  club_admin: 'Administrador de club',
  admin: 'Administrador',
};

/** Cargador del chunk de cada ruta (las mismas funciones que usa App.tsx con lazy). */
export const routePrefetch: Record<string, () => Promise<unknown>> = {
  '/dashboard': loaders.Dashboard,
  '/training': loaders.Training,
  '/calendar': loaders.Calendar,
  '/chat': loaders.Chat,
  '/achievements': loaders.Achievements,
  '/leaderboard': loaders.Leaderboard,
  '/profile': loaders.Profile,
  '/settings': loaders.Settings,
  '/parent/dashboard': loaders.ParentDashboard,
  '/parent/child': loaders.ParentChild,
  '/parent/medical': loaders.ParentMedical,
  '/parent/fees': loaders.ParentFees,
  '/parent/announcements': loaders.ParentAnnouncements,
  '/club/dashboard': loaders.ClubDashboard,
  '/club/members': loaders.Members,
  '/club/teams': loaders.Teams,
  '/club/fees': loaders.Fees,
  '/club/fixtures': loaders.Fixtures,
  '/club/attendance': loaders.Attendance,
  '/admin/dashboard': loaders.AdminDashboard,
  '/admin/users': loaders.Users,
};

const prefetched = new Set<string>();

/** Precarga el chunk de una ruta (una sola vez). Nunca rompe la navegación. */
export const prefetchRoute = (href: string) => {
  const load = routePrefetch[href];
  if (!load || prefetched.has(href)) return;
  prefetched.add(href);
  load().catch(() => prefetched.delete(href));
};

/** Precarga en tiempo ocioso las pestañas principales del rol. */
export const prefetchMainTabs = (role?: UserRole) => {
  const hrefs = getMobileNav(role).primary.map((i) => i.href);
  const run = () => hrefs.forEach(prefetchRoute);
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(run);
  else window.setTimeout(run, 1500);
};
