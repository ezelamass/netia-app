import { CalendarCheck, Droplet, Footprints, Swords, Target, Zap, type LucideIcon } from 'lucide-react';
import type { PreviewIcon } from '@/data/training-preview';

export const PREVIEW_ICONS: Record<PreviewIcon, LucideIcon> = {
  target: Target,
  swords: Swords,
  zap: Zap,
  footprints: Footprints,
  droplet: Droplet,
  'calendar-check': CalendarCheck,
};
