/**
 * Dataset determinístico del club ficticio "Club Atlético Los Ceibos".
 * Misma semilla => mismos socios; las fechas son relativas a hoy.
 * Todos los nombres son inventados; cualquier parecido con clubes reales es casual.
 */
import type {
  Announcement, AttendanceSession, Category, ClubDataset, Coach, EnrollmentRequest, Fee, FeeStatus,
  Fixture, Member, MedicalRecord, RiskEntry, Sport,
} from '@/types/club';

// ─── PRNG ──────────────────────────────────────────────────────────
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const iso = (d: Date) => d.toISOString().split('T')[0];
const addDays = (base: Date, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};
const periodOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const FIRST_F = ['Sofía', 'Martina', 'Valentina', 'Camila', 'Julieta', 'Lucía', 'Emma', 'Catalina', 'Mía', 'Renata', 'Delfina', 'Olivia', 'Agustina', 'Pilar', 'Milagros', 'Guadalupe', 'Abril', 'Candela', 'Josefina', 'Bianca'];
const FIRST_M = ['Mateo', 'Santino', 'Benjamín', 'Thiago', 'Joaquín', 'Lautaro', 'Bautista', 'Facundo', 'Tomás', 'Franco', 'Lucas', 'Nicolás', 'Ignacio', 'Gael', 'Dante', 'Ramiro', 'Juan Cruz', 'Máximo', 'Felipe', 'Santiago'];
const LAST = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Pérez', 'Gómez', 'Sánchez', 'Romero', 'Díaz', 'Álvarez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Medina', 'Herrera', 'Suárez', 'Aguirre', 'Giménez', 'Molina', 'Castro', 'Ortiz', 'Silva', 'Núñez', 'Luna', 'Juárez', 'Cabrera', 'Ríos', 'Morales', 'Vega', 'Ibarra', 'Peralta', 'Domínguez', 'Sosa', 'Rojas', 'Paz', 'Quiroga'];
const GUARDIAN_F = ['Laura', 'Marcela', 'Silvana', 'Carolina', 'Andrea', 'Paula', 'Verónica', 'Natalia', 'Claudia', 'Mariana', 'Gabriela', 'Romina'];
const GUARDIAN_M = ['Carlos', 'Gustavo', 'Fernando', 'Diego', 'Pablo', 'Sergio', 'Marcelo', 'Hernán', 'Javier', 'Ariel', 'Walter', 'Cristian'];

const COACHES: Coach[] = [
  { id: 'coach-1', name: 'Martín Acosta', phone: '+54 11 5550-1101' },
  { id: 'coach-2', name: 'Lucía Benítez', phone: '+54 11 5550-1102' },
  { id: 'coach-3', name: 'Diego Ferreyra', phone: '+54 11 5550-1103' },
];

interface CatSpec {
  id: string; name: string; sport: Sport; coach: number; schedule: string; fee: number;
  count: number; ageMin: number; ageMax: number; girls: number; attendance: number;
}

