import { DEMO_USER_IDS } from '@/demo/ids';
/**
 * Mock dataset for demo mode. Mirrors the shape of Supabase tables (snake_case).
 * Built fresh per session so dates stay relative to "today" — call
 * `buildInitialMockData()` once when the demo session starts and keep the
 * resulting object in sessionStorage as the source of truth for reads/writes.
 *
 * UUIDs match the seed in `supabase/migrations/20260413240000_seed_demo_accounts.sql`
 * so existing `eq('user_id', auth.uid())` filters still match after we
 * authenticate with the real demo accounts.
 */

export { DEMO_USER_IDS };

export const DEMO_CLUB_ID = 'e1000001-de00-4000-a000-c10b00000001';

const PLAYER_ID = DEMO_USER_IDS.player;
const COACH_ID = DEMO_USER_IDS.coach;
const ADMIN_ID = DEMO_USER_IDS.admin;

const dateOnly = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const isoAt = (offsetDays: number, hours = 12, minutes = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

export type MockDataset = Record<string, any[]>;

export function buildInitialMockData(): MockDataset {
  return {
    profiles: [
      {
        id: PLAYER_ID,
        email: 'demo-jugador@netia.app',
        full_name: 'Santiago Morales',
        date_of_birth: '2012-03-22',
        sport: 'tennis',
        city: 'Buenos Aires',
        country: 'Argentina',
        gender: 'male',
        avatar_url: null,
        phone: null,
        status: 'active',
        onboarding_completed: true,
        onboarding: {
          level: 'competition',
          handedness: 'right',
          hasCoach: true,
          coachName: 'Academia Wilson',
          trainingDays: ['monday', 'wednesday', 'friday'],
          sessionDuration: 90,
          mainGoal: 'technique',
          areasToImprove: ['Resistencia', 'Concentración'],
          height: 162,
          weight: 48,
          preferredAvatar: 'TINO',
          communicationMode: 'text',
        },
        created_at: isoAt(-90),
      },
      {
        id: COACH_ID,
        email: 'demo-entrenador@netia.app',
        full_name: 'María Fernández',
        date_of_birth: null,
        sport: 'tennis',
        city: 'Buenos Aires',
        country: 'Argentina',
        gender: 'female',
        avatar_url: null,
        phone: null,
        status: 'active',
        onboarding_completed: true,
        onboarding: null,
        created_at: isoAt(-180),
      },
      {
        id: ADMIN_ID,
        email: 'demo-admin@netia.app',
        full_name: 'Admin NETIA',
        date_of_birth: null,
        sport: null,
        city: 'Buenos Aires',
        country: 'Argentina',
        gender: null,
        avatar_url: null,
        phone: null,
        status: 'active',
        onboarding_completed: true,
        onboarding: null,
        created_at: isoAt(-365),
      },
      // Extra teammates so the coach roster isn't empty
      {
        id: 'demo-player-002',
        email: 'lucia.demo@netia.app',
        full_name: 'Lucía Pérez',
        date_of_birth: '2011-07-15',
        sport: 'tennis',
        city: 'Buenos Aires',
        country: 'Argentina',
        gender: 'female',
        avatar_url: null,
        status: 'active',
        onboarding_completed: true,
        created_at: isoAt(-60),
      },
      {
        id: 'demo-player-003',
        email: 'mateo.demo@netia.app',
        full_name: 'Mateo Gómez',
        date_of_birth: '2013-01-09',
        sport: 'tennis',
        city: 'Buenos Aires',
        country: 'Argentina',
        gender: 'male',
        avatar_url: null,
        status: 'active',
        onboarding_completed: true,
        created_at: isoAt(-45),
      },
    ],

    user_roles: [
      { user_id: PLAYER_ID, role: 'player' },
      { user_id: COACH_ID, role: 'coach' },
      { user_id: ADMIN_ID, role: 'admin' },
      { user_id: 'demo-player-002', role: 'player' },
      { user_id: 'demo-player-003', role: 'player' },
    ],

    clubs: [
      {
        id: DEMO_CLUB_ID,
        name: 'Club Los Ceibos',
        sport: 'tennis',
        city: 'Buenos Aires',
        country: 'Argentina',
        invite_code: 'DEMO2026',
        max_players: 50,
        is_active: true,
        logo_url: null,
        created_by: COACH_ID,
        created_at: isoAt(-120),
      },
    ],

    enrollments: [
      { id: 'enr-001', user_id: COACH_ID, club_id: DEMO_CLUB_ID, role: 'coach', status: 'active', joined_at: isoAt(-120) },
      { id: 'enr-002', user_id: PLAYER_ID, club_id: DEMO_CLUB_ID, role: 'player', status: 'active', joined_at: isoAt(-90) },
      { id: 'enr-003', user_id: 'demo-player-002', club_id: DEMO_CLUB_ID, role: 'player', status: 'active', joined_at: isoAt(-60) },
      { id: 'enr-004', user_id: 'demo-player-003', club_id: DEMO_CLUB_ID, role: 'player', status: 'active', joined_at: isoAt(-45) },
    ],

    player_stats: [
      {
        user_id: PLAYER_ID,
        xp: 1850,
        level: 'silver',
        current_streak: 12,
        longest_streak: 18,
        total_logs: 45,
        total_training_min: 2700,
      },
      {
        user_id: 'demo-player-002',
        xp: 1200,
        level: 'silver',
        current_streak: 5,
        longest_streak: 14,
        total_logs: 38,
        total_training_min: 2100,
      },
      {
        user_id: 'demo-player-003',
        xp: 620,
        level: 'bronze',
        current_streak: 3,
        longest_streak: 7,
        total_logs: 22,
        total_training_min: 1300,
      },
    ],

    daily_logs: (() => {
      const logs: any[] = [];
      // Santiago: 13 days of logs (no log for today so TodayCard shows "Registrar")
      const santiagoLogs = [
        { d: -13, sleep: 8.5, hyd: 2.3, energy: 5, pain: 0, trained: true, dur: 90 },
        { d: -12, sleep: 8.0, hyd: 2.0, energy: 4, pain: 0, trained: true, dur: 60 },
        { d: -11, sleep: 7.5, hyd: 2.1, energy: 4, pain: 1, trained: true, dur: 90 },
        { d: -10, sleep: 8.0, hyd: 2.0, energy: 5, pain: 0, trained: false, dur: 0 },
        { d: -9, sleep: 6.5, hyd: 1.5, energy: 3, pain: 2, painLoc: 'hombro derecho', trained: true, dur: 75 },
        { d: -8, sleep: 6.5, hyd: 1.8, energy: 3, pain: 2, painLoc: 'hombro derecho', trained: true, dur: 60 },
        { d: -7, sleep: 7.5, hyd: 2.0, energy: 4, pain: 1, trained: true, dur: 90 },
        { d: -6, sleep: 8.0, hyd: 2.2, energy: 5, pain: 0, trained: true, dur: 90 },
        { d: -5, sleep: 9.0, hyd: 2.5, energy: 5, pain: 0, trained: false, dur: 0 },
        { d: -4, sleep: 8.0, hyd: 2.0, energy: 4, pain: 0, trained: true, dur: 90 },
        { d: -3, sleep: 7.5, hyd: 2.3, energy: 4, pain: 1, trained: true, dur: 60 },
        { d: -2, sleep: 7.0, hyd: 1.8, energy: 3, pain: 0, trained: false, dur: 0 },
        { d: -1, sleep: 8.0, hyd: 2.2, energy: 4, pain: 0, trained: true, dur: 90 },
      ];
      santiagoLogs.forEach((row, idx) =>
        logs.push({
          id: `log-santi-${idx}`,
          user_id: PLAYER_ID,
          log_date: dateOnly(row.d),
          sleep_hours: row.sleep,
          hydration_liters: row.hyd,
          energy_level: row.energy,
          pain_level: row.pain,
          pain_location: row.painLoc ?? null,
          trained: row.trained,
          training_duration_min: row.dur,
          created_at: isoAt(row.d, 21, 30),
        })
      );
      // Lucía: 7 recent logs
      for (let i = 0; i < 7; i++) {
        logs.push({
          id: `log-lucia-${i}`,
          user_id: 'demo-player-002',
          log_date: dateOnly(-i - 1),
          sleep_hours: 7 + Math.random(),
          hydration_liters: 1.8 + Math.random() * 0.6,
          energy_level: 3 + Math.floor(Math.random() * 3),
          pain_level: Math.random() > 0.7 ? 1 : 0,
          pain_location: null,
          trained: i % 2 === 0,
          training_duration_min: i % 2 === 0 ? 60 : 0,
          created_at: isoAt(-i - 1, 22, 0),
        });
      }
      // Mateo: 4 logs
      for (let i = 0; i < 4; i++) {
        logs.push({
          id: `log-mateo-${i}`,
          user_id: 'demo-player-003',
          log_date: dateOnly(-i * 2 - 1),
          sleep_hours: 8 + Math.random() * 0.5,
          hydration_liters: 1.5 + Math.random() * 0.8,
          energy_level: 4,
          pain_level: 0,
          pain_location: null,
          trained: true,
          training_duration_min: 45,
          created_at: isoAt(-i * 2 - 1, 22, 0),
        });
      }
      return logs;
    })(),

    diagnostic_history: [
      { id: 'diag-1', user_id: PLAYER_ID, axis: 'fisico', score: 7.2, detail: 'Buen nivel de resistencia', recorded_at: isoAt(-30) },
      { id: 'diag-2', user_id: PLAYER_ID, axis: 'tecnico', score: 6.5, detail: 'Mejorar saque y volea', recorded_at: isoAt(-30) },
      { id: 'diag-3', user_id: PLAYER_ID, axis: 'mental', score: 8.0, detail: 'Excelente concentración', recorded_at: isoAt(-30) },
      { id: 'diag-4', user_id: PLAYER_ID, axis: 'fisico', score: 7.8, detail: 'Mejora en velocidad', recorded_at: isoAt(-5) },
      { id: 'diag-5', user_id: PLAYER_ID, axis: 'tecnico', score: 7.0, detail: 'Saque más consistente', recorded_at: isoAt(-5) },
      { id: 'diag-6', user_id: PLAYER_ID, axis: 'mental', score: 8.3, detail: 'Mayor control emocional', recorded_at: isoAt(-5) },
    ],

    diagnostic_tests: [
      { id: 'dt-fisico', axis: 'fisico', title: 'Diagnóstico Físico', description: 'Evaluación de capacidades físicas', is_active: true },
      { id: 'dt-tecnico', axis: 'tecnico', title: 'Diagnóstico Técnico', description: 'Evaluación de fundamentos técnicos', is_active: true },
      { id: 'dt-mental', axis: 'mental', title: 'Diagnóstico Mental', description: 'Evaluación de aspectos psicológicos', is_active: true },
    ],

    diagnostic_questions: [
      // Físico
      { id: 'q-fis-1', test_id: 'dt-fisico', order_index: 0, prompt: 'Cuántas flexiones podés hacer seguidas?', options: ['0-5', '6-10', '11-20', '21+'], scores: [1, 2, 4, 5] },
      { id: 'q-fis-2', test_id: 'dt-fisico', order_index: 1, prompt: 'Cuánto tiempo aguantás corriendo a paso constante?', options: ['<5 min', '5-15 min', '15-30 min', '30+ min'], scores: [1, 2, 3, 5] },
      // Técnico
      { id: 'q-tec-1', test_id: 'dt-tecnico', order_index: 0, prompt: 'Cómo describirías tu técnica de saque?', options: ['Muy básica', 'En desarrollo', 'Buena', 'Avanzada'], scores: [1, 2, 4, 5] },
      // Mental
      { id: 'q-men-1', test_id: 'dt-mental', order_index: 0, prompt: 'Cómo manejás los nervios antes de competir?', options: ['Muy mal', 'Regular', 'Bien', 'Muy bien'], scores: [1, 2, 4, 5] },
    ],

    diagnostic_sessions: [],
    diagnostic_responses: [],

    badges: [
      { id: 'streak-7', icon: '🔥', title: 'Racha de 7 días', description: 'Registraste tu día 7 días seguidos', category: 'streak', xp_reward: 100 },
      { id: 'streak-14', icon: '🔥', title: 'Racha de 14 días', description: 'Dos semanas consecutivas', category: 'streak', xp_reward: 250 },
      { id: 'xp-500', icon: '⭐', title: 'Primer Hito', description: 'Llegaste a 500 XP', category: 'xp', xp_reward: 50 },
      { id: 'xp-1000', icon: '⭐', title: 'Mil Puntos', description: 'Alcanzaste 1000 XP', category: 'xp', xp_reward: 100 },
      { id: 'xp-2000', icon: '🏆', title: 'Champ Silver', description: '2000 XP, nivel silver', category: 'xp', xp_reward: 200 },
      { id: 'green-5', icon: '🟢', title: '5 días en verde', description: '5 días con buena energía', category: 'wellness', xp_reward: 75 },
      { id: 'first-train', icon: '🎾', title: 'Primer entrenamiento', description: 'Registraste tu primera sesión', category: 'training', xp_reward: 25 },
    ],

    player_badges: [
      { user_id: PLAYER_ID, badge_id: 'streak-7', earned_at: isoAt(-20) },
      { user_id: PLAYER_ID, badge_id: 'xp-500', earned_at: isoAt(-40) },
      { user_id: PLAYER_ID, badge_id: 'xp-1000', earned_at: isoAt(-25) },
      { user_id: PLAYER_ID, badge_id: 'green-5', earned_at: isoAt(-10) },
    ],

    calendar_events: (() => {
      const events: any[] = [];
      // Compute Monday of this week
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Sunday=7
      const mondayOffset = 1 - dayOfWeek;
      const evt = (offset: number, h: number, m: number, durationMin: number, title: string, type: string, desc: string) => {
        const start = new Date(today);
        start.setDate(today.getDate() + mondayOffset + offset);
        start.setHours(h, m, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + durationMin);
        return {
          id: `evt-${offset}-${h}`,
          user_id: PLAYER_ID,
          title,
          event_type: type,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          description: desc,
          location: 'Club Los Ceibos',
          is_recurring: false,
          created_at: isoAt(-30),
        };
      };
      events.push(evt(0, 16, 0, 90, 'Entrenamiento Tenis', 'training', 'Saque y revés con coach'));
      events.push(evt(2, 16, 0, 90, 'Entrenamiento Tenis', 'training', 'Preparación física + juego'));
      events.push(evt(4, 16, 0, 90, 'Entrenamiento Tenis', 'training', 'Táctica y match play'));
      events.push(evt(5, 10, 0, 120, 'Partido amistoso', 'tournament', 'Vs Club San Isidro'));
      events.push(evt(6, 9, 0, 60, 'Descanso activo', 'rest', 'Movilidad y stretching'));
      // Eventos del club (creados por el cuerpo técnico; los ve todo el que está inscripto)
      const clubEvt = (offset: number, h: number, m: number, durationMin: number, title: string, type: string, desc: string, location = 'Club Los Ceibos') => ({
        ...evt(offset, h, m, durationMin, title, type, desc),
        id: `club-evt-${offset}-${h}`,
        user_id: COACH_ID,
        club_id: DEMO_CLUB_ID,
        location,
      });
      events.push(clubEvt(1, 18, 0, 90, 'Entrenamiento Sub-14', 'training', 'Categoría completa, cancha 2'));
      events.push(clubEvt(3, 19, 30, 60, 'Reunión de padres', 'school', 'Calendario del torneo y cuotas', 'Quincho del club'));
      events.push(clubEvt(5, 15, 0, 120, 'Partido vs. San Isidro', 'tournament', 'Torneo de la zona, llegar 14:15', 'Cancha central'));
      events.push(clubEvt(7, 17, 0, 90, 'Clínica de saque', 'training', 'Con el profe Martín, todas las categorías'));
      return events;
    })(),

    notifications: [
      { id: 'notif-1', user_id: PLAYER_ID, type: 'badge_earned', title: '¡Nuevo logro!', description: 'Desbloqueaste "Racha de 7 días"', avatar: 'TINO', priority: 'high', is_read: false, created_at: isoAt(-1) },
      { id: 'notif-2', user_id: PLAYER_ID, type: 'ai_message', title: 'Roma te envió un mensaje', description: 'Tengo una estrategia mental para tu próximo partido', avatar: 'ROMA', priority: 'normal', is_read: false, created_at: isoAt(-1, 18, 0) },
      { id: 'notif-3', user_id: PLAYER_ID, type: 'wellness_tip', title: 'Recordatorio de ZAHIA', description: 'No olvides hidratarte antes del entreno de hoy', avatar: 'ZAHIA', priority: 'normal', is_read: true, created_at: isoAt(-2) },
      { id: 'notif-4', user_id: PLAYER_ID, type: 'session_reminder', title: 'Entrenamiento en 2 horas', description: 'Saque y revés con coach - 16:00', avatar: 'TINO', priority: 'normal', is_read: true, created_at: isoAt(-3) },
      { id: 'notif-5', user_id: PLAYER_ID, type: 'xp_milestone', title: '¡Nivel Silver alcanzado!', description: 'Llegaste a 500 XP. Seguí así campeón!', avatar: 'TINO', priority: 'high', is_read: true, created_at: isoAt(-15) },
    ],

    ai_conversations: [
      { id: 'conv-roma-1', user_id: PLAYER_ID, avatar: 'ROMA', title: 'Nervios antes del torneo', last_message_at: isoAt(0, 10, 0), created_at: isoAt(-1) },
      { id: 'conv-tino-1', user_id: PLAYER_ID, avatar: 'TINO', title: 'Entrenamiento de la semana', last_message_at: isoAt(-2), created_at: isoAt(-2) },
      { id: 'conv-zahia-1', user_id: PLAYER_ID, avatar: 'ZAHIA', title: 'Hidratación pre-partido', last_message_at: isoAt(-5), created_at: isoAt(-5) },
    ],

    ai_messages: [
      // Roma conversation
      { id: 'msg-1', conversation_id: 'conv-roma-1', role: 'user', content: 'Roma, estoy nervioso por el torneo del sábado. Me cuesta concentrarme cuando pierdo un game.', created_at: isoAt(-1, 9, 50) },
      { id: 'msg-2', conversation_id: 'conv-roma-1', role: 'assistant', content: 'Es re normal sentir eso antes de un torneo. Lo importante es que ya lo reconocés, y eso es un gran paso. Vamos a trabajar juntos una micro-estrategia para ese momento.', created_at: isoAt(-1, 9, 51) },
      { id: 'msg-3', conversation_id: 'conv-roma-1', role: 'assistant', content: 'Probá el reset 3R: Respirá (4-2-6), Reenfocá (mirá las cuerdas de tu raqueta), y Rearrancar (pensá solo en el próximo punto). Practicalo hoy antes de dormir, 3 veces seguidas.', created_at: isoAt(-1, 9, 52) },
      { id: 'msg-4', conversation_id: 'conv-roma-1', role: 'user', content: 'Dale, me gusta eso. Y qué hago si voy perdiendo 1-4?', created_at: isoAt(0, 9, 58) },
      { id: 'msg-5', conversation_id: 'conv-roma-1', role: 'assistant', content: 'Cuando vas abajo, el truco es achicarlo: no pensés en remontar 4 games, pensá solo en ganar el punto que estás jugando. Cada punto empieza 0-0. Además, usá el ritual entre puntos: ajustá las cuerdas, rebotá la pelota 3 veces, respirá y arrancá.', created_at: isoAt(0, 10, 0) },

      // Tino conversation
      { id: 'msg-6', conversation_id: 'conv-tino-1', role: 'user', content: 'Tino, qué te parece sumar trabajo de fuerza esta semana?', created_at: isoAt(-2, 17, 30) },
      { id: 'msg-7', conversation_id: 'conv-tino-1', role: 'assistant', content: 'Excelente idea, campeón. A tu edad la fuerza con peso corporal es lo mejor: sentadillas, planchas y estocadas.', created_at: isoAt(-2, 17, 31) },
      { id: 'msg-7b', conversation_id: 'conv-tino-1', role: 'assistant', content: '3 series de 10 reps, dos veces por semana, alcanza para empezar a ver cambios en tu juego. Hacelo después del calentamiento, nunca en frío.', created_at: isoAt(-2, 17, 32) },
      { id: 'msg-7c', conversation_id: 'conv-tino-1', role: 'user', content: 'Y los días de partido, entreno fuerza o descanso?', created_at: isoAt(-2, 17, 40) },
      { id: 'msg-7d', conversation_id: 'conv-tino-1', role: 'assistant', content: 'El día del partido, nada de fuerza: solo un calentamiento de 10 minutos con movilidad y algunos desplazamientos cortos.', created_at: isoAt(-2, 17, 41) },
      { id: 'msg-7e', conversation_id: 'conv-tino-1', role: 'assistant', content: 'La fuerza la dejamos para los días de entrenamiento, así llegás con las piernas livianas al torneo del sábado.', created_at: isoAt(-2, 17, 42) },

      // Zahia conversation
      { id: 'msg-8', conversation_id: 'conv-zahia-1', role: 'user', content: 'Zahia, qué tomo antes de un partido?', created_at: isoAt(-5, 11, 0) },
      { id: 'msg-9', conversation_id: 'conv-zahia-1', role: 'assistant', content: 'Para un partido de tenis, necesitás hidratarte BIEN desde la noche anterior. Tomá 500 ml de agua al despertar y otro vaso 1 hora antes.', created_at: isoAt(-5, 11, 2) },
      { id: 'msg-9b', conversation_id: 'conv-zahia-1', role: 'assistant', content: 'Llevá una botella con sales (puede ser una bebida deportiva diluida) para tomar sorbos en cada cambio de lado.', created_at: isoAt(-5, 11, 3) },
      { id: 'msg-9c', conversation_id: 'conv-zahia-1', role: 'user', content: 'Y para comer? Qué como antes de jugar?', created_at: isoAt(-5, 11, 10) },
      { id: 'msg-9d', conversation_id: 'conv-zahia-1', role: 'assistant', content: 'Comé 2 o 3 horas antes: arroz o pasta con pollo y algo de verdura. Evitá frituras y lácteos pesados.', created_at: isoAt(-5, 11, 11) },
      { id: 'msg-9e', conversation_id: 'conv-zahia-1', role: 'assistant', content: 'Y 1 hora antes, una banana o un yogur con avena te da energía sin pesadez.', created_at: isoAt(-5, 11, 12) },
    ],

    // ──────────────────────────────────────
    // Coach data
    // ──────────────────────────────────────

    training_sessions: [
      { id: 'ts-1', club_id: DEMO_CLUB_ID, coach_id: COACH_ID, group_name: 'U14', category: 'U14', sport: 'tennis', type: 'technical', date: dateOnly(-12), duration_min: 90, rpe_group: 6, warmup_done: true, cooldown_done: true, notes: 'Trabajo de saque y revés' },
      { id: 'ts-2', club_id: DEMO_CLUB_ID, coach_id: COACH_ID, group_name: 'U14', category: 'U14', sport: 'tennis', type: 'physical', date: dateOnly(-10), duration_min: 60, rpe_group: 7, warmup_done: true, cooldown_done: true, notes: 'Preparación física' },
      { id: 'ts-3', club_id: DEMO_CLUB_ID, coach_id: COACH_ID, group_name: 'U14', category: 'U14', sport: 'tennis', type: 'tactical', date: dateOnly(-8), duration_min: 75, rpe_group: 5, warmup_done: true, cooldown_done: false, notes: 'Táctica de dobles' },
      { id: 'ts-4', club_id: DEMO_CLUB_ID, coach_id: COACH_ID, group_name: 'U14', category: 'U14', sport: 'tennis', type: 'technical', date: dateOnly(-5), duration_min: 90, rpe_group: 6, warmup_done: true, cooldown_done: true, notes: 'Volea y approach' },
      { id: 'ts-5', club_id: DEMO_CLUB_ID, coach_id: COACH_ID, group_name: 'U14', category: 'U14', sport: 'tennis', type: 'match', date: dateOnly(-3), duration_min: 120, rpe_group: 8, warmup_done: true, cooldown_done: true, notes: 'Partidos de práctica' },
      { id: 'ts-6', club_id: DEMO_CLUB_ID, coach_id: COACH_ID, group_name: 'U14', category: 'U14', sport: 'tennis', type: 'physical', date: dateOnly(-1), duration_min: 60, rpe_group: 7, warmup_done: true, cooldown_done: true, notes: 'Fuerza y movilidad' },
    ],

    session_attendance: [
      { id: 'sa-1', session_id: 'ts-1', player_id: PLAYER_ID, status: 'present' },
      { id: 'sa-2', session_id: 'ts-2', player_id: PLAYER_ID, status: 'present' },
      { id: 'sa-3', session_id: 'ts-3', player_id: PLAYER_ID, status: 'absent' },
      { id: 'sa-4', session_id: 'ts-4', player_id: PLAYER_ID, status: 'present' },
      { id: 'sa-5', session_id: 'ts-5', player_id: PLAYER_ID, status: 'present' },
      { id: 'sa-6', session_id: 'ts-6', player_id: PLAYER_ID, status: 'present' },
      { id: 'sa-7', session_id: 'ts-1', player_id: 'demo-player-002', status: 'present' },
      { id: 'sa-8', session_id: 'ts-2', player_id: 'demo-player-002', status: 'present' },
      { id: 'sa-9', session_id: 'ts-3', player_id: 'demo-player-002', status: 'present' },
      { id: 'sa-10', session_id: 'ts-1', player_id: 'demo-player-003', status: 'absent' },
    ],

    training_plans: [
      {
        id: 'tp-demo-1',
        user_id: PLAYER_ID,
        coach_id: COACH_ID,
        sport: 'Tenis',
        category: 'Sub-14',
        cycle_name: 'Ciclo de base',
        current_stage: 'implementation',
        current_week: 3,
        total_weeks: 6,
        objective: 'Mejorar la consistencia del saque y la resistencia en partidos largos.',
        start_date: dateOnly(-14),
        end_date: dateOnly(28),
        created_at: isoAt(-14),
      },
    ],

    training_plan_sessions: (() => {
      const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const jsDay = new Date().getDay();
      const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
      const pattern: Array<'technical' | 'physical' | 'tactical' | 'match' | 'rest'> = ['technical', 'physical', 'rest', 'tactical', 'technical', 'match', 'rest'];
      if (pattern[todayIdx] === 'rest') pattern[todayIdx] = 'technical';
      const catalog = {
        technical: {
          title: 'Saque y revés', dur: 60, rpe: 6, intensity: 'media',
          ex: [
            { phase: 'warmup', name: 'Trote suave y movilidad', duration: '5 min' },
            { phase: 'warmup', name: 'Peloteo corto desde la línea', duration: '5 min' },
            { phase: 'main', name: 'Saque a la T (derecha e izquierda)', sets: '4 × 8' },
            { phase: 'main', name: 'Revés cruzado con objetivo', sets: '3 × 10' },
            { phase: 'main', name: 'Segundo saque con efecto', sets: '3 × 6' },
            { phase: 'cooldown', name: 'Estiramiento de hombro y espalda', duration: '5 min' },
          ],
        },
        physical: {
          title: 'Fuerza y velocidad', dur: 50, rpe: 7, intensity: 'alta',
          ex: [
            { phase: 'warmup', name: 'Movilidad de cadera y tobillo', duration: '6 min' },
            { phase: 'main', name: 'Sentadilla con salto', sets: '3 × 8' },
            { phase: 'main', name: 'Escalera de coordinación', duration: '4 min' },
            { phase: 'main', name: 'Sprints de 10 metros', sets: '6 × 1' },
            { phase: 'cooldown', name: 'Respiración y estiramiento', duration: '5 min' },
          ],
        },
        tactical: {
          title: 'Puntos y decisiones', dur: 60, rpe: 6, intensity: 'media',
          ex: [
            { phase: 'warmup', name: 'Minitenis', duration: '6 min' },
            { phase: 'main', name: 'Juego de puntos con zonas', duration: '15 min' },
            { phase: 'main', name: 'Pasar a la red tras el saque', sets: '3 × 6' },
            { phase: 'cooldown', name: 'Estiramiento suave', duration: '5 min' },
          ],
        },
        match: {
          title: 'Partido con el grupo', dur: 90, rpe: 8, intensity: 'alta',
          ex: [
            { phase: 'warmup', name: 'Calentamiento en cancha', duration: '10 min' },
            { phase: 'main', name: 'Set completo', duration: '45 min' },
            { phase: 'cooldown', name: 'Vuelta a la calma', duration: '8 min' },
          ],
        },
        rest: { title: 'Descanso activo', dur: 0, rpe: 1, intensity: 'baja', ex: [] as unknown[] },
      };
      const rows: Record<string, unknown>[] = labels.map((label, i) => {
        const c = catalog[pattern[i]];
        return {
          id: `tps-w3-${i}`,
          plan_id: 'tp-demo-1',
          week_number: 3,
          day_index: i,
          day_label: label,
          session_type: pattern[i],
          title: c.title,
          duration_min: c.dur,
          rpe: c.rpe,
          intensity: c.intensity,
          status: i < todayIdx && pattern[i] !== 'rest' ? 'completed' : 'pending',
          exercises: c.ex,
          notes: null,
          created_at: isoAt(-14),
        };
      });
      // Semanas anteriores: dan el avance del ciclo.
      for (let w = 1; w <= 2; w++) {
        for (let i = 0; i < 6; i++) {
          rows.push({
            id: `tps-w${w}-${i}`, plan_id: 'tp-demo-1', week_number: w, day_index: i, day_label: labels[i],
            session_type: pattern[i] === 'rest' ? 'technical' : pattern[i], title: 'Sesión', duration_min: 60,
            rpe: 6, intensity: 'media', status: i < 4 ? 'completed' : 'pending', exercises: [], notes: null, created_at: isoAt(-14),
          });
        }
      }
      return rows;
    })(),

    coach_notes: [
      { id: 'cn-1', player_id: PLAYER_ID, coach_id: COACH_ID, club_id: DEMO_CLUB_ID, content: 'Excelente progreso en saque. Mejoró la consistencia del segundo servicio esta semana.', created_at: isoAt(-3) },
      { id: 'cn-2', player_id: 'demo-player-002', coach_id: COACH_ID, club_id: DEMO_CLUB_ID, content: 'Lucía está demostrando muy buena actitud en los entrenamientos de fuerza.', created_at: isoAt(-7) },
    ],

    medical_clearances: [
      { id: 'mc-1', user_id: PLAYER_ID, issued_date: dateOnly(-60), expiry_date: dateOnly(300), doctor_name: 'Dr. Martín Rodríguez', uploaded_by: COACH_ID, status: 'valid' },
    ],

    club_announcements: [
      { id: 'ann-1', club_id: DEMO_CLUB_ID, author_id: COACH_ID, title: 'Torneo interno este sábado', content: 'Recordamos que el sábado a las 10am arrancamos con el torneo interno. Llevar agua, gorra y buena onda!', priority: 'high', is_pinned: true, target_roles: ['player'], created_at: isoAt(-2) },
      { id: 'ann-2', club_id: DEMO_CLUB_ID, author_id: COACH_ID, title: 'Cambio de horario miércoles', content: 'El miércoles próximo el entrenamiento será 17:30 a 19:00 (en lugar del horario habitual).', priority: 'normal', is_pinned: false, target_roles: ['player'], created_at: isoAt(-5) },
    ],

    // ──────────────────────────────────────
    // Classroom (shared between roles)
    // ──────────────────────────────────────

    course_modules: [
      {
        id: 'a1000000-0000-0000-0000-000000000001',
        title: 'Preparación Física para Tenistas',
        description: 'Fundamentos de la preparación física aplicada al tenis. Calentamiento, fuerza base, movilidad y recuperación.',
        target_role: 'player',
        sort_order: 0,
        is_published: true,
        cover_url: null,
        created_at: isoAt(-30),
      },
      {
        id: 'a1000000-0000-0000-0000-000000000002',
        title: 'Entrenamiento Mental para Competir',
        description: 'Técnicas de concentración, visualización y manejo de presión para competencias deportivas.',
        target_role: 'player',
        sort_order: 1,
        is_published: true,
        cover_url: null,
        created_at: isoAt(-30),
      },
      {
        id: 'a1000000-0000-0000-0000-000000000003',
        title: 'Metodología de Entrenamiento Juvenil',
        description: 'Principios de la enseñanza deportiva para entrenadores que trabajan con jóvenes atletas.',
        target_role: 'coach',
        sort_order: 0,
        is_published: true,
        cover_url: null,
        created_at: isoAt(-30),
      },
    ],

    course_sections: [
      { id: 'b1000000-0000-0000-0000-000000000001', module_id: 'a1000000-0000-0000-0000-000000000001', title: 'Semana 1: Fundamentos', sort_order: 0 },
      { id: 'b1000000-0000-0000-0000-000000000002', module_id: 'a1000000-0000-0000-0000-000000000001', title: 'Semana 2: Fuerza Base', sort_order: 1 },
      { id: 'b1000000-0000-0000-0000-000000000003', module_id: 'a1000000-0000-0000-0000-000000000002', title: 'Fundamentos Mentales', sort_order: 0 },
      { id: 'b1000000-0000-0000-0000-000000000004', module_id: 'a1000000-0000-0000-0000-000000000003', title: 'Principios Pedagógicos', sort_order: 0 },
    ],

    course_lessons: [
      { id: 'c1000000-0000-0000-0000-000000000001', section_id: 'b1000000-0000-0000-0000-000000000001', title: 'Introducción al entrenamiento', content_md: 'La preparación física es la base del rendimiento deportivo. En esta lección vas a aprender por qué es importante entrenar el cuerpo de forma integral, no solo la técnica del deporte.\n\nPuntos clave:\n- El cuerpo necesita una base física sólida para rendir\n- La preparación física previene lesiones\n- Se adapta a la edad y el nivel del deportista', duration_min: 5, sort_order: 0 },
      { id: 'c1000000-0000-0000-0000-000000000002', section_id: 'b1000000-0000-0000-0000-000000000001', title: 'Calentamiento dinámico', content_md: 'El calentamiento es la parte más importante antes de cualquier actividad física. Un buen calentamiento prepara los músculos, las articulaciones y el sistema nervioso.\n\nRutina de calentamiento:\n1. Trote suave 3 minutos\n2. Movilidad articular (tobillos, rodillas, caderas, hombros)\n3. Activación muscular (sentadillas, estocadas, saltos)\n4. Ejercicios específicos del deporte', duration_min: 8, sort_order: 1 },
      { id: 'c1000000-0000-0000-0000-000000000003', section_id: 'b1000000-0000-0000-0000-000000000001', title: 'Movilidad articular', content_md: 'La movilidad articular te permite moverte mejor y con menos riesgo de lesión. Es diferente a la flexibilidad: la movilidad es movimiento activo controlado.\n\nEjercicios fundamentales:\n- Rotaciones de tobillo (10 por lado)\n- Círculos de cadera (10 por lado)\n- Rotaciones de hombro (10 por lado)\n- Giros de muñeca (especial para tenistas)', duration_min: 6, sort_order: 2 },
      { id: 'c1000000-0000-0000-0000-000000000004', section_id: 'b1000000-0000-0000-0000-000000000002', title: 'Principios de fuerza', content_md: 'La fuerza es la capacidad de generar tensión muscular. En el deporte juvenil, trabajamos fuerza con el propio peso corporal antes de usar cargas externas.\n\nPrincipios:\n- Progresión gradual (de menos a más)\n- Técnica antes que carga\n- Descanso entre series\n- Consistencia en el entrenamiento', duration_min: 7, sort_order: 0 },
      { id: 'c1000000-0000-0000-0000-000000000005', section_id: 'b1000000-0000-0000-0000-000000000002', title: 'Ejercicios con peso corporal', content_md: 'Estos ejercicios forman la base de tu preparación física. Podés hacerlos en casa sin ningún equipamiento.\n\nCircuito base (3 series):\n1. Sentadillas: 10 repeticiones\n2. Flexiones (adaptadas): 8 repeticiones\n3. Plancha: 20 segundos\n4. Estocadas: 8 por pierna\n5. Superman: 10 repeticiones\n\nDescanso: 60 segundos entre series.', duration_min: 12, sort_order: 1 },
      { id: 'c1000000-0000-0000-0000-000000000006', section_id: 'b1000000-0000-0000-0000-000000000003', title: 'Respiración para la calma', content_md: 'La respiración es tu herramienta más poderosa para controlar los nervios. La técnica 4-2-6 es simple y efectiva.\n\nTécnica 4-2-6:\n1. Inhalar por la nariz contando hasta 4\n2. Mantener contando hasta 2\n3. Exhalar por la boca contando hasta 6\n\nPracticá 5 ciclos antes de cada partido o entrenamiento.', duration_min: 5, sort_order: 0 },
      { id: 'c1000000-0000-0000-0000-000000000007', section_id: 'b1000000-0000-0000-0000-000000000003', title: 'Visualización pre-partido', content_md: 'La visualización es imaginar en tu mente lo que querés que pase en el partido. Los mejores deportistas del mundo la practican.\n\nEjercicio de visualización (30 segundos):\n- Cerrá los ojos\n- Imaginá tu primer punto/jugada\n- Sentí la raqueta/pelota en tu mano\n- Visualizá el movimiento perfecto\n- Sentí la confianza en tu cuerpo', duration_min: 8, sort_order: 1 },
      { id: 'c1000000-0000-0000-0000-000000000008', section_id: 'b1000000-0000-0000-0000-000000000004', title: 'El modelo DMSP', content_md: 'El Developmental Model of Sport Participation (Jean Côté) es el marco de referencia para el desarrollo deportivo juvenil.\n\nEtapas:\n1. Sampling (6-12 años): Variedad de deportes, diversión\n2. Specializing (13-15 años): Reducir deportes, más práctica deliberada\n3. Investment (16+ años): Dedicación a un deporte\n\nComo entrenador, tu rol cambia en cada etapa.', duration_min: 10, sort_order: 0 },
      { id: 'c1000000-0000-0000-0000-000000000009', section_id: 'b1000000-0000-0000-0000-000000000004', title: 'Comunicación con jóvenes', content_md: 'La forma en que te comunicás con tus deportistas impacta directamente en su motivación y desarrollo.\n\nPrincipios:\n- Feedback positivo antes que correctivo (ratio 3:1)\n- Preguntas abiertas en lugar de instrucciones cerradas\n- Escuchar activamente sus preocupaciones\n- Adaptar el lenguaje a la edad\n- Celebrar el esfuerzo, no solo el resultado', duration_min: 8, sort_order: 1 },
    ],

    lesson_quizzes: [
      {
        id: 'q-1',
        lesson_id: 'c1000000-0000-0000-0000-000000000003',
        questions: [
          { prompt: 'Cuál es la diferencia entre movilidad y flexibilidad?', options: ['Son lo mismo', 'La movilidad es movimiento activo controlado', 'La flexibilidad es más importante', 'No hay diferencia en el deporte'], correctIndex: 1 },
          { prompt: 'Cuántas rotaciones de tobillo se recomiendan por lado?', options: ['5', '10', '15', '20'], correctIndex: 1 },
          { prompt: 'Por qué es importante la movilidad articular?', options: ['Para verse bien', 'Para mover mejor y con menos riesgo de lesión', 'Para ser más rápido', 'No es importante'], correctIndex: 1 },
        ],
        pass_percent: 70,
      },
    ],

    lesson_completions: [],
    quiz_attempts: [],
  };
}

// ─── Avatar chat mock responses ──────────────────────────────────────
type Avatar = 'TINO' | 'ZAHIA' | 'ROMA';

const RESPONSES: Record<Avatar, Array<{ keywords: RegExp; response: string }>> = {
  TINO: [
    { keywords: /(saque|servicio|service)/i, response: 'Para mejorar el saque, enfocate en la consistencia antes que la potencia. Practicá 20 saques diarios apuntando a la T del cuadro de servicio. Cuando la consistencia esté firme, sumá velocidad gradualmente.' },
    { keywords: /(fuerza|gym|musculación)/i, response: 'A tu edad, el trabajo con peso corporal es lo más recomendado. Sentadillas, planchas, flexiones y estocadas: 3 series de 10 reps, dos veces por semana. Eso ya genera adaptaciones reales en tu juego.' },
    { keywords: /(lesion|dolor|molestia)/i, response: 'Si tenés dolor, primero descanso y aplicá hielo 15 minutos. Si persiste más de 48hs, consultá con un profesional de la salud. No entrenes el área afectada hasta estar 100% — entrenar dolorido empeora todo.' },
    { keywords: /(calentamiento|warm.?up)/i, response: 'El calentamiento debe durar 10-15 minutos: 3 minutos de trote suave, 5 minutos de movilidad articular, y 5 minutos de movimientos específicos del deporte. Nunca arranques en frío.' },
    { keywords: /.*/, response: 'Buena pregunta. Para mejorar tu juego, lo más importante es la constancia: entrenar regular es más útil que entrenar muchas horas un día. Decime más sobre qué querés trabajar y lo armamos juntos.' },
  ],
  ZAHIA: [
    { keywords: /(hidrat|agua|tomar)/i, response: 'La hidratación arranca desde la noche anterior, no en el partido. Tomá 500ml al despertar, otro vaso 1 hora antes del entreno, y llevá una botella con sales o agua de coco para sorbos cada 15-20 minutos.' },
    { keywords: /(comer|comida|comer antes|nutri)/i, response: 'Lo ideal es comer 2-3 horas antes del entreno: arroz o pastas integrales con una proteína magra (pollo o pescado) y vegetales. Evitá frituras o lácteos pesados antes de jugar.' },
    { keywords: /(post.?entreno|recuperación|despues)/i, response: 'En la primera hora post-entrenamiento, combiná proteína (huevo, yogur, atún) con carbohidrato (banana, pan integral, arroz). Eso acelera la recuperación muscular y reposiciona los depósitos de energía.' },
    { keywords: /(snack|merienda|colación)/i, response: 'Snack ideal pre-entreno (1 hora antes): banana con manteca de maní, o un yogur con avena, o un puñado de almendras y una fruta. Energía sostenida sin pesadez.' },
    { keywords: /.*/, response: 'La nutrición deportiva no es complicada: comé real, comé suficiente, y respetá los tiempos. Si me contás un poco más sobre tu día y tus entrenamientos, te puedo armar una sugerencia más concreta.' },
  ],
  ROMA: [
    { keywords: /(nervios|nervio|ansiedad|presión)/i, response: 'Los nervios son señal de que te importa, no de que algo está mal. Probá la respiración 4-2-6 (inhalar 4, mantener 2, exhalar 6) repetida 5 veces antes de competir. Bajan las pulsaciones y vuelve la claridad.' },
    { keywords: /(concentración|concentrar|distraído)/i, response: 'Para reenfocar entre puntos, usá un ritual breve: ajustá las cuerdas, rebotá la pelota 3 veces, respirá profundo. Esos 10 segundos te traen al presente. La concentración no se mantiene 100% del tiempo, se recupera punto a punto.' },
    { keywords: /(perder|fracaso|mal partido|salió mal)/i, response: 'Perder duele, y está bien sentirlo. Lo importante es separar emoción de aprendizaje: hoy sentilo, mañana analizá qué podés mejorar. Cada partido perdido tiene 3-5 cosas concretas para entrenar la semana siguiente.' },
    { keywords: /(visualizar|visualización|imaginar)/i, response: 'La visualización es entrenamiento mental real: tu cerebro no distingue del 100% entre imaginar y hacer. Practicá 5 minutos por día imaginando tu mejor versión jugando. Los detalles importan: el sonido de la pelota, el peso de la raqueta, el calor del sol.' },
    { keywords: /(motivación|ganas|desanimado)/i, response: 'La motivación viene y va, pero la disciplina es lo que sostiene. En los días de bajón, bajá la exigencia pero no el compromiso: entrená menos pero entrená igual. Los días buenos compensarán.' },
    { keywords: /.*/, response: 'Te escucho. Contame más sobre lo que estás sintiendo o pensando — cuanto más concreto seas, más útil te puedo ser. Lo mental se trabaja igual que el cuerpo: con práctica diaria.' },
  ],
};

export function mockAvatarReply(avatar: Avatar, message: string): string {
  const list = RESPONSES[avatar] ?? RESPONSES.TINO;
  for (const { keywords, response } of list) {
    if (keywords.test(message)) return response;
  }
  return list[list.length - 1].response;
}

const OPENERS: Record<Avatar, string[]> = {
  TINO: ['¡Dale, vamos con eso!', 'Buena pregunta, campeón.', '¡Me gusta que lo preguntes!'],
  ZAHIA: ['¡Qué buena pregunta!', 'Mirá, te lo explico fácil.', 'Perfecto que lo consultes.'],
  ROMA: ['Gracias por contármelo.', 'Entiendo lo que decís.', 'Eso le pasa a mucha gente que compite.'],
};

const CLOSERS: Record<Avatar, string> = {
  TINO: '¿Querés que lo armemos como parte de tu plan de la semana?',
  ZAHIA: '¿Te armo una idea concreta para hoy?',
  ROMA: '¿Lo probamos juntos en tu próximo entrenamiento?',
};

/** Respuesta en 2–3 partes (como el edge function real), con voseo y sobre el tema consultado. */
export function mockAvatarReplyParts(avatar: Avatar, message: string): string[] {
  const body = mockAvatarReply(avatar, message);
  const sentences = body.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((x) => x.trim()) ?? [body];
  const generic = body === (RESPONSES[avatar] ?? RESPONSES.TINO).slice(-1)[0].response;
  const opener = generic ? '' : OPENERS[avatar][message.length % OPENERS[avatar].length];
  const mid = Math.max(1, Math.ceil(sentences.length / 2));
  const parts = [`${opener} ${sentences.slice(0, mid).join(' ')}`.trim()];
  const rest = sentences.slice(mid).join(' ').trim();
  if (rest) parts.push(rest);
  parts.push(CLOSERS[avatar]);
  return parts;
}

export { newId };
