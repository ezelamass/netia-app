import { useMemo } from 'react';
import { useClubData } from './store';
import type { Fee, Member, MedicalStatus } from '@/types/club';
import { currentPeriod, medicalStatusOf, memberFullName } from '@/types/club';

export interface MemberRow extends Member {
  fullName: string;
  categoryName: string;
  sport: string;
  currentFee?: Fee;
  feeStatus: Fee['status'];
  medicalStatus: MedicalStatus;
  medicalExpiresAt?: string;
  attendancePct: number | null;
}

/** Vista enriquecida de socios + KPIs del club, derivada del store. */
export const useClubModel = () => {
  const data = useClubData();

  return useMemo(() => {
    const period = currentPeriod();
    const catById = new Map(data.categories.map((c) => [c.id, c]));
    const feeByMember = new Map(data.fees.filter((f) => f.period === period).map((f) => [f.memberId, f]));
    const medByMember = new Map(data.medical.map((r) => [r.memberId, r]));

    const takenSessions = data.attendance.filter((s) => s.taken);
    const presences = new Map<string, { p: number; t: number }>();
    for (const s of takenSessions) {
      for (const m of data.members) {
        if (m.categoryId !== s.categoryId) continue;
        const e = presences.get(m.id) ?? { p: 0, t: 0 };
        e.t += 1;
        if (s.presentIds.includes(m.id)) e.p += 1;
        presences.set(m.id, e);
      }
    }

    const rows: MemberRow[] = data.members.map((m) => {
      const cat = catById.get(m.categoryId);
      const fee = feeByMember.get(m.id);
      const rec = medByMember.get(m.id);
      const att = presences.get(m.id);
      return {
        ...m,
        fullName: memberFullName(m),
        categoryName: cat?.name ?? '—',
        sport: cat?.sport ?? '',
        currentFee: fee,
        feeStatus: fee?.status ?? 'pendiente',
        medicalStatus: medicalStatusOf(rec),
        medicalExpiresAt: rec?.expiresAt,
        attendancePct: att && att.t > 0 ? Math.round((att.p / att.t) * 100) : null,
      };
    });

    const active = rows.filter((r) => r.status === 'activo');
    const count = (f: (r: MemberRow) => boolean) => active.filter(f).length;
    const paid = count((r) => r.feeStatus === 'al_dia');
    const overdue = count((r) => r.feeStatus === 'vencida');
    const pending = count((r) => r.feeStatus === 'pendiente');
    const medExpired = count((r) => r.medicalStatus === 'vencido');
    const medSoon = count((r) => r.medicalStatus === 'por_vencer');
    const medNone = count((r) => r.medicalStatus === 'sin_apto');

    // Cobranza por mes (últimos 6)
    const periods = [...new Set(data.fees.map((f) => f.period))].sort().slice(-6);
    const collection = periods.map((p) => {
      const fs = data.fees.filter((f) => f.period === p);
      const paidAmount = fs.filter((f) => f.status === 'al_dia').reduce((t, f) => t + f.amount, 0);
      const total = fs.reduce((t, f) => t + f.amount, 0);
      return { period: p, pct: total ? Math.round((paidAmount / total) * 100) : 0, collected: paidAmount, total };
    });

    const curFees = data.fees.filter((f) => f.period === period);
    const money = {
      collected: curFees.filter((f) => f.status === 'al_dia').reduce((t, f) => t + f.amount, 0),
      pending: curFees.filter((f) => f.status === 'pendiente').reduce((t, f) => t + f.amount, 0),
      overdue: curFees.filter((f) => f.status === 'vencida').reduce((t, f) => t + f.amount, 0),
    };

    // Asistencia semanal: sesiones tomadas en los últimos 7 días
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = takenSessions.filter((s) => new Date(s.date) >= weekAgo);
    const catSize = (id: string) => data.members.filter((m) => m.categoryId === id).length;
    const weeklyAttendance = weekSessions.length
      ? Math.round((weekSessions.reduce((t, s) => t + s.presentIds.length / Math.max(1, catSize(s.categoryId)), 0) / weekSessions.length) * 100)
      : 0;

    const attendanceByCategory = data.categories.map((c) => {
      const ss = takenSessions.filter((s) => s.categoryId === c.id);
      const pct = ss.length ? Math.round((ss.reduce((t, s) => t + s.presentIds.length / Math.max(1, catSize(c.id)), 0) / ss.length) * 100) : 0;
      return { category: c, pct };
    });
    const avgAttendance = attendanceByCategory.length
      ? Math.round(attendanceByCategory.reduce((t, a) => t + a.pct, 0) / attendanceByCategory.length)
      : 0;

    return {
      data, rows, period, active,
      kpis: {
        activeMembers: active.length,
        paidPct: active.length ? Math.round((paid / active.length) * 100) : 0,
        paid, pending, overdue, medExpired, medSoon, medNone, weeklyAttendance, avgAttendance,
      },
      money, collection, attendanceByCategory,
    };
  }, [data]);
};

export const monthLabel = (period: string) =>
  new Date(`${period}-01T12:00:00`).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '');

export const longMonthLabel = (period: string) =>
  new Date(`${period}-01T12:00:00`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).replace('.', '') : '—';

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '');
