import { useState } from 'react';
import { CalendarCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { realSupabase } from '@/integrations/supabase/client';
import { CONTACT } from '@/config/contact';
import { demoUi, useDemoUi } from '@/demo/ui';

/** "Quiero esto para mi club": guarda el lead en Supabase; si falla, abre mail/WhatsApp prellenado. */
export const LeadForm = () => {
  const { leadOpen } = useDemoUi();
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [sport, setSport] = useState('');
  const [members, setMembers] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const valid = name.trim().length >= 2 && club.trim().length >= 2 && contact.trim().length >= 5;

  const fallback = () => {
    const text = `Hola, quiero NETIA para mi club.\nNombre: ${name}\nClub: ${club}\nDeporte: ${sport}\nSocios: ${members}\nContacto: ${contact}`;
    if (CONTACT.whatsapp) window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    else if (CONTACT.email) window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Quiero NETIA para mi club')}&body=${encodeURIComponent(text)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setState('sending');
    const { error } = await realSupabase.from('leads' as never).insert({
      name: name.trim(), club: club.trim(), sport: sport.trim() || null,
      members_count: members ? Number(members) : null, contact: contact.trim(), source: 'demo',
    } as never);
    if (error) {
      if (!CONTACT.whatsapp && !CONTACT.email) {
        setState('error');
        return;
      }
      fallback();
    }
    setState('done');
  };

  return (
    <Dialog open={leadOpen} onOpenChange={(o) => !o && demoUi.closeLead()}>
      <DialogContent className="sm:max-w-md">
        {state === 'done' ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
            <DialogTitle>¡Gracias, {name.split(' ')[0]}!</DialogTitle>
            <DialogDescription>Te escribimos a la brevedad para armar una propuesta para {club}.</DialogDescription>
            {CONTACT.bookingUrl && (
              <Button asChild><a href={CONTACT.bookingUrl} target="_blank" rel="noopener noreferrer"><CalendarCheck className="h-4 w-4 mr-1.5" />Agendar reunión</a></Button>
            )}
            <Button variant="ghost" onClick={() => demoUi.closeLead()}>Seguir en la demo</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Quiero esto para mi club</DialogTitle>
              <DialogDescription>Dejanos tus datos y armamos una propuesta a medida.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5"><Label htmlFor="ld-name">Tu nombre</Label><Input id="ld-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
              <div className="space-y-1.5"><Label htmlFor="ld-club">Club o asociación</Label><Input id="ld-club" value={club} onChange={(e) => setClub(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label htmlFor="ld-sport">Deporte</Label><Input id="ld-sport" value={sport} onChange={(e) => setSport(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="ld-members">Cantidad de socios</Label><Input id="ld-members" inputMode="numeric" value={members} onChange={(e) => setMembers(e.target.value.replace(/\D/g, ''))} /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="ld-contact">Email o WhatsApp</Label><Input id="ld-contact" value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" /></div>
              {state === 'error' && <p role="alert" className="text-sm text-danger">No pudimos enviar tus datos. Probá de nuevo en unos minutos.</p>}
              <Button type="submit" className="w-full" disabled={!valid || state === 'sending'}>
                {state === 'sending' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Quiero que me contacten
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
