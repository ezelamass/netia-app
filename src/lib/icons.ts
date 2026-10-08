import {
  Dumbbell, Trophy, Apple, Brain, Zap, Moon, BookOpen, TriangleAlert, Shield, Flame, Star,
  BedDouble, Droplet, BatteryMedium, Bandage, type LucideIcon,
} from 'lucide-react';

export type Tone = 'orange' | 'tino' | 'zahia' | 'roma' | 'blue' | 'slate' | 'warning';

export type EventKind = 'training' | 'match' | 'nutrition' | 'mental' | 'physical' | 'rest' | 'school' | 'alert';

/** Fuente única de íconos: cada concepto usa siempre el mismo. */
export const ICONS = {
  training: { icon: Dumbbell, tone: 'orange' },
  match: { icon: Trophy, tone: 'orange' },
  nutrition: { icon: Apple, tone: 'zahia' },
  mental: { icon: Brain, tone: 'roma' },
  physical: { icon: Zap, tone: 'tino' },
  rest: { icon: Moon, tone: 'slate' },
  school: { icon: BookOpen, tone: 'slate' },
  alert: { icon: TriangleAlert, tone: 'warning' },
  club: { icon: Shield, tone: 'blue' },
  streak: { icon: Flame, tone: 'orange' },
  xp: { icon: Star, tone: 'orange' },
  sleep: { icon: BedDouble, tone: 'roma' },
  hydration: { icon: Droplet, tone: 'blue' },
  energy: { icon: BatteryMedium, tone: 'orange' },
  pain: { icon: Bandage, tone: 'warning' },
} as const satisfies Record<string, { icon: LucideIcon; tone: Tone }>;

export type IconKey = keyof typeof ICONS;

/** Clases de Tailwind por tono: fondo suave + color del ícono. */
export const TONE_CLASSES: Record<Tone, { bg: string; text: string }> = {
  orange: { bg: 'bg-primary-soft', text: 'text-primary' },
  tino: { bg: 'bg-tino-soft', text: 'text-tino' },
  zahia: { bg: 'bg-zahia-soft', text: 'text-[hsl(162_100%_24%)] dark:text-zahia' },
  roma: { bg: 'bg-roma-soft', text: 'text-roma' },
  blue: { bg: 'bg-info-soft', text: 'text-info' },
  slate: { bg: 'bg-slate-soft', text: 'text-muted-foreground' },
  warning: { bg: 'bg-warning-soft', text: 'text-warning' },
};

/** Tipos de evento del calendario → concepto de ICONS. */
export const EVENT_ICON_KEY: Record<'training' | 'nutrition' | 'mental' | 'tournament' | 'school' | 'rest' | 'alert', IconKey> = {
  training: 'training',
  tournament: 'match',
  nutrition: 'nutrition',
  mental: 'mental',
  school: 'school',
  rest: 'rest',
  alert: 'alert',
};

export const getEventIcon = (type: keyof typeof EVENT_ICON_KEY) => ICONS[EVENT_ICON_KEY[type]];

/** Color del punto (calendario) por tono. */
export const TONE_DOT: Record<Tone, string> = {
  orange: 'bg-primary',
  tino: 'bg-tino',
  zahia: 'bg-zahia',
  roma: 'bg-roma',
  blue: 'bg-info',
  slate: 'bg-muted-foreground',
  warning: 'bg-warning',
};
