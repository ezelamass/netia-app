import { useState } from 'react';
import { Copy, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const FamilyCodeCard = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('create_family_link_code', {});
    setLoading(false);
    if (error || !data) {
      toast.error('No pudimos generar el código');
      return;
    }
    setCode(data as string);
  };

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Código copiado');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center gap-2 font-medium">
        <Users className="h-4 w-4" />
        Vincular a mi familia
      </div>
      <p className="text-sm text-muted-foreground">
        Generá un código y pasáselo a tu mamá, papá o tutor. Vence a los 7 días y sirve una sola vez.
      </p>
      {code ? (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl tracking-widest">{code}</span>
          <Button size="icon" variant="ghost" onClick={copy} aria-label="Copiar código">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button onClick={generate} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Generar código
        </Button>
      )}
    </div>
  );
};
