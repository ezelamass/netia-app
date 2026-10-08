import { Crown, Medal, Award, type LucideIcon } from 'lucide-react';

export type Position = 1 | 2 | 3;

/** Oro / plata / bronce con tokens del sistema (sin colores sueltos). */
export const MEDALS: Record<Position, { icon: LucideIcon; label: string; prize: string; soft: string; text: string; solid: string }> = {
  1: { icon: Crown, label: 'Oro', prize: '1er premio', soft: 'bg-warning-soft', text: 'text-warning', solid: 'bg-warning text-warning-foreground' },
  2: { icon: Medal, label: 'Plata', prize: '2do premio', soft: 'bg-slate-soft', text: 'text-muted-foreground', solid: 'bg-muted-foreground text-background' },
  3: { icon: Award, label: 'Bronce', prize: '3er premio', soft: 'bg-primary-soft', text: 'text-primary', solid: 'bg-primary text-primary-foreground' },
};
