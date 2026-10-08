import { Apple, Brain, Zap, type LucideIcon } from 'lucide-react';
import tinoImg from '@/assets/avatars/tino.avif';
import zahiaImg from '@/assets/avatars/zahia.avif';
import romaImg from '@/assets/avatars/roma.avif';

export type AvatarId = 'TINO' | 'ZAHIA' | 'ROMA';

export const AVATAR_IDS: AvatarId[] = ['TINO', 'ZAHIA', 'ROMA'];

export interface AgentConfig {
  name: string;
  tagline: string;
  area: string;
  description: string;
  image: string;
  /** Nombre del token CSS (sin `--`) y del color de Tailwind */
  colorVar: 'avatar-tino' | 'avatar-zahia' | 'avatar-roma';
  tone: 'tino' | 'zahia' | 'roma';
  icon: LucideIcon;
  suggestions: string[];
  /** Palabras clave (en minúscula, sin tildes) para derivar la consulta a este agente */
  keywords: string[];
}

export const AGENTS: Record<AvatarId, AgentConfig> = {
  TINO: {
    name: 'TINO',
    tagline: 'Tu coach de entrenamiento',
    area: 'Entreno',
    description: 'TINO te acompaña con entrenamiento físico y preparación atlética para rendir al máximo.',
    image: tinoImg,
    colorVar: 'avatar-tino',
    tone: 'tino',
    icon: Zap,
    suggestions: ['¿Qué entreno hoy?', '¿Cómo mejoro mi resistencia?', 'Dame un plan', 'Ejercicios de calentamiento'],
    keywords: ['entren', 'ejercicio', 'fuerza', 'resistencia', 'velocidad', 'calentar', 'calentamiento', 'musculo', 'rutina'],
  },
  ZAHIA: {
    name: 'ZAHIA',
    tagline: 'Tu guía de nutrición y hábitos',
    area: 'Nutrición',
    description: 'ZAHIA es tu guía en nutrición, hidratación y hábitos saludables para deportistas.',
    image: zahiaImg,
    colorVar: 'avatar-zahia',
    tone: 'zahia',
    icon: Apple,
    suggestions: ['¿Qué como antes de entrenar?', '¿Cuánta agua tomo?', 'Snack saludable', 'Ideas de desayuno'],
    keywords: ['comer', 'como antes', 'comida', 'agua', 'hidrat', 'desayuno', 'merienda', 'almuerzo', 'cena', 'proteina', 'dieta'],
  },
  ROMA: {
    name: 'ROMA',
    tagline: 'Tu coach de mente y foco',
    area: 'Mente',
    description: 'ROMA te ayuda con la preparación mental, la confianza y el foco antes y durante la competencia.',
    image: romaImg,
    colorVar: 'avatar-roma',
    tone: 'roma',
    icon: Brain,
    suggestions: ['¿Cómo me concentro?', 'Nervios antes del partido', 'Consejo mental', 'Cómo manejar la presión'],
    keywords: ['nervio', 'miedo', 'ansiedad', 'concentr', 'confianza', 'presion', 'foco', 'estres'],
  },
};

export const getAgentImage = (id: AvatarId) => AGENTS[id].image;

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Otro agente cuya área calza con el texto (o null). No incluye al agente actual. */
export function suggestAgentFor(text: string, current: AvatarId): AvatarId | null {
  const t = normalize(text);
  for (const id of AVATAR_IDS) {
    if (id === current) continue;
    if (AGENTS[id].keywords.some((k) => t.includes(k))) {
      // Si el texto también calza con el agente actual, no derivamos.
      if (AGENTS[current].keywords.some((k) => t.includes(k))) return null;
      return id;
    }
  }
  return null;
}
