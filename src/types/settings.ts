import { z } from 'zod';

// Settings schema
export const settingsSchema = z.object({
  // Notifications
  notifications: z.object({
    push: z.boolean(),
    trainingReminders: z.boolean(),
    healthAlerts: z.boolean(),
    aiMessages: z.boolean(),
    achievements: z.boolean(),
    weeklyEmail: z.boolean(),
  }),

  // Appearance
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    showDashboardAvatar: z.boolean(),
    animations: z.boolean(),
    soundEffects: z.boolean(),
  }),

  // Locale
  locale: z.object({
    language: z.enum(['es', 'en']),
    dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
    units: z.enum(['metric', 'imperial']),
    timezone: z.string(),
  }),

  // Privacy
  privacy: z.object({
    profileVisibility: z.enum(['all', 'club', 'none']),
    shareAnonymousData: z.boolean(),
    showInLeaderboard: z.boolean(),
  }),

  // AI Avatars
  aiAvatars: z.object({
    primaryAvatar: z.enum(['TINO', 'ZAHIA', 'ROMA']),
    messageFrequency: z.enum(['low', 'normal', 'high']),
    communicationTone: z.enum(['motivational', 'neutral', 'technical']),
    voiceMessages: z.boolean(),
  }),
});

export type UserSettings = z.infer<typeof settingsSchema>;

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    push: true,
    trainingReminders: true,
    healthAlerts: true,
    aiMessages: true,
    achievements: true,
    weeklyEmail: true,
  },
  appearance: {
    theme: 'light',
    showDashboardAvatar: true,
    animations: true,
    soundEffects: false,
  },
  locale: {
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    units: 'metric',
    timezone: 'auto',
  },
  privacy: {
    profileVisibility: 'club',
    shareAnonymousData: true,
    showInLeaderboard: true,
  },
  aiAvatars: {
    primaryAvatar: 'TINO',
    messageFrequency: 'normal',
    communicationTone: 'motivational',
    voiceMessages: false,
  },
};

// Select options
export const THEME_OPTIONS = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD' },
] as const;

export const UNITS_OPTIONS = [
  { value: 'metric', label: 'Métrico (kg/cm)' },
  { value: 'imperial', label: 'Imperial (lb/ft)' },
] as const;

export const AVATAR_OPTIONS = [
  { value: 'TINO', label: 'TINO' },
  { value: 'ZAHIA', label: 'ZAHIA' },
  { value: 'ROMA', label: 'ROMA' },
] as const;

export const MESSAGE_FREQUENCY_OPTIONS = [
  { value: 'low', label: 'Mínima' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Frecuente' },
] as const;

export const COMMUNICATION_TONE_OPTIONS = [
  { value: 'motivational', label: 'Motivador' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'technical', label: 'Técnico' },
] as const;

export const PROFILE_VISIBILITY_OPTIONS = [
  { value: 'all', label: 'Todos los entrenadores' },
  { value: 'club', label: 'Solo mi club' },
  { value: 'none', label: 'Nadie' },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: 'auto', label: 'Detectar automáticamente' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'America/Santiago', label: 'Chile (Santiago)' },
  { value: 'America/Montevideo', label: 'Uruguay (Montevideo)' },
  { value: 'America/Mexico_City', label: 'México (Ciudad de México)' },
  { value: 'America/Bogota', label: 'Colombia (Bogotá)' },
  { value: 'Europe/Madrid', label: 'España (Madrid)' },
  { value: 'America/New_York', label: 'Estados Unidos (Nueva York)' },
  { value: 'America/Los_Angeles', label: 'Estados Unidos (Los Ángeles)' },
] as const;
