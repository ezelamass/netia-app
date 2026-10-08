export type NotificationType = 
  | 'health_alert' 
  | 'reminder' 
  | 'achievement' 
  | 'ai_message' 
  | 'streak' 
  | 'info' 
  | 'tournament';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type AvatarType = 'TINO' | 'ZAHIA' | 'ROMA';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  avatar?: AvatarType;
  actionUrl?: string;
  priority: NotificationPriority;
  metadata?: {
    xpEarned?: number;
    badgeId?: string;
    eventId?: string;
    [key: string]: unknown;
  };
}

export type TimeGroup = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'older';

export interface NotificationGroup {
  group: TimeGroup;
  label: string;
  notifications: Notification[];
}

// Notification type config for styling and icons
export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string;
  colorClass: string;
}> = {
  health_alert: {
    icon: '⚠️',
    colorClass: 'text-red-500',
  },
  reminder: {
    icon: '🔔',
    colorClass: 'text-blue-500',
  },
  achievement: {
    icon: '🏆',
    colorClass: 'text-amber-500',
  },
  ai_message: {
    icon: '💬',
    colorClass: 'text-primary',
  },
  streak: {
    icon: '🔥',
    colorClass: 'text-orange-500',
  },
  info: {
    icon: 'ℹ️',
    colorClass: 'text-muted-foreground',
  },
  tournament: {
    icon: '🏁',
    colorClass: 'text-green-500',
  },
};

// Time group labels in Spanish
export const TIME_GROUP_LABELS: Record<TimeGroup, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  this_week: 'Esta semana',
  this_month: 'Este mes',
  older: 'Anteriores',
};

// Helper function to determine time group
export function getTimeGroup(date: Date): TimeGroup {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const notifDate = new Date(date);

  if (notifDate >= today) {
    return 'today';
  } else if (notifDate >= yesterday) {
    return 'yesterday';
  } else if (notifDate >= weekAgo) {
    return 'this_week';
  } else if (notifDate >= monthAgo) {
    return 'this_month';
  }
  return 'older';
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return `Hace ${Math.floor(diffDays / 30)} mes`;
}

// Mock notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  // Today
  {
    id: '1',
    type: 'health_alert',
    title: 'Alerta de hidratación',
    description: 'Ayer tomaste menos de 1L de agua. Recordá hidratarte hoy.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    avatar: 'ZAHIA',
    actionUrl: '/dashboard',
    priority: 'high',
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Entrenamiento hoy',
    description: 'Sesión de técnica con TINO a las 17:00',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
    actionUrl: '/calendar',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'ai_message',
    title: 'Mensaje de TINO',
    description: '"¿Listo para el entrenamiento de hoy? Vamos a trabajar en tu revés."',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: false,
    avatar: 'TINO',
    actionUrl: '/chat',
    priority: 'medium',
  },
  // Yesterday
  {
    id: '4',
    type: 'achievement',
    title: '¡Nueva insignia!',
    description: 'Desbloqueaste "Constancia de Bronce" 🥉',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
    isRead: true,
    priority: 'low',
    metadata: { badgeId: 'consistency_bronze', xpEarned: 100 },
  },
  // This week
  {
    id: '5',
    type: 'streak',
    title: '¡Racha de 7 días!',
    description: 'Ganaste 50 XP extra por tu constancia',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true,
    priority: 'low',
    metadata: { xpEarned: 50 },
  },
  {
    id: '6',
    type: 'ai_message',
    title: 'Mensaje de ZAHIA',
    description: '"Recordá incluir frutas en tu almuerzo de hoy"',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
    avatar: 'ZAHIA',
    actionUrl: '/chat',
    priority: 'low',
  },
  {
    id: '7',
    type: 'info',
    title: 'Nuevo reporte semanal',
    description: 'Tu resumen de la semana está disponible. ¡Mirá tu progreso!',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    isRead: true,
    actionUrl: '/dashboard',
    priority: 'low',
  },
  // This month
  {
    id: '8',
    type: 'tournament',
    title: 'Torneo próximo',
    description: 'Regional U14 en 5 días. ¡Preparate con TINO!',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    isRead: true,
    actionUrl: '/calendar',
    priority: 'medium',
    metadata: { eventId: 'tournament_u14' },
  },
  {
    id: '9',
    type: 'ai_message',
    title: 'Consejo de ROMA',
    description: '"La visualización antes de competir mejora tu rendimiento un 20%"',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    isRead: true,
    avatar: 'ROMA',
    actionUrl: '/chat',
    priority: 'low',
  },
  {
    id: '10',
    type: 'health_alert',
    title: 'Sueño insuficiente',
    description: 'Dormiste menos de 7 horas esta semana. El descanso es clave.',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isRead: true,
    avatar: 'ROMA',
    actionUrl: '/dashboard',
    priority: 'high',
  },
];
