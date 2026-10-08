import { useEffect, useMemo, useState } from 'react';
import { CheckCheck, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, SampleDataNotice, StatusChip } from '@/components/domain';
import { useClubModel, fmtDate } from '@/demo/selectors';
import { clubStore } from '@/demo/store';
import { cn } from '@/lib/utils';

const Attendance = () => {
  const { data, rows, attendanceByCategory } = useClubModel();
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id ?? '');

  const sessions = useMemo(
    () => data.attendance.filter((s) => s.categoryId === categoryId).sort((a, b) => b.date.localeCompare(a.date)),
    [data.attendance, categoryId],
  );
  // Sesión por defecto: la más reciente que ya ocurrió y no tiene lista; si no, la última tomada.
  const todayIso = new Date().toISOString().split('T')[0];
  const defaultSession = sessions.find((s) => s.date <= todayIso && !s.taken) ?? sessions.find((s) => s.date <= todayIso) ?? sessions[0];
  const [sessionId, setSessionId] = useState<string | undefined>(defaultSession?.id);

  useEffect(() => setSessionId(defaultSession?.id), [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const session = sessions.find((s) => s.id === sessionId) ?? defaultSession;
  const players = rows.filter((r) => r.categoryId === categoryId);
  const presentCount = session ? session.presentIds.length : 0;
  const pct = attendanceByCategory.find((a) => a.category.id === categoryId)?.pct ?? 0;

  return (
    <div>
      <SampleDataNotice />
      <PageHeader title="Asistencia" description="Tomá lista en segundos: tocá a cada presente" />

      <div className="mb-3 flex flex-wrap items-center gap-2" data-tour="attendance-controls">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full sm:w-52" aria-label="Categoría"><SelectValue /></SelectTrigger>
          <SelectContent>{data.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        {session && (
          <Select value={session.id} onValueChange={setSessionId}>
            <SelectTrigger className="w-full sm:w-52" aria-label="Sesión"><SelectValue /></SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>{fmtDate(s.date)} {s.taken ? '· con lista' : s.date > todayIso ? '· próxima' : '· sin lista'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <StatusChip tone={pct >= 70 ? 'success' : 'danger'}>Promedio {pct}%</StatusChip>
        {session && (
          <Button className="ml-auto" variant="outline" onClick={() => { clubStore.markAllPresent(session.id, categoryId); toast.success('Todos marcados como presentes'); }}>
            <CheckCheck className="h-4 w-4 mr-1.5" />Todos presentes
          </Button>
        )}
      </div>

      {!session ? (
        <p className="text-sm text-muted-foreground">No hay sesiones para esta categoría.</p>
      ) : (
        <section aria-label="Planilla de asistencia">
          <p className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground" role="status" aria-live="polite">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            <span className="tabular">{presentCount} de {players.length} presentes</span>
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((p) => {
              const present = session.presentIds.includes(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-pressed={present}
                    onClick={() => clubStore.setAttendance(session.id, p.id, !present)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors',
                      present ? 'border-success/40 bg-success-soft' : 'border-border bg-card hover:bg-muted',
                    )}
                  >
                    <span className="font-medium">{p.fullName}</span>
                    <span className={cn('text-xs font-medium', present ? 'text-success' : 'text-muted-foreground')}>{present ? 'Presente' : session.taken ? 'Ausente' : 'Tocar'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Attendance;
