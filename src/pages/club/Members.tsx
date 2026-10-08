import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Users, Send, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, EmptyPanel, FeeChip, FilterBar, MedicalChip, PageHeader, SampleDataNotice, type Column } from '@/components/domain';
import { MemberDetailSheet } from '@/components/club/management/MemberDetailSheet';
import { InviteMemberDialog } from '@/components/club/management/InviteMemberDialog';
import { useClubModel, type MemberRow } from '@/demo/selectors';
import { clubStore } from '@/demo/store';
import { downloadCsv } from '@/lib/csv';

const ALL = 'todos';

const Members = () => {
  const { rows, data } = useClubModel();
  const [search, setSearch] = useState('');
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get('categoria') ?? ALL);
  const [sport, setSport] = useState(ALL);
  const [fee, setFee] = useState(ALL);
  const [medical, setMedical] = useState(ALL);
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!q || r.fullName.toLowerCase().includes(q) || r.dni.includes(q)) &&
        (category === ALL || r.categoryId === category) &&
        (sport === ALL || r.sport === sport) &&
        (fee === ALL || r.feeStatus === fee) &&
        (medical === ALL || r.medicalStatus === medical),
    );
  }, [rows, search, category, sport, fee, medical]);

  const columns: Column<MemberRow>[] = [
    { key: 'name', header: 'Socio', cell: (r) => <span className="font-medium">{r.fullName}</span>, sortValue: (r) => r.fullName },
    { key: 'cat', header: 'Categoría', cell: (r) => r.categoryName, sortValue: (r) => r.categoryName },
    { key: 'fee', header: 'Cuota', cell: (r) => <FeeChip status={r.feeStatus} />, sortValue: (r) => r.feeStatus },
    { key: 'med', header: 'Apto', cell: (r) => <MedicalChip status={r.medicalStatus} />, sortValue: (r) => r.medicalStatus },
    { key: 'att', header: 'Asistencia', align: 'right', cell: (r) => (r.attendancePct === null ? '—' : `${r.attendancePct}%`), sortValue: (r) => r.attendancePct ?? -1, hideOnMobile: true },
    { key: 'guardian', header: 'Responsable', cell: (r) => r.guardianName || '—', hideOnMobile: true },
  ];

  const sports = [...new Set(data.categories.map((c) => c.sport))];
  const detail = rows.find((r) => r.id === detailId) ?? null;

  const exportCsv = () => {
    downloadCsv('socios.csv', ['Socio', 'DNI', 'Categoría', 'Cuota', 'Apto', 'Vence apto', 'Responsable', 'Teléfono', 'Email'],
      filtered.map((r) => [r.fullName, r.dni, r.categoryName, r.feeStatus, r.medicalStatus, r.medicalExpiresAt ?? '', r.guardianName, r.guardianPhone, r.email]));
    toast.success(`${filtered.length} socios exportados`);
  };

  return (
    <div>
      <SampleDataNotice />
      <PageHeader
        title="Socios y deportistas"
        description={`${filtered.length} de ${rows.length} socios`}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" />Exportar CSV</Button>
            <Button onClick={() => setInviteOpen(true)}><UserPlus className="h-4 w-4 mr-1.5" />Nuevo socio</Button>
          </>
        }
      />

      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por nombre o DNI">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Categoría"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las categorías</SelectItem>
            {data.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sport} onValueChange={setSport}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Deporte"><SelectValue placeholder="Deporte" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los deportes</SelectItem>
            {sports.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fee} onValueChange={setFee}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Estado de cuota"><SelectValue placeholder="Cuota" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toda cuota</SelectItem>
            <SelectItem value="al_dia">Al día</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
        <Select value={medical} onValueChange={setMedical}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Estado de apto"><SelectValue placeholder="Apto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todo apto</SelectItem>
            <SelectItem value="apto">Apto</SelectItem>
            <SelectItem value="por_vencer">Por vencer</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="sin_apto">Sin apto</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <div data-tour="members-table">
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          onRowClick={(r) => setDetailId(r.id)}
          caption="Listado de socios"
          bulkActions={(ids) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                clubStore.sendFeeReminder(ids);
                toast.success(`Recordatorio enviado a ${ids.length} socios`);
                setSelected([]);
              }}
            >
              <Send className="h-4 w-4 mr-1.5" />Enviar recordatorio de cuota
            </Button>
          )}
          empty={<EmptyPanel icon={Users} title="No hay socios con esos filtros" description="Probá quitar algún filtro o dar de alta un socio nuevo." actionLabel="Nuevo socio" onAction={() => setInviteOpen(true)} />}
        />
      </div>

      <MemberDetailSheet member={detail} onClose={() => setDetailId(null)} />
      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
};

export default Members;
