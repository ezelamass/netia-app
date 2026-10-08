import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, X, MessageSquare, Bell, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { EVENT_TYPES, EventType, AvatarType, CalendarEvent } from '@/hooks/useCalendarEvents';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/avatars';

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate?: Date;
}

const avatars: { id: AvatarType | 'none'; name: string; image?: string }[] = [
  { id: 'none', name: 'Ninguno' },
  { id: 'TINO', name: 'TINO', image: AGENTS.TINO.image },
  { id: 'ZAHIA', name: 'ZAHIA', image: AGENTS.ZAHIA.image },
  { id: 'ROMA', name: 'ROMA', image: AGENTS.ROMA.image },
];

export const AddEventModal = ({ open, onClose, onSave, initialDate }: AddEventModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>(initialDate || new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<EventType>('training');
  const [avatar, setAvatar] = useState<AvatarType | 'none'>('none');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasReminder, setHasReminder] = useState(true);
  const [dateOpen, setDateOpen] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      avatar: avatar === 'none' ? undefined : avatar,
      description: notes.trim() || undefined,
      isRecurring,
      isCompleted: false,
    });
    
    // Reset form
    setTitle('');
    setStartTime('');
    setEndTime('');
    setType('training');
    setAvatar('none');
    setNotes('');
    setIsRecurring(false);
    setHasReminder(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Nuevo evento
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          {/* Event type selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de evento</Label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map((eventType) => (
                <motion.button
                  key={eventType.type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setType(eventType.type)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                    type === eventType.type
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{eventType.emoji}</span>
                  <span className="text-[10px] mt-1 text-center leading-tight">
                    {eventType.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del evento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Entrenamiento de velocidad"
              className="bg-background"
            />
          </div>
          
          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(date, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) setDate(d);
                    setDateOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora inicio</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora fin</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>
          </div>
          
          {/* Avatar selector */}
          <div className="space-y-2">
            <Label>Avatar asociado (opcional)</Label>
            <div className="flex gap-2">
              {avatars.map((a) => (
                <motion.button
                  key={a.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAvatar(a.id)}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 transition-all overflow-hidden",
                    avatar === a.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {a.image ? (
                    <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="recurring" className="text-sm">Repetir semanalmente</Label>
              </div>
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="reminder" className="text-sm">Notificar recordatorio</Label>
              </div>
              <Switch
                id="reminder"
                checked={hasReminder}
                onCheckedChange={setHasReminder}
              />
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notas adicionales
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade detalles sobre el evento..."
              className="bg-background resize-none"
              rows={3}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 gradient-netia text-white" 
              onClick={handleSave}
              disabled={!title.trim()}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
