import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable, EmptyPanel, KpiCard, MedicalChip, PageHeader, SampleDataNotice, type Column } from '@/components/domain';
import { useClubModel, fmtDate, type MemberRow } from '@/demo/selectors';
import { clubStore } from '@/demo/store';
import { downloadCsv } from '@/lib/csv';
import { Download } from 'lucide-react';

type Tab = 'vencido' | 'por_vencer' | 'sin_apto' | 'apto';
const TABS: { key: Tab; label: string }[] = [
  { key: 'vencido', label: 'Vencidos' },
  { key: 'por_vencer', label: 'Por vencer (30 días)' },
  { key: 'sin_apto', label: 'Sin apto' },
  { key: 'apto', label: 'Vigentes' },
];

const daysTo = (iso?: string) => (iso ? Math.floor((new Date(`${iso}T12:00:00`).getTime() - Date.now()) / 86400000) : null);

const Medical = () => {
  const { rows, kpis } = useClubModel();
  const [tab, setTab] = useState<Tab>('vencido');
  const list = useMemo(
    () => rows.filter((r) => r.medicalStatus === tab).sort((a, b) => (a.medicalExpiresAt ?? '').localeCompare(b.medicalExpiresAt ?? '')),
    [rows, tab],
  );

  const columns: Column<MemberRow>[] = [
    { key: 'name', header: 'Socio', cell: (r) => <span className="font-medium">{r.fullName}</span>, sortValue: (r) => r.fullName },
    { key: 'cat', header: 'Categoría', cell: (r) => r.categoryName, sortValue: (r) => r.categoryName },
    { key: 'exp', header: 'Vence', cell: (r) => fmtDate(r.medicalExpiresAt), sortValue: (r) => r.medicalExpiresAt ?? '' },
    {
      key: 'days', header: 'Días', align: 'right', hideOnMobile: true,
      cell: (r) => { const d = daysTo(r.medicalExpiresAt); return d === null ? '—' : d < 0 ? `hace ${-d}` : `en ${d}`; },
    },
    { key: 'status', header: 'Estado', cell: (r) => <MedicalChip status={r.medicalStatus} /> },
    {
      key: 'docs', header: 'Documentación', hideOnMobile: true,
      cell: (r) => (!r.hasDniCopy || !r.hasAuthorization ? <span className="text-xs text-warning">{[!r.hasDniCopy && 'DNI', !r.hasAuthorization && 'autorización'].filter(Boolean).join(' y ')} pendiente</span> : <span className="text-xs text-muted-foreground">Completa</span>),
    },
  ];

  const remind = () => {
    const ids = list.map((r) => r.id);
    clubStore.sendAnnouncement({
      title: `Recordatorio de apto médico (${ids.length})`,
      body: 'Tu apto médico está vencido o próximo a vencer. Traelo a secretaría para poder seguir participando de partidos.',
      audience: [...new Set(list.map((r) => r.categoryId))],
      channel: 'whatsapp',
      template: 'apto',
    });
    toast.success(`Recordatorio enviado a ${ids.length} familias`);
  };

  return (
    <div>
      <SampleDataNotice />
      <PageHeader
        title="Aptos médicos y documentación"
        description="Semáforo de vencimientos para que nadie juegue sin apto vigente"
        actions={
          <>
            <Button variant="outline" onClick={() => { downloadCsv('aptos.csv', ['Socio', 'Categoría', 'Estado', 'Vence'], list.map((r) => [r.fullName, r.categoryName, r.medicalStatus, r.medicalExpiresAt ?? ''])); toast.success('Aptos exportados'); }}><Download className="h-4 w-4 mr-1.5" />Exportar CSV</Button>
            <Button onClick={remind} disabled={list.length === 0 || tab === 'apto'}><Send className="h-4 w-4 mr-1.5" />Avisar a las familias</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4" data-tour="medical-kpis">
        <KpiCard label="Vencidos" value={kpis.medExpired} tone="danger" onClick={() => setTab('vencido')} />
        <KpiCard label="Por vencer en 30 días" value={kpis.medSoon} tone="warning" onClick={() => setTab('por_vencer')} />
        <KpiCard label="Sin apto cargado" value={kpis.medNone} onClick={() => setTab('sin_apto')} />
        <KpiCard label="Vigentes" value={kpis.activeMembers - kpis.medExpired - kpis.medSoon - kpis.medNone} tone="success" onClick={() => setTab('apto')} />
      </div>

      <div role="tablist" aria-label="Estado de apto" className="mb-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1.5 text-sm ${tab === t.key ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable
        rows={list}
        columns={columns}
        rowKey={(r) => r.id}
        caption="Aptos médicos"
        empty={<EmptyPanel icon={Stethoscope} title="Nada para mostrar acá" description="No hay socios en este estado." />}
      />
      <p className="mt-3 text-xs text-muted-foreground">Para cargar un apto nuevo abrí la ficha del socio en <Link className="text-primary hover:underline" to="/club/members">Socios</Link>.</p>
    </div>
  );
};

export default Medical;
