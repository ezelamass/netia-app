import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, SampleDataNotice, StatusChip } from '@/components/domain';
import { useClubModel, fmtDateTime } from '@/demo/selectors';
import { clubStore } from '@/demo/store';
import { formatARS, type Sport } from '@/types/club';

const Teams = () => {
  const { data, rows, attendanceByCategory } = useClubModel();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('Fútbol');
  const [coachId, setCoachId] = useState(data.coaches[0]?.id ?? '');
  const [fee, setFee] = useState('22000');

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    clubStore.addCategory({ name: name.trim(), sport, coachId, schedule: 'A definir', monthlyFee: Number(fee) || 0 });
    toast.success(`Categoría “${name.trim()}” creada`);
    setName('');
    setOpen(false);
  };

  return (
    <div>
      <SampleDataNotice />
      <PageHeader
        title="Categorías y equipos"
        description={`${data.categories.length} categorías · ${rows.length} socios`}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Nueva categoría</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.categories.map((c) => {
          const members = rows.filter((r) => r.categoryId === c.id);
          const next = data.fixtures.filter((f) => f.categoryId === c.id && new Date(f.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date))[0];
          const att = attendanceByCategory.find((a) => a.category.id === c.id)?.pct ?? 0;
          const overdue = members.filter((m) => m.feeStatus === 'vencida').length;
          return (
            <article key={c.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">{c.sport} · {c.schedule}</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium tabular"><Users className="h-4 w-4" aria-hidden="true" />{members.length}</span>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Entrenador</dt><dd className="font-medium">{c.coachName}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Cuota</dt><dd className="font-medium tabular">{formatARS(c.monthlyFee)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Próximo partido</dt><dd className="font-medium text-right">{next ? fmtDateTime(next.date) : 'Sin programar'}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusChip tone={att >= 70 ? 'success' : 'danger'}>Asistencia {att}%</StatusChip>
                {overdue > 0 && <StatusChip tone="warning">{overdue} cuotas vencidas</StatusChip>}
              </div>
              <Button variant="ghost" size="sm" className="mt-3 -ml-2" asChild>
                <Link to={`/club/members?categoria=${c.id}`}>Ver socios</Link>
              </Button>
            </article>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nueva categoría</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="tc-name">Nombre</Label><Input id="tc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Vóley Sub-14" /></div>
            <div className="space-y-1.5">
              <Label htmlFor="tc-sport">Deporte</Label>
              <Select value={sport} onValueChange={(v) => setSport(v as Sport)}>
                <SelectTrigger id="tc-sport"><SelectValue /></SelectTrigger>
                <SelectContent>{(['Fútbol', 'Hockey', 'Básquet', 'Tenis'] as Sport[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tc-coach">Entrenador</Label>
              <Select value={coachId} onValueChange={setCoachId}>
                <SelectTrigger id="tc-coach"><SelectValue /></SelectTrigger>
                <SelectContent>{data.coaches.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="tc-fee">Cuota mensual (ARS)</Label><Input id="tc-fee" inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ''))} /></div>
            <Button type="submit" className="w-full" disabled={!name.trim()}>Crear categoría</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
