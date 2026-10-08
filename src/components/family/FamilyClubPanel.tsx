import { Link } from 'react-router-dom';
import { CalendarDays, Megaphone } from 'lucide-react';
import { FeeChip, MedicalChip } from '@/components/domain';
import { useClubModel, fmtDate, fmtDateTime } from '@/demo/selectors';
import { formatARS } from '@/types/club';

/** Vista de familia sobre los datos del club (cuota, apto, partidos, avisos) del hijo/a. */
export const FamilyClubPanel = () => {
  const { data, rows } = useClubModel();
  const child = rows.find((r) => r.id === data.familyChildId);
  if (!child) return null;
  const next = data.fixtures
    .filter((f) => f.categoryId === child.categoryId && new Date(f.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const notices = data.announcements
    .filter((a) => a.status === 'enviado' && (a.audience === 'todos' || a.audience.includes(child.categoryId)))
    .slice(0, 3);

  return (
    <div className="space-y-4" data-tour="family-panel">
      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <p className="text-sm text-muted-foreground">Tu hijo/a</p>
        <h2 className="text-lg font-semibold">{child.fullName}</h2>
        <p className="text-sm text-muted-foreground">{child.categoryName} · {data.club.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Cuota del mes</p>
          <p className="mt-1 text-xl font-bold font-heading tabular">{child.currentFee ? formatARS(child.currentFee.amount) : '—'}</p>
          <div className="mt-2"><FeeChip status={child.feeStatus} /></div>
          {child.currentFee && child.feeStatus !== 'al_dia' && <p className="mt-1 text-xs text-muted-foreground">Vence {fmtDate(child.currentFee.dueDate)}</p>}
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Apto médico</p>
          <p className="mt-1 text-xl font-bold font-heading">{fmtDate(child.medicalExpiresAt)}</p>
          <div className="mt-2"><MedicalChip status={child.medicalStatus} /></div>
        </div>
      </div>

      {next && (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
          <CalendarDays className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">Próximo partido vs. {next.rival}</p>
            <p className="text-sm text-muted-foreground">{fmtDateTime(next.date)} · {next.venue}</p>
          </div>
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-4 shadow-card" aria-label="Avisos del club">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Avisos del club</h2>
          <Link to="/parent/announcements" className="text-sm text-primary hover:underline">Ver todos</Link>
        </div>
        <ul className="mt-2 divide-y divide-border">
          {notices.map((a) => (
            <li key={a.id} className="flex items-start gap-3 py-2.5">
              <Megaphone className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(a.sentAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

