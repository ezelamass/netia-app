import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Clock, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { EVENT_TYPES, type EventType, type CalendarEvent } from '@/hooks/useCalendarEvents';
import { getEventIcon, TONE_CLASSES } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate?: Date;
}

export const AddEventModal = ({ open, onClose, onSave, initialDate }: AddEventModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>(initialDate ?? new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<EventType>('training');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Al abrir, arranca en el día elegido en el calendario.
  useEffect(() => { if (open && initialDate) setDate(initialDate); }, [open, initialDate]);

  const save = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      description: notes.trim() || undefined,
      isRecurring,
      isCompleted: false,
    });
    setTitle(''); setStartTime(''); setEndTime(''); setType('training'); setNotes(''); setIsRecurring(false);
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="mx-auto max-h-[92dvh] max-w-lg">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-heading">Nuevo evento</DrawerTitle>
          <DrawerDescription>Lo ves en tu calendario y en Inicio.</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de evento">
              {EVENT_TYPES.map((t) => {
                const { icon: Icon, tone } = getEventIcon(t.type);
                const on = type === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setType(t.type)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-[color,background-color,border-color,transform] duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      on ? 'border-primary bg-primary-soft text-primary' : 'border-border/60 bg-card hover:bg-muted',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', TONE_CLASSES[tone].text)} aria-hidden="true" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-title">Título</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Entrenamiento de velocidad" />
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 text-left font-normal">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  {format(date, "EEEE d 'de' MMMM", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={date}
                  onSelect={(d) => { if (d) setDate(d); setDateOpen(false); }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([['ev-start', 'Desde', startTime, setStartTime], ['ev-end', 'Hasta', endTime, setEndTime]] as const).map(([id, label, value, set]) => (
              <div key={id} className="space-y-2">
                <Label htmlFor={id}>{label}</Label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input id={id} type="time" value={value} onChange={(e) => set(e.target.value)} className="pl-9" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
            <Label htmlFor="ev-rec" className="flex items-center gap-2 text-sm font-medium">
              <Repeat className="h-4 w-4 text-muted-foreground" aria-hidden="true" />Repetir cada semana
            </Label>
            <Switch id="ev-rec" checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-notes">Notas</Label>
            <Textarea id="ev-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="resize-none" placeholder="Opcional" />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1" onClick={save} disabled={!title.trim()}>Guardar</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
