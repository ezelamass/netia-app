import { Megaphone } from 'lucide-react';
import { EmptyPanel, PageHeader } from '@/components/domain';
import { useDemo } from '@/contexts/DemoContext';
import { useClubModel, fmtDate } from '@/demo/selectors';

const ParentAnnouncements = () => {
  const { isDemoMode } = useDemo();
  const { data, rows } = useClubModel();
  const child = rows.find((r) => r.id === data.familyChildId);
  const notices = data.announcements.filter(
    (a) => a.status === 'enviado' && (a.audience === 'todos' || (child && a.audience.includes(child.categoryId))),
  );

  return (
    <div>
      <PageHeader title="Avisos del club" description="Lo último que mandó el club a las familias" />
      {!isDemoMode ? (
        <EmptyPanel icon={Megaphone} title="Todavía no hay avisos" description="Cuando el club envíe un aviso lo vas a ver acá." />
      ) : (
        <ul className="space-y-2">
          {notices.map((a) => (
            <li key={a.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(a.sentAt)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParentAnnouncements;
