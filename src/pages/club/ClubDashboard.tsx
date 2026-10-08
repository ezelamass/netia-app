import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { CalendarDays, ClipboardCheck, HeartPulse, Send, Users, Wallet, UserPlus, Stethoscope, Megaphone, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { KpiCard, PageHeader, StatusChip, SampleDataNotice } from '@/components/domain';
import { RiskBadge } from '@/components/club/management/RiskBadge';
import { useClubModel, monthLabel, fmtDateTime, fmtDate } from '@/demo/selectors';
import { clubStore } from '@/demo/store';
import { useDemo } from '@/contexts/DemoContext';
import { formatARS } from '@/types/club';
import { cn } from '@/lib/utils';

const ClubDashboard = () => {
  const { data, rows, kpis, money, collection } = useClubModel();
  const { scenario } = useDemo();
  const navigate = useNavigate();

  const overdueRows = useMemo(() => rows.filter((r) => r.feeStatus === 'vencida'), [rows]);
  const upcoming = useMemo(
    () => data.fixtures.filter((f) => new Date(f.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4),
    [data.fixtures],
  );
  const redRisk = data.risk.filter((r) => r.level === 'rojo');
  const yellowRisk = data.risk.filter((r) => r.level === 'amarillo').length;
  const greenRisk = data.risk.filter((r) => r.level === 'verde').length;
  const catName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? '';
  const memberName = (id: string) => rows.find((r) => r.id === id)?.fullName ?? '';

  const sendReminders = () => {
    clubStore.sendFeeReminder(overdueRows.map((r) => r.id));
    toast.success(`Recordatorio enviado a ${overdueRows.length} familias`, { description: 'Quedó registrado en Comunicación.' });
  };

  const attention = [
    {
      key: 'cuotas', visible: overdueRows.length > 0, icon: Wallet, tone: 'danger' as const,
      title: `${overdueRows.length} cuotas vencidas`, detail: `${formatARS(money.overdue)} sin cobrar este mes`,
      action: <Button size="sm" onClick={sendReminders} data-tour="send-reminders"><Send className="h-4 w-4 mr-1.5" />Enviar recordatorio a todos</Button>,
      secondary: <Button size="sm" variant="ghost" asChild><Link to="/club/fees?estado=vencida">Ver detalle</Link></Button>,
    },
    {
      key: 'aptos', visible: kpis.medExpired + kpis.medSoon > 0, icon: Stethoscope, tone: 'warning' as const,
      title: `${kpis.medExpired} aptos vencidos y ${kpis.medSoon} por vencer`, detail: 'Sin apto vigente no pueden jugar partidos',
      action: <Button size="sm" variant="outline" asChild><Link to="/club/medical">Ver semáforo de aptos</Link></Button>,
    },
    {
      key: 'solicitudes', visible: data.requests.length > 0, icon: UserPlus, tone: 'info' as const,
      title: `${data.requests.length} solicitudes de inscripción`, detail: data.requests.map((r) => r.name).slice(0, 3).join(', ') + (data.requests.length > 3 ? '…' : ''),
      action: (
        <Button size="sm" variant="outline" onClick={() => { data.requests.forEach((r) => clubStore.approveRequest(r.id)); toast.success('Socios dados de alta con cuota del mes generada'); }}>
          <Check className="h-4 w-4 mr-1.5" />Aprobar todas
        </Button>
      ),
    },
  ].filter((a) => a.visible);
  if (scenario === 'aptos') attention.sort((a, b) => (a.key === 'aptos' ? -1 : b.key === 'aptos' ? 1 : 0));
  if (scenario === 'morosidad') attention.sort((a, b) => (a.key === 'cuotas' ? -1 : b.key === 'cuotas' ? 1 : 0));

  const maxPct = 100;

  return (
    <div>
      <SampleDataNotice />
      <PageHeader
        title="Inicio"
        description={`${data.club.name} · ${data.club.city}`}
        actions={<Button variant="outline" asChild><Link to="/club/reports">Ver informes</Link></Button>}
      />

      <section aria-label="Indicadores" data-tour="kpis" className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Socios activos" value={kpis.activeMembers} icon={Users} delta={4} deltaSuffix=" nuevos" trend={[168, 171, 174, 178, 182, kpis.activeMembers]} onClick={() => navigate('/club/members')} />
        <KpiCard label="Cuotas al día" value={`${kpis.paidPct}%`} icon={Wallet} tone={kpis.paidPct >= 80 ? 'success' : 'warning'} delta={collection.length > 1 ? Math.round(kpis.paidPct - collection[collection.length - 2].pct) : undefined} deltaSuffix=" pts" trend={collection.map((c) => c.pct)} onClick={() => navigate('/club/fees')} />
        <KpiCard label="Cuotas vencidas" value={kpis.overdue} icon={Wallet} tone={kpis.overdue ? 'danger' : 'default'} onClick={() => navigate('/club/fees?estado=vencida')} />
        <KpiCard label="Aptos vencidos / por vencer" value={`${kpis.medExpired} / ${kpis.medSoon}`} icon={HeartPulse} tone={kpis.medExpired ? 'warning' : 'default'} onClick={() => navigate('/club/medical')} />
        <KpiCard label="Asistencia semanal" value={`${kpis.weeklyAttendance}%`} icon={ClipboardCheck} onClick={() => navigate('/club/attendance')} />
      </section>

      <section aria-label="Requiere tu atención" className="mt-5" data-tour="attention">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Requiere tu atención</h2>
        {attention.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Todo al día. No hay nada urgente.</div>
        ) : (
          <ul className="space-y-2">
            {attention.map((a, i) => (
              <li
                key={a.key}
                className={cn(
                  'flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-card sm:flex-row sm:items-center sm:justify-between',
                  i === 0 && (scenario === 'morosidad' || scenario === 'aptos') ? 'border-primary ring-1 ring-primary/30' : 'border-border',
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className={cn('mt-0.5 rounded-md p-1.5', a.tone === 'danger' ? 'bg-danger-soft text-danger' : a.tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-info-soft text-info')}>
                    <a.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{a.detail}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">{a.action}{'secondary' in a ? a.secondary : null}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-card p-4 shadow-card lg:col-span-2" aria-label="Cobranza">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Cobranza de los últimos 6 meses</h2>
            <span className="text-sm text-muted-foreground tabular">{formatARS(money.collected)} cobrados este mes</span>
          </div>
          <div className="mt-4 flex h-40 items-end gap-3" role="img" aria-label={`Cobranza por mes: ${collection.map((c) => `${monthLabel(c.period)} ${c.pct}%`).join(', ')}`}>
            {collection.map((c, i) => (
              <div key={c.period} className="flex h-full flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium tabular">{c.pct}%</span>
                <div className="relative w-full flex-1">
                  <div
                    className={cn('absolute bottom-0 w-full rounded-t-md', i === collection.length - 1 ? 'bg-primary' : 'bg-primary/30')}
                    style={{ height: `${(c.pct / maxPct) * 100}%` }}
                  />
                </div>
                <span className="text-xs capitalize text-muted-foreground">{monthLabel(c.period)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-card" aria-label="Semáforo de riesgo" data-tour="risk">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Semáforo del plantel</h2>
            <Link to="/club/training-load" className="text-sm text-primary hover:underline">Ver todo</Link>
          </div>
          <div className="mt-3 flex gap-2">
            <StatusChip tone="danger">{redRisk.length} en rojo</StatusChip>
            <StatusChip tone="warning">{yellowRisk} atención</StatusChip>
            <StatusChip tone="success">{greenRisk} bien</StatusChip>
          </div>
          <ul className="mt-3 space-y-2">
            {redRisk.map((r) => (
              <li key={r.memberId} className="flex items-center justify-between text-sm">
                <span className="truncate">{memberName(r.memberId)}</span>
                <RiskBadge level="rojo" />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Cruza carga, dolor y sueño que reportan los deportistas con la app.</p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4 shadow-card" aria-label="Próximos eventos">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Próximos partidos y eventos</h2>
            <Link to="/club/fixtures" className="text-sm text-primary hover:underline">Calendario</Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {upcoming.map((f) => (
              <li key={f.id} className="flex items-start gap-3 py-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{f.kind === 'torneo' ? f.rival : `${catName(f.categoryId)} vs. ${f.rival}`}</p>
                  <p className="text-xs text-muted-foreground">{fmtDateTime(f.date)} · {f.home ? 'Local' : 'Visitante'}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-card" aria-label="Actividad reciente">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Actividad reciente</h2>
            <Link to="/club/communication" className="text-sm text-primary hover:underline">Comunicación</Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {data.announcements.filter((a) => a.status === 'enviado').slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-2.5">
                <Megaphone className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">Enviado el {fmtDate(a.sentAt)} · {a.audience === 'todos' ? 'Todo el club' : `${a.audience.length} categoría(s)`}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ClubDashboard;