const CATS: CatSpec[] = [
  { id: 'cat-fut8', name: 'Fútbol Sub-8', sport: 'Fútbol', coach: 0, schedule: 'Mar y Jue 17:30', fee: 22000, count: 28, ageMin: 6, ageMax: 8, girls: 0.2, attendance: 0.86 },
  { id: 'cat-fut10', name: 'Fútbol Sub-10', sport: 'Fútbol', coach: 0, schedule: 'Lun y Mié 18:00', fee: 22000, count: 26, ageMin: 9, ageMax: 10, girls: 0.15, attendance: 0.82 },
  { id: 'cat-fut12', name: 'Fútbol Sub-12', sport: 'Fútbol', coach: 0, schedule: 'Mar y Jue 19:00', fee: 24000, count: 24, ageMin: 11, ageMax: 12, girls: 0.1, attendance: 0.78 },
  { id: 'cat-hoc12', name: 'Hockey Sub-12', sport: 'Hockey', coach: 1, schedule: 'Lun y Mié 17:00', fee: 26000, count: 22, ageMin: 10, ageMax: 12, girls: 1, attendance: 0.84 },
  { id: 'cat-hoc14', name: 'Hockey Sub-14', sport: 'Hockey', coach: 1, schedule: 'Mar y Vie 18:30', fee: 26000, count: 20, ageMin: 13, ageMax: 14, girls: 1, attendance: 0.5 },
  { id: 'cat-bas13', name: 'Básquet Sub-13', sport: 'Básquet', coach: 2, schedule: 'Mar y Jue 18:00', fee: 25000, count: 24, ageMin: 11, ageMax: 13, girls: 0.4, attendance: 0.83 },
  { id: 'cat-bas15', name: 'Básquet Sub-15', sport: 'Básquet', coach: 2, schedule: 'Lun y Vie 19:30', fee: 25000, count: 22, ageMin: 14, ageMax: 15, girls: 0.4, attendance: 0.52 },
  { id: 'cat-ten', name: 'Escuela de Tenis', sport: 'Tenis', coach: 2, schedule: 'Sáb 10:00', fee: 30000, count: 20, ageMin: 8, ageMax: 14, girls: 0.5, attendance: 0.9 },
];

const REMINDER_BODY = 'Hola familia, les recordamos que la cuota del mes ya está disponible. Podés abonarla por transferencia, Mercado Pago o en secretaría. ¡Gracias por acompañar!';

export const DEMO_FAMILY_CHILD_ID = 'm-ibarra-tomas';

