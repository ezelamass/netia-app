/**
 * Store en memoria del club (datos de ejemplo). Se persiste en sessionStorage,
 * así que las escrituras sobreviven a la navegación y se descartan al cerrar la pestaña.
 */
import { useSyncExternalStore } from 'react';
import type {
  Announcement, AttendanceSession, ClubDataset, Fee, Member, MedicalRecord,
} from '@/types/club';
import { currentPeriod } from '@/types/club';
import { buildClubDataset } from './dataset';

const KEY = 'netia_demo_club_v1';

const load = (): ClubDataset => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* sin storage */ }
  return buildClubDataset();
};

let data: ClubDataset = load();
const listeners = new Set<() => void>();

const commit = (next: ClubDataset) => {
  data = next;
  try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sin storage */ }
  listeners.forEach((l) => l());
};

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export const clubStore = {
  get: () => data,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
  reset: () => {
    try { sessionStorage.removeItem(KEY); } catch { /* sin storage */ }
    commit(buildClubDataset());
  },

  registerPayment: (feeId: string, method: Fee['method'] = 'efectivo') =>
    commit({
      ...data,
      fees: data.fees.map((f) =>
        f.id === feeId ? { ...f, status: 'al_dia', paidAt: new Date().toISOString().split('T')[0], method } : f,
      ),
    }),

  /** Envía recordatorio de cuota: crea un aviso real en Comunicación. */
  sendFeeReminder: (memberIds: string[]) => {
    const names = data.members.filter((m) => memberIds.includes(m.id)).map((m) => m.firstName);
    return clubStore.sendAnnouncement({
      title: `Recordatorio de cuota (${names.length} ${names.length === 1 ? 'socio' : 'socios'})`,
      body: 'Hola, te recordamos que la cuota del mes está pendiente. Podés abonarla por transferencia, Mercado Pago o en secretaría. ¡Gracias!',
      audience: [...new Set(data.members.filter((m) => memberIds.includes(m.id)).map((m) => m.categoryId))],
      channel: 'whatsapp',
      template: 'cuota',
    });
  },

  sendAnnouncement: (a: Pick<Announcement, 'title' | 'body' | 'audience' | 'channel'> & { template?: string }) => {
    const ann: Announcement = { ...a, id: uid('an'), status: 'enviado', sentAt: new Date().toISOString() };
    commit({ ...data, announcements: [ann, ...data.announcements] });
    return ann;
  },

  saveDraft: (a: Pick<Announcement, 'title' | 'body' | 'audience' | 'channel'>) =>
    commit({ ...data, announcements: [{ ...a, id: uid('an'), status: 'borrador' }, ...data.announcements] }),

  /** Marca/desmarca presente. Si la sesión no estaba tomada, queda tomada. */
  setAttendance: (sessionId: string, memberId: string, present: boolean) =>
    commit({
      ...data,
      attendance: data.attendance.map((s) =>
        s.id !== sessionId
          ? s
          : {
              ...s,
              taken: true,
              presentIds: present ? [...new Set([...s.presentIds, memberId])] : s.presentIds.filter((i) => i !== memberId),
            },
      ),
    }),

  markAllPresent: (sessionId: string, categoryId: string) =>
    commit({
      ...data,
      attendance: data.attendance.map((s) =>
        s.id === sessionId
          ? { ...s, taken: true, presentIds: data.members.filter((m) => m.categoryId === categoryId).map((m) => m.id) }
          : s,
      ),
    }),

  inviteMember: (m: Pick<Member, 'firstName' | 'lastName' | 'categoryId' | 'guardianName' | 'email'> & Partial<Member>) => {
    const cat = data.categories.find((c) => c.id === m.categoryId);
    const member: Member = {
      dni: '', birthDate: '2015-01-01', guardianPhone: '', status: 'activo', hasDniCopy: false, hasAuthorization: false,
      notes: [], joinedAt: new Date().toISOString().split('T')[0], ...m, id: uid('m'),
    };
    const period = currentPeriod();
    const fee: Fee = {
      id: `f-${member.id}-${period}`, memberId: member.id, period, amount: cat?.monthlyFee ?? 0,
      dueDate: new Date().toISOString().split('T')[0], status: 'pendiente',
    };
    commit({ ...data, members: [member, ...data.members], fees: [...data.fees, fee], medical: [...data.medical, { memberId: member.id }] });
    return member;
  },

  approveRequest: (requestId: string) => {
    const r = data.requests.find((x) => x.id === requestId);
    if (!r) return;
    const [firstName, ...rest] = r.name.split(' ');
    clubStore.inviteMember({ firstName, lastName: rest.join(' ') || '-', categoryId: r.categoryId, guardianName: '', email: '' });
    commit({ ...data, requests: data.requests.filter((x) => x.id !== requestId) });
  },

  updateMedical: (rec: MedicalRecord) =>
    commit({ ...data, medical: data.medical.map((r) => (r.memberId === rec.memberId ? rec : r)) }),

  addNote: (memberId: string, author: string, text: string) =>
    commit({
      ...data,
      members: data.members.map((m) =>
        m.id === memberId
          ? { ...m, notes: [{ id: uid('n'), date: new Date().toISOString().split('T')[0], author, text }, ...m.notes] }
          : m,
      ),
    }),

  addCategory: (c: { name: string; sport: ClubDataset['categories'][number]['sport']; coachId: string; schedule: string; monthlyFee: number }) => {
    const coach = data.coaches.find((x) => x.id === c.coachId);
    commit({ ...data, categories: [...data.categories, { ...c, id: uid('cat'), coachName: coach?.name ?? '' }] });
  },

  assignMemberCategory: (memberId: string, categoryId: string) =>
    commit({ ...data, members: data.members.map((m) => (m.id === memberId ? { ...m, categoryId } : m)) }),
};

export const useClubData = (): ClubDataset => useSyncExternalStore(clubStore.subscribe, clubStore.get);
