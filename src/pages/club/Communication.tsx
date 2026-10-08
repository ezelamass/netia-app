import { useMemo, useState } from 'react';
import { Mail, MessageCircle, Send, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, SampleDataNotice, StatusChip } from '@/components/domain';
import { useClubModel, fmtDate } from '@/demo/selectors';
import { clubStore } from '@/demo/store';
import type { Announcement } from '@/types/club';

const TEMPLATES = [
  { id: 'cuota', label: 'Recordatorio de cuota', title: 'Recordatorio de cuota del mes', body: 'Hola familia, les recordamos que la cuota del mes ya está disponible. Podés abonarla por transferencia, Mercado Pago o en secretaría. ¡Gracias por acompañar!' },
  { id: 'lluvia', label: 'Suspensión por lluvia', title: 'Suspensión por lluvia', body: 'Por el pronóstico, se suspenden los entrenamientos de hoy. Retomamos mañana en el horario habitual.' },
  { id: 'apto', label: 'Apto médico por vencer', title: 'Apto médico: vencimiento próximo', body: 'Revisá la fecha de tu apto médico. Sin apto vigente no podemos habilitar la participación en partidos.' },
  { id: 'semanal', label: 'Resumen semanal para familias', title: 'Resumen semanal del club', body: 'Esta semana: entrenamientos, partidos y novedades de cada categoría. Recordá revisar la cuota y el apto médico de tus hijos. (Envío automático real: próxima fase.)' },
];

const CHANNELS: { value: Announcement['channel']; label: string; icon: typeof Mail }[] = [
  { value: 'app', label: 'App', icon: Smartphone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

const Communication = () => {
  const { data } = useClubModel();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [all, setAll] = useState(true);
  const [cats, setCats] = useState<string[]>([]);
  const [channel, setChannel] = useState<Announcement['channel']>('app');

  const audience: Announcement['audience'] = all ? 'todos' : cats;
  const recipients = useMemo(() => {
    const members = data.members.filter((m) => all || cats.includes(m.categoryId));
    return members.length;
  }, [data.members, all, cats]);
  const valid = title.trim() && body.trim() && (all || cats.length > 0);

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (t) { setTitle(t.title); setBody(t.body); }
  };

  const catNames = (a: Announcement['audience']) =>
    a === 'todos' ? 'Todo el club' : a.map((id) => data.categories.find((c) => c.id === id)?.name).filter(Boolean).join(', ');

  const send = () => {
    clubStore.sendAnnouncement({ title: title.trim(), body: body.trim(), audience, channel });
    toast.success(`Aviso enviado a ${recipients} familias`);
    setTitle(''); setBody(''); setCats([]); setAll(true);
  };

  return (
    <div>
      <SampleDataNotice />
      <PageHeader title="Comunicación" description="Avisos por categoría, con plantillas listas" />

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-lg border border-border bg-card p-4 shadow-card lg:col-span-3" aria-label="Nuevo aviso" data-tour="composer">
          <h2 className="font-semibold">Nuevo aviso</h2>
          <div className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="tpl">Plantilla</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger id="tpl"><SelectValue placeholder="Elegí una plantilla (opcional)" /></SelectTrigger>
                <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="c-title">Asunto</Label><Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="c-body">Mensaje</Label><Textarea id="c-body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Destinatarios</legend>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={all} onCheckedChange={(v) => setAll(v === true)} />Todo el club</label>
              {!all && (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {data.categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={cats.includes(c.id)} onCheckedChange={(v) => setCats((p) => (v === true ? [...p, c.id] : p.filter((x) => x !== c.id)))} />
                      {c.name}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <div className="flex flex-wrap items-center gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={channel === c.value}
                  onClick={() => setChannel(c.value)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${channel === c.value ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted'}`}
                >
                  <c.icon className="h-3.5 w-3.5" aria-hidden="true" />{c.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={send} disabled={!valid}><Send className="h-4 w-4 mr-1.5" />Enviar a {recipients} familias</Button>
              <Button variant="outline" disabled={!title.trim()} onClick={() => { clubStore.saveDraft({ title: title.trim(), body: body.trim(), audience, channel }); toast.success('Borrador guardado'); setTitle(''); setBody(''); }}>Guardar borrador</Button>
            </div>
            <p className="text-xs text-muted-foreground">En esta fase el aviso queda registrado en el historial; el envío real por email/WhatsApp se conecta en la siguiente.</p>
          </div>
        </section>

        <section className="lg:col-span-2" aria-label="Historial">
          <h2 className="mb-2 font-semibold">Historial</h2>
          <ul className="space-y-2">
            {data.announcements.map((a) => (
              <li key={a.id} className="rounded-lg border border-border bg-card p-3 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.status === 'borrador' ? <StatusChip tone="neutral">Borrador</StatusChip> : <StatusChip tone="success">Enviado</StatusChip>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{catNames(a.audience)}{a.sentAt ? ` · ${fmtDate(a.sentAt)}` : ''}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Communication;
