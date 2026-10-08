import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFamilyLinks } from '@/hooks/useFamilyLinks';
import { UserPlus, Loader2 } from 'lucide-react';

export const LinkChildModal = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { linkChild } = useFamilyLinks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const success = await linkChild(code);
    setLoading(false);
    if (success) {
      setCode('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Vincular hijo/a
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular a tu hijo/a</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="child-code">Código de vinculación</Label>
            <Input
              id="child-code"
              placeholder="A1B2C3D4"
              maxLength={8}
              className="uppercase tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Pedile el código a tu hijo/a (Configuración) o al club. Vence a los 7 días.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Vincular
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
