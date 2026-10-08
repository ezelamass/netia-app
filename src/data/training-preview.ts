import type { Tone } from '@/lib/icons';

/** Datos de vista previa de /training: no tienen backend todavía. */

export type DrillSkill = 'Saque' | 'Revés' | 'Velocidad' | 'Coordinación';
export type PreviewIcon = 'target' | 'swords' | 'zap' | 'footprints' | 'droplet' | 'calendar-check';

export interface Challenge {
  id: string;
  title: string;
  progress: number;
  goal: number;
  xp: number;
  icon: PreviewIcon;
  tone: Tone;
}

export interface Drill {
  id: string;
  skill: DrillSkill;
  title: string;
  minutes: number;
  level: 'Fácil' | 'Medio' | 'Difícil';
  icon: PreviewIcon;
  tone: Tone;
  steps: string[];
}

export const CHALLENGES: Challenge[] = [
  { id: 'saques', title: '50 saques al cuadro', progress: 32, goal: 50, xp: 60, icon: 'target', tone: 'orange' },
  { id: 'racha', title: '3 días seguidos registrando', progress: 2, goal: 3, xp: 40, icon: 'calendar-check', tone: 'roma' },
  { id: 'agua', title: 'Hidratación 7/7', progress: 5, goal: 7, xp: 30, icon: 'droplet', tone: 'blue' },
];

export const DRILLS: Drill[] = [
  {
    id: 'saque-t', skill: 'Saque', title: 'Saque a la T', minutes: 10, level: 'Medio', icon: 'target', tone: 'orange',
    steps: ['Ubicate a un paso de la línea de base.', 'Tirá la pelota alta y adelante, sin apurarte.', 'Apuntá a la T del cuadro de saque.', 'Hacé 4 series de 8 y descansá 30 segundos entre series.'],
  },
  {
    id: 'saque-efecto', skill: 'Saque', title: 'Segundo saque con efecto', minutes: 8, level: 'Difícil', icon: 'target', tone: 'orange',
    steps: ['Lanzá la pelota un poco detrás de la cabeza.', 'Pegá de abajo hacia arriba para darle efecto.', 'Buscá que pase la red con margen.', 'Contá cuántos de 10 entran.'],
  },
  {
    id: 'reves-cruzado', skill: 'Revés', title: 'Revés cruzado', minutes: 12, level: 'Medio', icon: 'swords', tone: 'tino',
    steps: ['Poné un cono cerca de la esquina contraria.', 'Girá los hombros antes de pegar.', 'Terminá el golpe arriba, cerca del hombro.', 'Hacé 3 series de 10.'],
  },
  {
    id: 'velocidad-10', skill: 'Velocidad', title: 'Sprints de 10 metros', minutes: 8, level: 'Medio', icon: 'zap', tone: 'warning',
    steps: ['Marcá 10 metros con dos conos.', 'Salí rápido al ver la señal.', 'Volvé caminando y respirá.', 'Repetí 6 veces.'],
  },
  {
    id: 'escalera', skill: 'Coordinación', title: 'Escalera de pies', minutes: 6, level: 'Fácil', icon: 'footprints', tone: 'zahia',
    steps: ['Apoyá un pie por cuadro, sin pisar las líneas.', 'Mantené la cabeza arriba.', 'Hacé 4 pasadas, cada vez un poco más rápido.'],
  },
];

export const COACH_NOTE_PREVIEW = {
  coach: 'Martín Gómez',
  text: 'Esta semana estás sacando más seguro. Seguí con la rutina de hombro antes de entrenar.',
  daysAgo: 2,
};
