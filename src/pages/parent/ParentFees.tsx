import { Wallet } from 'lucide-react';
import { EmptyPanel, FeeChip, PageHeader } from '@/components/domain';
import { useDemo } from '@/contexts/DemoContext';
import { useClubModel, fmtDate, longMonthLabel } from '@/demo/selectors';
import { formatARS } from '@/types/club';

const ParentFees = () => {
  const { isDemoMode } = useDemo();
  const { data } = useClubModel();
  const fees = data.fees.filter((f) => f.memberId === data.familyChildId).sort((a, b) => b.period.localeCompare(a.period));

  return (
    <div>
      <PageHeader title="Cuotas del hijo/a" description="Estado de las cuotas del club" />
      {!isDemoMode ? (
        <EmptyPanel icon={Wallet} title="Disponible cuando tu club active las cuotas" description="Cuando el club cargue las cuotas vas a verlas acá, con su estado y vencimiento." />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card shadow-card">
          {fees.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="font-medium capitalize">{longMonthLabel(f.period)}</p>
                <p className="text-xs text-muted-foreground tabular">{formatARS(f.amount)} · {f.paidAt ? `pagada el ${fmtDate(f.paidAt)}` : `vence ${fmtDate(f.dueDate)}`}</p>
              </div>
              <FeeChip status={f.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParentFees;
