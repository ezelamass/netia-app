export type Sport = 'Fútbol' | 'Hockey' | 'Básquet' | 'Tenis';
export type FeeStatus = 'al_dia' | 'pendiente' | 'vencida';
export type MedicalStatus = 'apto' | 'por_vencer' | 'vencido' | 'sin_apto';
export type RiskLevel = 'verde' | 'amarillo' | 'rojo';

export interface Category {
  id: string;
  name: string;
  sport: Sport;
  coachId: string;
  coachName: string;
  /** Texto libre, ej. "Mar y Jue 18:00" */
  schedule: string;
  /** Cuota mensual en ARS */
  monthlyFee: number;
}

export interface Coach {
  id: string;
  name: string;
  phone: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string; // YYYY-MM-DD
  categoryId: string;
  guardianName: string;
  guardianPhone: string;
  email: string;
  joinedAt: string; // YYYY-MM-DD
  status: 'activo' | 'inactivo';
  hasDniCopy: boolean;
  hasAuthorization: boolean;
  notes: CoachNote[];
}

export interface CoachNote {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Fee {
  id: string;
  memberId: string;
  period: string; // YYYY-MM
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: FeeStatus;
  paidAt?: string;
  method?: 'efectivo' | 'transferencia' | 'mercado_pago';
}

export interface MedicalRecord {
  memberId: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface AttendanceSession {
  id: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  title: string;
  presentIds: string[];
  /** Si ya se tomó lista. Las sesiones futuras o sin lista no cuentan en promedios. */
  taken: boolean;
}

export interface Fixture {
  id: string;
  categoryId: string;
  rival: string;
  date: string; // ISO
  venue: string;
  home: boolean;
  kind: 'partido' | 'torneo';
  /** Resultado "3-1" cuando ya se jugó */
  result?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** 'todos' o ids de categorías */
  audience: 'todos' | string[];
  status: 'enviado' | 'borrador';
  sentAt?: string;
  channel: 'app' | 'email' | 'whatsapp';
  template?: string;
}

export interface RiskEntry {
  memberId: string;
  level: RiskLevel;
  load: number; // 0-10
  pain: number; // 0-10
  sleep: number; // horas
  note: string;
}

export interface EnrollmentRequest {
  id: string;
  name: string;
  categoryId: string;
  requestedAt: string;
}

export interface ClubInfo {
  id: string;
  name: string;
  city: string;
  foundedYear: number;
  director: string;
}

export interface ClubDataset {
  club: ClubInfo;
  coaches: Coach[];
  categories: Category[];
  members: Member[];
  fees: Fee[];
  medical: MedicalRecord[];
  attendance: AttendanceSession[];
  fixtures: Fixture[];
  announcements: Announcement[];
  risk: RiskEntry[];
  requests: EnrollmentRequest[];
  /** id del socio que ve la vista Familia en la demo */
  familyChildId: string;
}

export const memberFullName = (m: Pick<Member, 'firstName' | 'lastName'>) => `${m.firstName} ${m.lastName}`;

export const currentPeriod = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const medicalStatusOf = (rec: MedicalRecord | undefined, today = new Date()): MedicalStatus => {
  if (!rec?.expiresAt) return 'sin_apto';
  const exp = new Date(rec.expiresAt + 'T00:00:00');
  const days = Math.floor((exp.getTime() - today.getTime()) / 86400000);
  if (days < 0) return 'vencido';
  if (days <= 30) return 'por_vencer';
  return 'apto';
};

export const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
