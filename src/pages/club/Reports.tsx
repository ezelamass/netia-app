import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { KpiCard, PageHeader, SampleDataNotice } from '@/components/domain';
import { useClubModel, longMonthLabel, monthLabel } from '@/demo/selectors';
import { downloadCsv } from '@/lib/csv';
import { formatARS } from '@/types/club';

const Reports = () => {
  const { rows, data, kpis, money, period, collection, attendanceByCategory } = useClubModel();

  const reports = [
    {
      key: 'socios', title: 'Padrón de socios', description: `${rows.length} socios con categoría, cuota y apto.`,
      run: () => downloadCsv('padron-socios.csv', ['Socio', 'DNI', 'Categoría', 'Responsable', 'Teléfono', 'Email', 'Cuota', 'Apto'],
        rows.map((r) => [r.fullName, r.dni, r.categoryName, r.guardianName, r.guardianPhone, r.email, r.feeStatus, r.medicalStatus])),
    },
    {
      key: 'morosidad', title: 'Morosidad', description: `${kpis.overdue} cuotas vencidas por ${formatARS(money.overdue)}.`,
      run: () => downloadCsv(`morosidad-${period}.csv`, ['Socio', 'Categoría', 'Responsable', 'Teléfono', 'Monto', 'Vencía'],
        rows.filter((r) => r.feeStatus === 'vencida').map((r) => [r.fullName, r.categoryName, r.guardianName, r.guardianPhone, r.currentFee?.amount, r.currentFee?.dueDate])),
    },
    {
      key: 'asistencia', title: 'Asistencia por categoría', description: `Promedio general ${kpis.avgAttendance}% en las últimas 4 semanas.`,
      run: () => downloadCsv('asistencia.csv', ['Categoría', 'Entrenador', 'Asistencia %'], attendanceByCategory.map((a) => [a.category.name, a.category.coachName, a.pct])),
    },
    {
      key: 'aptos', title: 'Aptos médicos', description: `${kpis.medExpired} vencidos, ${kpis.medSoon} por vencer, ${kpis.medNone} sin apto.`,
      run: () => downloadCsv('aptos-medicos.csv', ['Socio', 'Categoría', 'Estado', 'Vence'],
        rows.filter((r) => r.medicalStatus !== 'apto').map((r) => [r.fullName, r.categoryName, r.medicalStatus, r.medicalExpiresAt ?? ''])),
    },
  ];

  return (
    <div>
      <SampleDataNotice />
      <PageHeader
        title="Informes"
        description={`${data.club.name} · ${longMonthLabel(period)}`}
        actions={<Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" />Imprimir / PDF</Button>}
      />

      <div className="hidden print:block mb-4">
        <h2 className="text-lg font-bold">{data.club.name}</h2>
        <p className="text-sm">Informe generado el {new Date().toLocaleDateString('es-AR')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Socios activos" value={kpis.activeMembers} />
        <KpiCard label="Cobrado este mes" value={formatARS(money.collected)} tone="success" />
        <KpiCard label="En mora" value={formatARS(money.overdue)} tone="danger" />
        <KpiCard label="Asistencia promedio" value={`${kpis.avgAttendance}%`} />
      </div>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Descargas" data-tour="reports">
        {reports.map((r) => (
          <article key={r.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-card no-print">
            <div className="min-w-0">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </div>
            <Button size="sm" onClick={() => { r.run(); toast.success(`${r.title} descargado`); }}><Download className="h-4 w-4 mr-1.5" />CSV</Button>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-card" aria-label="Cobranza mensual">
        <h2 className="font-semibold">Cobranza mensual</h2>
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">Cobranza de los últimos 6 meses</caption>
          <thead><tr className="text-left text-muted-foreground"><th className="py-1.5 font-medium">Mes</th><th className="py-1.5 text-right font-medium">Cobrado</th><th className="py-1.5 text-right font-medium">Total</th><th className="py-1.5 text-right font-medium">%</th></tr></thead>
          <tbody>
            {collection.map((c) => (
              <tr key={c.period} className="border-t border-border tabular">
                <td className="py-1.5 capitalize">{monthLabel(c.period)}</td>
                <td className="py-1.5 text-right">{formatARS(c.collected)}</td>
                <td className="py-1.5 text-right">{formatARS(c.total)}</td>
                <td className="py-1.5 text-right font-medium">{c.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Reports;