export function buildClubDataset(today = new Date(), seed = 2026): ClubDataset {
  const rnd = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const categories: Category[] = CATS.map((c) => ({
    id: c.id, name: c.name, sport: c.sport, coachId: COACHES[c.coach].id, coachName: COACHES[c.coach].name,
    schedule: c.schedule, monthlyFee: c.fee,
  }));

  // ─── Socios ──────────────────────────────────────────────────────
  const members: Member[] = [];
  const usedNames = new Set<string>();
  CATS.forEach((c) => {
    for (let i = 0; i < c.count; i++) {
      const girl = rnd() < c.girls;
      let first = '', last = '', key = '';
      do {
        first = pick(girl ? FIRST_F : FIRST_M);
        last = pick(LAST);
        key = `${first} ${last}`;
      } while (usedNames.has(key));
      usedNames.add(key);
      const age = c.ageMin + Math.floor(rnd() * (c.ageMax - c.ageMin + 1));
      const birth = addDays(base, -(age * 365 + Math.floor(rnd() * 330) + 20));
      const gFirst = pick(rnd() < 0.6 ? GUARDIAN_F : GUARDIAN_M);
      const slug = `${first}.${last}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '');
      members.push({
        id: `m-${c.id}-${i + 1}`,
        firstName: first,
        lastName: last,
        dni: String(38000000 + Math.floor(rnd() * 9000000) + (age < 10 ? 6000000 : 0)),
        birthDate: iso(birth),
        categoryId: c.id,
        guardianName: `${gFirst} ${last}`,
        guardianPhone: `+54 9 11 ${String(4000 + Math.floor(rnd() * 5999))}-${String(1000 + Math.floor(rnd() * 8999))}`,
        email: `${slug}@mail.com`,
        joinedAt: iso(addDays(base, -Math.floor(rnd() * 1100) - 30)),
        status: 'activo',
        hasDniCopy: rnd() < 0.9,
        hasAuthorization: rnd() < 0.93,
        notes: [],
      });
    }
  });

  // Hijo de la vista Familia: fijo y reconocible
  const kid = members.find((m) => m.categoryId === 'cat-fut10')!;
  Object.assign(kid, {
    id: DEMO_FAMILY_CHILD_ID, firstName: 'Tomás', lastName: 'Ibarra', guardianName: 'Carolina Ibarra',
    email: 'carolina.ibarra@mail.com', hasDniCopy: true, hasAuthorization: true,
  });

  // Algunas notas del coach
  const noteTexts = [
    'Muy buena actitud en el entrenamiento. Mejoró el pase corto.',
    'Se resintió del tobillo la semana pasada. Seguir de cerca.',
    'Falta con frecuencia los viernes. Hablar con la familia.',
    'Destacado en el partido del sábado. Candidato a capitán.',
  ];
  members.filter((_, i) => i % 9 === 0).forEach((m, i) => {
    const cat = categories.find((c) => c.id === m.categoryId)!;
    m.notes.push({ id: `n-${m.id}`, date: iso(addDays(base, -(3 + i * 2))), author: cat.coachName, text: noteTexts[i % noteTexts.length] });
  });

  // Orden determinístico para repartir estados
  const order = [...members].sort(() => rnd() - 0.5);

  // ─── Cuotas: 6 meses ─────────────────────────────────────────────
  const total = members.length; // 186
  const overdueN = Math.round(total * 0.07);
  const pendingN = Math.round(total * 0.11);
  const statusFor = new Map<string, FeeStatus>();
  order.forEach((m, i) => statusFor.set(m.id, i < overdueN ? 'vencida' : i < overdueN + pendingN ? 'pendiente' : 'al_dia'));
  statusFor.set(DEMO_FAMILY_CHILD_ID, 'pendiente');

  const fees: Fee[] = [];
  const methods = ['transferencia', 'efectivo', 'mercado_pago'] as const;
  for (const m of members) {
    const cat = categories.find((c) => c.id === m.categoryId)!;
    for (let back = 5; back >= 0; back--) {
      const current = back === 0;
      const monthStart = new Date(base.getFullYear(), base.getMonth() - back, 1);
      const dueDay = current ? Math.max(1, Math.min(5, base.getDate() - 1)) : 5;
      const due = new Date(monthStart.getFullYear(), monthStart.getMonth(), dueDay);
      let status: FeeStatus;
      if (current) status = statusFor.get(m.id)!;
      else if (back === 1 && statusFor.get(m.id) === 'vencida') status = 'vencida';
      else status = rnd() < 0.93 ? 'al_dia' : 'vencida';
      const fee: Fee = {
        id: `f-${m.id}-${periodOf(monthStart)}`,
        memberId: m.id,
        period: periodOf(monthStart),
        amount: cat.monthlyFee,
        dueDate: iso(due),
        status,
      };
      if (status === 'al_dia') {
        fee.paidAt = iso(addDays(due, -Math.floor(rnd() * 9)));
        fee.method = pick([...methods]);
      }
      fees.push(fee);
    }
  }

  // ─── Aptos médicos ───────────────────────────────────────────────
  const medicalOrder = [...members].sort(() => rnd() - 0.5);
  // La vista Familia siempre cae en "por vencer"
  const kidIdx = medicalOrder.findIndex((m) => m.id === DEMO_FAMILY_CHILD_ID);
  [medicalOrder[9], medicalOrder[kidIdx]] = [medicalOrder[kidIdx], medicalOrder[9]];
  const medical: MedicalRecord[] = [];
  medicalOrder.forEach((m, i) => {
    if (m.id === DEMO_FAMILY_CHILD_ID) {
      medical.push({ memberId: m.id, issuedAt: iso(addDays(base, -340)), expiresAt: iso(addDays(base, 25)) });
    } else if (i < 9) {
      medical.push({ memberId: m.id, issuedAt: iso(addDays(base, -400 - i * 7)), expiresAt: iso(addDays(base, -(5 + i * 9))) });
    } else if (i < 23) {
      medical.push({ memberId: m.id, issuedAt: iso(addDays(base, -350)), expiresAt: iso(addDays(base, 2 + (i - 9) * 2)) });
    } else if (i < 29) {
      medical.push({ memberId: m.id });
    } else {
      medical.push({ memberId: m.id, issuedAt: iso(addDays(base, -Math.floor(rnd() * 200))), expiresAt: iso(addDays(base, 40 + Math.floor(rnd() * 280))) });
    }
  });
  // El hijo de Familia podría haber caído en los primeros 9: ya se le pisó arriba. Normalizamos conteos.
  const kidRec = medical.find((r) => r.memberId === DEMO_FAMILY_CHILD_ID)!;
  Object.assign(kidRec, { issuedAt: iso(addDays(base, -340)), expiresAt: iso(addDays(base, 25)) });

  // ─── Asistencia: 4 semanas, 2 sesiones/semana por categoría ──────
  const attendance: AttendanceSession[] = [];
  CATS.forEach((c) => {
    const catMembers = members.filter((m) => m.categoryId === c.id);
    for (let w = 3; w >= 0; w--) {
      [1, 4].forEach((dow, k) => {
        const date = addDays(base, -(w * 7) + (dow - base.getDay()));
        const taken = date <= base;
        const present = taken ? catMembers.filter(() => rnd() < c.attendance).map((m) => m.id) : [];
        attendance.push({
          id: `a-${c.id}-${iso(date)}-${k}`, categoryId: c.id, date: iso(date),
          title: `Entrenamiento ${categories.find((x) => x.id === c.id)!.name}`, presentIds: present, taken,
        });
      });
    }
  });

  // ─── Calendario ──────────────────────────────────────────────────
  const at = (days: number, h: number) => {
    const d = addDays(base, days);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };
  const fixtures: Fixture[] = [
    { id: 'fx-1', categoryId: 'cat-fut10', rival: 'Deportivo Alberdi', date: at(2, 10), venue: 'Cancha 2 · Los Ceibos', home: true, kind: 'partido' },
    { id: 'fx-2', categoryId: 'cat-hoc14', rival: 'Club Santa Rita', date: at(4, 15), venue: 'Predio Santa Rita', home: false, kind: 'partido' },
    { id: 'fx-3', categoryId: 'cat-bas15', rival: 'Atlético Mitre Joven', date: at(6, 17), venue: 'Gimnasio Los Ceibos', home: true, kind: 'partido' },
    { id: 'fx-4', categoryId: 'cat-fut8', rival: 'Torneo Regional Sub-8 a Sub-12', date: at(13, 9), venue: 'Complejo Municipal', home: false, kind: 'torneo' },
    { id: 'fx-5', categoryId: 'cat-fut12', rival: 'Unión Barrio Norte', date: at(-3, 11), venue: 'Cancha 1 · Los Ceibos', home: true, kind: 'partido', result: '3-1' },
    { id: 'fx-6', categoryId: 'cat-bas13', rival: 'Club Náutico Sur', date: at(-5, 16), venue: 'Gimnasio Los Ceibos', home: true, kind: 'partido', result: '48-52' },
    { id: 'fx-7', categoryId: 'cat-hoc12', rival: 'Hockey Club Pampa', date: at(-8, 14), venue: 'Predio Pampa', home: false, kind: 'partido', result: '2-2' },
  ];

  // ─── Comunicación ────────────────────────────────────────────────
  const annTitles: [string, string, 'app' | 'email' | 'whatsapp'][] = [
    ['Recordatorio de cuota del mes', REMINDER_BODY, 'app'],
    ['Suspensión por lluvia', 'Por el pronóstico, se suspenden los entrenamientos de hoy. Retomamos mañana en el horario habitual.', 'whatsapp'],
    ['Apto médico: vencimientos próximos', 'Revisá la fecha de tu apto médico. Sin apto vigente no podemos habilitar la participación en partidos.', 'email'],
    ['Torneo regional: inscripción abierta', 'Abrió la inscripción al torneo regional. Se cierra el viernes en secretaría.', 'app'],
    ['Nuevo horario de Hockey Sub-14', 'A partir de la semana próxima entrenamos martes y viernes 18:30.', 'app'],
    ['Cena de fin de año', 'Guardá la fecha: cena familiar del club el último sábado de noviembre.', 'email'],
    ['Reunión de padres Fútbol infantil', 'Convocamos a una reunión para coordinar traslados al torneo.', 'whatsapp'],
    ['Cambio de cancha', 'El partido del sábado se juega en Cancha 2.', 'app'],
    ['Entrega de camisetas', 'Ya están las camisetas nuevas. Retiralas en secretaría de lunes a viernes de 17 a 20.', 'app'],
    ['Resumen semanal para familias', 'Esta semana: 2 entrenamientos, 1 partido ganado y recordatorio de cuota.', 'email'],
    ['Felicitaciones Básquet Sub-13', 'Gran partido del equipo. ¡A seguir así!', 'app'],
    ['Campaña de abrigos', 'Estamos juntando abrigos para el comedor del barrio. Se reciben en secretaría.', 'whatsapp'],
  ];
  const announcements: Announcement[] = annTitles.map(([title, body, channel], i) => ({
    id: `an-${i + 1}`, title, body, audience: i % 4 === 0 ? 'todos' : [CATS[i % CATS.length].id],
    status: 'enviado', sentAt: addDays(base, -(i * 4 + 1)).toISOString(), channel,
  }));
  announcements.push(
    { id: 'an-d1', title: 'Borrador: viaje al torneo regional', body: 'Salida 7:30 desde el club. Confirmar asistencia.', audience: ['cat-fut8', 'cat-fut10', 'cat-fut12'], status: 'borrador', channel: 'app' },
    { id: 'an-d2', title: 'Borrador: reunión de fin de temporada', body: 'Reunión con coaches y familias para cerrar la temporada.', audience: 'todos', status: 'borrador', channel: 'email' },
  );

  // ─── Semáforo de riesgo (20 deportistas, 3 en rojo) ──────────────
  const riskMembers = [...members].sort(() => rnd() - 0.5).slice(0, 20);
  const risk: RiskEntry[] = riskMembers.map((m, i) => {
    const level = i < 3 ? 'rojo' : i < 9 ? 'amarillo' : 'verde';
    return {
      memberId: m.id,
      level,
      load: level === 'rojo' ? 9 : level === 'amarillo' ? 7 : 4 + Math.floor(rnd() * 2),
      pain: level === 'rojo' ? 7 + Math.floor(rnd() * 2) : level === 'amarillo' ? 4 : Math.floor(rnd() * 2),
      sleep: level === 'rojo' ? 5 : level === 'amarillo' ? 6.5 : 8,
      note: level === 'rojo' ? 'Carga alta + dolor + poco sueño. Descanso recomendado.' : level === 'amarillo' ? 'Vigilar carga esta semana.' : 'Sin alertas.',
    };
  });

  const requests: EnrollmentRequest[] = [
    { id: 'rq-1', name: 'Bruno Cardozo', categoryId: 'cat-fut8', requestedAt: addDays(base, -1).toISOString() },
    { id: 'rq-2', name: 'Alma Villalba', categoryId: 'cat-hoc12', requestedAt: addDays(base, -2).toISOString() },
    { id: 'rq-3', name: 'Ciro Barrios', categoryId: 'cat-bas13', requestedAt: addDays(base, -2).toISOString() },
    { id: 'rq-4', name: 'Jazmín Figueroa', categoryId: 'cat-ten', requestedAt: addDays(base, -4).toISOString() },
  ];

  return {
    club: { id: 'club-los-ceibos', name: 'Club Atlético Los Ceibos', city: 'Rosario, Santa Fe', foundedYear: 1962, director: 'Ricardo Sosa' },
    coaches: COACHES,
    categories, members, fees, medical, attendance, fixtures, announcements, risk, requests,
    familyChildId: DEMO_FAMILY_CHILD_ID,
  };
}
