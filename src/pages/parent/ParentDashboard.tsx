import { useEffect, useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Calendar, TrendingUp } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { FamilyClubPanel } from '@/components/family/FamilyClubPanel';
import { useFamilyLinks } from '@/hooks/useFamilyLinks';
import { useMedicalClearance } from '@/hooks/useMedicalClearance';
import { LinkChildModal } from '@/components/family/LinkChildModal';
import { FamilyLinksList } from '@/components/family/FamilyLinksList';
import { MedicalClearanceStatus } from '@/components/medical/MedicalClearanceStatus';
import { MedicalClearanceUpload } from '@/components/medical/MedicalClearanceUpload';

const ParentDashboard = () => {
  const { isDemoMode } = useDemo();
  const { links, fetchLinks } = useFamilyLinks();
  const { latestClearance, fetchClearances } = useMedicalClearance();
  const [firstChildId, setFirstChildId] = useState<string | undefined>();

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  useEffect(() => {
    if (links.length > 0) {
      setFirstChildId(links[0].childId);
      fetchClearances(links[0].childId);
    }
  }, [links, fetchClearances]);

  const clearanceLabel = !firstChildId
    ? 'Sin hijos'
    : latestClearance
      ? latestClearance.status === 'valid' ? 'Vigente' : latestClearance.status === 'expiring_soon' ? 'Por vencer' : 'Vencido'
      : 'Pendiente';

  const clearanceColor = clearanceLabel === 'Vigente'
    ? 'text-green-600'
    : clearanceLabel === 'Por vencer'
      ? 'text-yellow-600'
      : clearanceLabel === 'Vencido'
        ? 'text-destructive'
        : 'text-muted-foreground';

  if (isDemoMode) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-4 text-xl font-bold font-heading">Panel familiar</h1>
          <FamilyClubPanel />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Panel Familiar</h1>
            <p className="text-muted-foreground">Seguimiento de la actividad de tu hijo/a</p>
          </div>
          <LinkChildModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hijos vinculados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{links.length}</div>
              <p className="text-xs text-muted-foreground">
                {links.length === 0 ? 'Vinculá a tu hijo/a con el código que te da el club' : `${links.filter(l => l.consentGiven).length} con consentimiento`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Apto Médico</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${clearanceColor}`}>{clearanceLabel}</div>
              <p className="text-xs text-muted-foreground">
                {firstChildId ? 'Del primer hijo vinculado' : 'Vincula un hijo primero'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximo evento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">Sin eventos programados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bienestar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">—</div>
              <p className="text-xs text-muted-foreground">Se mostrará cuando haya datos</p>
            </CardContent>
          </Card>
        </div>

        <FamilyLinksList />

        {firstChildId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MedicalClearanceStatus userId={firstChildId} />
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MedicalClearanceUpload targetUserId={firstChildId} />
                <p className="text-xs text-muted-foreground mt-2">Subí el apto médico de tu hijo/a</p>
              </CardContent>
            </Card>
          </div>
        )}

        {links.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vincula a tu hijo/a</h3>
              <p className="text-muted-foreground max-w-md">
                Para ver la actividad, bienestar y progreso de tu hijo/a, primero necesitás vincularlo a tu cuenta
                con el código de vinculación (lo genera tu hijo/a en Configuración, o te lo da el club), usando el botón "Vincular hijo/a" de arriba.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ParentDashboard;
