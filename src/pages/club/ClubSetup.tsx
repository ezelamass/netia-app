import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Layers, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, SampleDataNotice } from '@/components/domain';
import { clubStore, useClubData } from '@/demo/store';
import { cn } from '@/lib/utils';

const STEPS = [
  { icon: Building2, label: 'Datos del club' },
  { icon: Layers, label: 'Categorías' },
  { icon: Upload, label: 'Socios' },
];

const ClubSetup = () => {
  const navigate = useNavigate();
  const data = useClubData();
  const [step, setStep] = useState(0);
  const [clubName, setClubName] = useState(data.club.name);
  const [city, setCity] = useState(data.club.city);
  const [catName, setCatName] = useState('');
  const [csv, setCsv] = useState('nombre,apellido,categoria\n');

  const addCategory = () => {
    if (!catName.trim()) return;
    clubStore.addCategory({ name: catName.trim(), sport: 'Fútbol', coachId: data.coaches[0]?.id ?? '', schedule: 'A definir', monthlyFee: 22000 });
    setCatName('');
  };

  const importCsv = () => {
    const lines = csv.split(/\r?\n/).slice(1).map((l) => l.split(',').map((c) => c.trim())).filter((c) => c[0] && c[1]);
    let ok = 0;
    for (const [firstName, lastName, categoria] of lines) {
      const cat = data.categories.find((c) => c.name.toLowerCase() === (categoria ?? '').toLowerCase()) ?? data.categories[0];
      if (!cat) continue;
      clubStore.inviteMember({ firstName, lastName, categoryId: cat.id, guardianName: '', email: '' });
      ok++;
    }
    toast.success(`${ok} socios importados`);
    navigate('/club/members');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <SampleDataNotice />
      <PageHeader title="Configurá tu club" description="Tres pasos y ya podés empezar a cargar socios" />

      <ol className="mb-5 flex items-center gap-2" aria-label="Pasos">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex flex-1 items-center gap-2">
            <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium', i < step ? 'bg-success text-success-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('hidden text-sm sm:inline', i === step ? 'font-medium' : 'text-muted-foreground')}>{s.label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        {step === 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="cs-name">Nombre del club</Label><Input id="cs-name" value={clubName} onChange={(e) => setClubName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="cs-city">Ciudad</Label><Input id="cs-city" value={city} onChange={(e) => setCity(e.target.value)} /></div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input aria-label="Nueva categoría" placeholder="Ej. Vóley Sub-14" value={catName} onChange={(e) => setCatName(e.target.value)} />
              <Button onClick={addCategory} disabled={!catName.trim()}>Agregar</Button>
            </div>
            <ul className="flex flex-wrap gap-2">{data.categories.map((c) => <li key={c.id} className="rounded-full bg-muted px-3 py-1 text-sm">{c.name}</li>)}</ul>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <Label htmlFor="cs-csv">Pegá tu planilla (CSV con nombre, apellido, categoría)</Label>
            <Textarea id="cs-csv" rows={8} value={csv} onChange={(e) => setCsv(e.target.value)} className="font-mono text-xs" />
            <p className="text-xs text-muted-foreground">Cada socio se da de alta con la cuota del mes generada y el apto pendiente.</p>
          </div>
        )}

        <div className="mt-5 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Atrás</Button>
          {step < 2 ? <Button onClick={() => setStep(step + 1)}>Siguiente</Button> : <Button onClick={importCsv}>Importar y terminar</Button>}
        </div>
      </div>
    </div>
  );
};

export default ClubSetup;
