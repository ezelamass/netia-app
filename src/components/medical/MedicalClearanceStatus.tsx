import { useEffect } from 'react';
import { useMedicalClearance } from '@/hooks/useMedicalClearance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  valid: { label: 'Vigente', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
  expiring_soon: { label: 'Próximo a vencer', variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' },
  expired: { label: 'Vencido', variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
  pending: { label: 'Pendiente', variant: 'outline' as const, icon: Clock, color: 'text-muted-foreground' },
};

interface Props {
  userId?: string;
}

export const MedicalClearanceStatus = ({ userId }: Props) => {
  const { clearances, isLoading, fetchClearances, latestClearance } = useMedicalClearance();

  useEffect(() => { fetchClearances(userId); }, [fetchClearances, userId]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando certificados...</p>;

  const cfg = latestClearance ? statusConfig[latestClearance.status] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="h-4 w-4" />
          Apto Médico
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!latestClearance ? (
          <p className="text-sm text-muted-foreground">No hay certificados cargados</p>
        ) : cfg ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <div className="text-sm space-y-1">
              <p>Vence: <span className="font-medium">{format(latestClearance.expiryDate, "d MMM yyyy", { locale: es })}</span></p>
              {latestClearance.doctorName && <p>Médico: {latestClearance.doctorName}</p>}
            </div>
          </div>
        ) : null}
        {clearances.length > 1 && (
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Ver historial ({clearances.length} certificados)
            </summary>
            <div className="mt-2 space-y-2">
              {clearances.slice(1).map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs border rounded p-2">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span>{format(c.issuedDate, "d MMM yyyy", { locale: es })}</span>
                  <Badge variant={statusConfig[c.status].variant} className="text-xs px-1.5 py-0">
                    {statusConfig[c.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};
