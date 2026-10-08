import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Send, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, EmptyPanel, FeeChip, FilterBar, KpiCard, PageHeader, SampleDataNotice, type Column } from '@/components/domain';
import { useClubModel, fmtDate, longMonthLabel, type MemberRow } from '@/demo/selectors';
import { clubStore } from '@/demo/store';
import { downloadCsv } from '@/lib/csv';
import { formatARS } from '@/types/club';

const ALL = 'todos';

const Fees = () => {
  const { rows, money, kpis, period, data } = useClubModel();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const status = params.get('estado') ?? ALL;
  const category = params.get('categoria') ?? ALL;

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v === ALL) next.delete(k); else next.set(k, v);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) => (!q || r.fullName.toLowerCase().includes(q)) && (status === ALL || r.feeStatus === status) && (category === ALL || r.categoryId === category),
    );
  }, [rows, search, status, category]);

  const overdueIds = rows.filter((r) => r.feeStatus === 'vencida').map((r) => r.id);

  const columns: Column<MemberRow>[] = [
    { key: 'name', header: 'Socio', cell: (r) => <span className="font-medium">{r.fullName}</span>, sortValue: (r) => r.fullName },
    { key: 'cat', header: 'Categoría', cell: (r) => r.categoryName, sortValue: (r) => r.categoryName },
    { key: 'amount', header: 'Monto', align: 'right', cell: (r) => (r.currentFee ? formatARS(r.currentFee.amount) : '—'), sortValue: (r) => r.currentFee?.amount ?? 0 },
    { key: 'due', header: 'Vence', cell: (r) => fmtDate(r.currentFee?.dueDate), sortValue: (r) => r.currentFee?.dueDate ?? '', hideOnMobile: true },
    { key: 'status', header: 'Estado', cell: (r) => <FeeChip status={r.feeStatus} />, sortValue: (r) => r.feeStatus },
    {
      key: 'action', header: '', align: 'right',
      cell: (r) =>
        r.currentFee && r.feeStatus !== 'al_dia' ? (
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); clubStore.registerPayment(r.currentFee!.id); toast.success(`Pago de ${r.firstName} registrado`); }}>
            Registrar pago
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">{r.currentFee?.method?.replace('_', ' ')}</span>
        ),
    },
  ];

  const exportCsv = () => {
    downloadCsv(`cuotas-${period}.csv`, ['Socio', 'Categoría', 'Monto', 'Vence', 'Estado', 'Pagada el', 'Medio'],
      filtered.map((r) => [r.fullName, r.categoryName, r.currentFee?.amount ?? '', r.currentFee?.dueDate ?? '', r.feeStatus, r.currentFee?.paidAt ?? '', r.currentFee?.method ?? '']));
    toast.success('Cuotas exportadas');
  };

  return (
    <div>
      <SampleDataNotice />
      <PageHeader
        title="Cuotas y pagos"
        description={longMonthLabel(period)}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" />Exportar CSV</Button>
            <Button
              disabled={overdueIds.length === 0}
              onClick={() => { clubStore.sendFeeReminder(overdueIds); toast.success(`Recordatorio enviado a ${overdueIds.length} familias`); }}
            >
              <Send className="h-4 w-4 mr-1.5" />Recordar a morosos ({overdueIds.length})
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Cobrado" value={formatARS(money.collected)} tone="success" icon={Wallet} />
        <KpiCard label="Pendiente" value={formatARS(money.pending)} tone="warning" />
        <KpiCard label="En mora" value={formatARS(money.overdue)} tone="danger" />
        <KpiCard label="Cuotas al día" value={`${kpis.paidPct}%`} />
      </div>

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar socio">
        <Select value={status} onValueChange={(v) => setParam('estado', v)}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Estado"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            <SelectItem value="al_dia">Al día</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setParam('categoria', v)}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Categoría"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las categorías</SelectItem>
            {data.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        caption="Cuotas del mes por socio"
        bulkActions={(ids) => (
          <Button size="sm" variant="outline" onClick={() => { clubStore.sendFeeReminder(ids); toast.success(`Recordatorio enviado a ${ids.length} familias`); setSelected([]); }}>
            <Send className="h-4 w-4 mr-1.5" />Enviar recordatorio
          </Button>
        )}
        empty={<EmptyPanel icon={Wallet} title="Sin resultados" description="No hay cuotas con esos filtros." />}
      />
    </div>
  );
};

export default Fees;
