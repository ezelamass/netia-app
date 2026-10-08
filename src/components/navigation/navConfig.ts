import {
  Home, Dumbbell, Calendar, MessageCircle, Trophy, Users, FileText, Bell, Shield, UserCog,
  BarChart3, Award, Heart, GraduationCap, Wallet, Layers, ClipboardCheck, Swords, Stethoscope,
  Activity, Megaphone, Settings, type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';

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
      { label: 'Asistencia', icon: ClipboardCheck, href: '/club/attendance' },
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
  const primary = flat.slice(0, 4);
  const more = flat.slice(4);
  return { primary, more };
};

export const roleLabels: Record<UserRole, string> = {
  player: 'Jugador',
  parent: 'Familia',
  coach: 'Entrenador',
  club_admin: 'Administrador de club',
  admin: 'Administrador',
};
