import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, Trophy } from 'lucide-react';
import { PageHeader, SampleDataNotice, StatusChip } from '@/components/domain';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClubModel, fmtDateTime } from '@/demo/selectors';

const Fixtures = () => {
  const { data } = useClubModel();
  const [category, setCategory] = useState('todos');
  const now = new Date();
  const list = useMemo(
    () => data.fixtures.filter((f) => category === 'todos' || f.categoryId === category),
    [data.fixtures, category],
  );
  const upcoming = list.filter((f) => new Date(f.date) >= now).sort((a, b) => a.date.localeCompare(b.date));
  const past = list.filter((f) => new Date(f.date) < now).sort((a, b) => b.date.localeCompare(a.date));
  const catName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? '';

  const Item = ({ f }: { f: (typeof list)[number] }) => (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-card">
      <span className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
        {f.kind === 'torneo' ? <Trophy className="h-4 w-4" aria-hidden="true" /> : <CalendarDays className="h-4 w-4" aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{f.kind === 'torneo' ? f.rival : `${catName(f.categoryId)} vs. ${f.rival}`}</p>
        <p className="text-sm text-muted-foreground">{fmtDateTime(f.date)}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" aria-hidden="true" />{f.venue}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusChip tone={f.home ? 'info' : 'neutral'}>{f.home ? 'Local' : 'Visitante'}</StatusChip>
        {f.result && <span className="text-sm font-semibold tabular">{f.result}</span>}
      </div>
    </li>
  );

  return (
    <div>
      <SampleDataNotice />
      <PageHeader title="Calendario y partidos" description="Próximos partidos, torneos y resultados" />
      <div className="mb-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-52" aria-label="Categoría"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            {data.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Próximos</h2>
      <ul className="space-y-2">{upcoming.map((f) => <Item key={f.id} f={f} />)}{upcoming.length === 0 && <li className="text-sm text-muted-foreground">Nada programado.</li>}</ul>
      <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resultados</h2>
      <ul className="space-y-2">{past.map((f) => <Item key={f.id} f={f} />)}{past.length === 0 && <li className="text-sm text-muted-foreground">Sin resultados todavía.</li>}</ul>
    </div>
  );
};

export default Fixtures;
