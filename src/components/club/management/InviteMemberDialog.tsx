import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { clubStore, useClubData } from '@/demo/store';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export const InviteMemberDialog = ({ open, onOpenChange }: Props) => {
  const { categories } = useClubData();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guardian, setGuardian] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const valid = firstName.trim() && lastName.trim() && categoryId;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    clubStore.inviteMember({ firstName: firstName.trim(), lastName: lastName.trim(), categoryId, guardianName: guardian.trim(), email: email.trim() });
    toast.success(`${firstName} ${lastName} dado de alta`, { description: 'Se generó la cuota del mes y el apto quedó pendiente.' });
    setFirstName(''); setLastName(''); setGuardian(''); setEmail(''); setCategoryId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo socio</DialogTitle>
          <DialogDescription>Se crea la cuota del mes y la ficha queda con documentación pendiente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="im-first">Nombre</Label><Input id="im-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="im-last">Apellido</Label><Input id="im-last" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="im-cat">Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="im-cat"><SelectValue placeholder="Elegí una categoría" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label htmlFor="im-g">Responsable</Label><Input id="im-g" value={guardian} onChange={(e) => setGuardian(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="im-e">Email de contacto</Label><Input id="im-e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={!valid}>Dar de alta</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
