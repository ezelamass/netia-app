import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Globe,
  Lock,
  Bot,
  Database,
  Info,
  LogOut,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { SettingsSection, SettingsRow } from '@/components/settings';
import {
  ChangePasswordModal,
  DeleteAccountModal,
  ExportDataModal,
} from '@/components/settings/modals';
import { FamilyCodeCard } from '@/components/family/FamilyCodeCard';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  THEME_OPTIONS,
  LANGUAGE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  UNITS_OPTIONS,
  AVATAR_OPTIONS,
  MESSAGE_FREQUENCY_OPTIONS,
  COMMUNICATION_TONE_OPTIONS,
  PROFILE_VISIBILITY_OPTIONS,
  TIMEZONE_OPTIONS,
} from '@/types/settings';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { settings, updateSetting } = useSettings();

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showResetOnboardingDialog, setShowResetOnboardingDialog] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  // Calculate storage
  const [storageUsed, setStorageUsed] = useState('0 KB');

  useEffect(() => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    const kb = (total / 1024).toFixed(1);
    const mb = (total / (1024 * 1024)).toFixed(2);
    setStorageUsed(total > 1024 * 1024 ? `${mb} MB` : `${kb} KB`);
  }, []);

  const handleClearCache = () => {
    // Clear non-essential data
    const keysToKeep = ['netia_user_profile', 'netia_settings'];
    const keysToRemove: string[] = [];
    
    for (const key in localStorage) {
      if (key.startsWith('netia') && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    toast.success(`Caché limpiada (${keysToRemove.length} items)`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const handleResetOnboarding = async () => {
    if (!user?.id) {
      toast.error('No hay sesión activa');
      return;
    }
    setResettingOnboarding(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: false, onboarding: {} })
        .eq('id', user.id);
      if (error) throw error;

      localStorage.removeItem('netia_onboarding_data');
      localStorage.removeItem('netia_onboarding_step');
      localStorage.removeItem('netia_onboarding_completed');

      toast.success('Vas a rehacer la configuración inicial');
      setShowResetOnboardingDialog(false);
      navigate('/onboarding');
    } catch (err: any) {
      console.error('[settings] reset onboarding failed:', err);
      toast.error('No pudimos reiniciar la configuración', {
        description: err?.message,
      });
    } finally {
      setResettingOnboarding(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Configuración</h1>
        </motion.div>

        <div className="space-y-4">
          {/* Account */}
          <SettingsSection icon={User} title="Cuenta">
            <SettingsRow
              type="link"
              label="Cambiar contraseña"
              onClick={() => setShowPasswordModal(true)}
            />
            <SettingsRow
              type="link"
              label="Email de la cuenta"
              description="Tu email de acceso"
              onClick={() => toast.info('Funcionalidad próximamente')}
            />
            <SettingsRow
              type="link"
              label="Cerrar sesión en todos los dispositivos"
              onClick={() => toast.info('Funcionalidad próximamente')}
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection icon={Bell} title="Notificaciones">
            <SettingsRow
              type="toggle"
              label="Notificaciones push"
              checked={settings.notifications.push}
              onCheckedChange={(v) => updateSetting('notifications', 'push', v)}
            />
            <SettingsRow
              type="toggle"
              label="Recordatorios de entrenamiento"
              checked={settings.notifications.trainingReminders}
              onCheckedChange={(v) => updateSetting('notifications', 'trainingReminders', v)}
            />
            <SettingsRow
              type="toggle"
              label="Alertas de salud"
              checked={settings.notifications.healthAlerts}
              onCheckedChange={(v) => updateSetting('notifications', 'healthAlerts', v)}
            />
            <SettingsRow
              type="toggle"
              label="Mensajes de avatares IA"
              checked={settings.notifications.aiMessages}
              onCheckedChange={(v) => updateSetting('notifications', 'aiMessages', v)}
            />
            <SettingsRow
              type="toggle"
              label="Logros y rachas"
              checked={settings.notifications.achievements}
              onCheckedChange={(v) => updateSetting('notifications', 'achievements', v)}
            />
            <SettingsRow
              type="toggle"
              label="Resumen semanal por email"
              checked={settings.notifications.weeklyEmail}
              onCheckedChange={(v) => updateSetting('notifications', 'weeklyEmail', v)}
            />
          </SettingsSection>

          {/* Appearance */}
          <SettingsSection icon={Palette} title="Apariencia">
            <SettingsRow
              type="select"
              label="Tema"
              value={settings.appearance.theme}
              options={THEME_OPTIONS}
              onValueChange={(v) => updateSetting('appearance', 'theme', v as 'light' | 'dark' | 'system')}
            />
            <SettingsRow
              type="toggle"
              label="Avatar 3D en dashboard"
              checked={settings.appearance.showDashboardAvatar}
              onCheckedChange={(v) => updateSetting('appearance', 'showDashboardAvatar', v)}
            />
            <SettingsRow
              type="toggle"
              label="Animaciones"
              checked={settings.appearance.animations}
              onCheckedChange={(v) => updateSetting('appearance', 'animations', v)}
            />
            <SettingsRow
              type="toggle"
              label="Efectos de sonido"
              checked={settings.appearance.soundEffects}
              onCheckedChange={(v) => updateSetting('appearance', 'soundEffects', v)}
            />
          </SettingsSection>

          {/* Locale */}
          <SettingsSection icon={Globe} title="Idioma y región">
            <SettingsRow
              type="select"
              label="Idioma"
              value={settings.locale.language}
              options={LANGUAGE_OPTIONS}
              onValueChange={(v) => updateSetting('locale', 'language', v as 'es' | 'en')}
            />
            <SettingsRow
              type="select"
              label="Formato de fecha"
              value={settings.locale.dateFormat}
              options={DATE_FORMAT_OPTIONS}
              onValueChange={(v) => updateSetting('locale', 'dateFormat', v as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD')}
            />
            <SettingsRow
              type="select"
              label="Unidades"
              value={settings.locale.units}
              options={UNITS_OPTIONS}
              onValueChange={(v) => updateSetting('locale', 'units', v as 'metric' | 'imperial')}
            />
            <SettingsRow
              type="select"
              label="Zona horaria"
              value={settings.locale.timezone}
              options={TIMEZONE_OPTIONS}
              onValueChange={(v) => updateSetting('locale', 'timezone', v)}
            />
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection icon={Lock} title="Privacidad">
            <SettingsRow
              type="select"
              label="Perfil visible para entrenadores"
              value={settings.privacy.profileVisibility}
              options={PROFILE_VISIBILITY_OPTIONS}
              onValueChange={(v) => updateSetting('privacy', 'profileVisibility', v as 'all' | 'club' | 'none')}
            />
            <SettingsRow
              type="toggle"
              label="Compartir datos anónimos con federación"
              description="Ayuda a mejorar el deporte juvenil"
              checked={settings.privacy.shareAnonymousData}
              onCheckedChange={(v) => updateSetting('privacy', 'shareAnonymousData', v)}
            />
            <SettingsRow
              type="toggle"
              label="Aparecer en ranking"
              checked={settings.privacy.showInLeaderboard}
              onCheckedChange={(v) => updateSetting('privacy', 'showInLeaderboard', v)}
            />
            <SettingsRow
              type="link"
              label="Descargar mis datos"
              onClick={() => setShowExportModal(true)}
            />
            <div className="pt-2">
              <FamilyCodeCard />
            </div>
          </SettingsSection>

          {/* AI Avatars */}
          <SettingsSection icon={Bot} title="Avatares IA">
            <SettingsRow
              type="select"
              label="Avatar principal"
              value={settings.aiAvatars.primaryAvatar}
              options={AVATAR_OPTIONS}
              onValueChange={(v) => updateSetting('aiAvatars', 'primaryAvatar', v as 'TINO' | 'ZAHIA' | 'ROMA')}
            />
            <SettingsRow
              type="select"
              label="Frecuencia de mensajes"
              value={settings.aiAvatars.messageFrequency}
              options={MESSAGE_FREQUENCY_OPTIONS}
              onValueChange={(v) => updateSetting('aiAvatars', 'messageFrequency', v as 'low' | 'normal' | 'high')}
            />
            <SettingsRow
              type="select"
              label="Tono de comunicación"
              value={settings.aiAvatars.communicationTone}
              options={COMMUNICATION_TONE_OPTIONS}
              onValueChange={(v) => updateSetting('aiAvatars', 'communicationTone', v as 'motivational' | 'neutral' | 'technical')}
            />
            <SettingsRow
              type="toggle"
              label="Mensajes de voz"
              checked={settings.aiAvatars.voiceMessages}
              onCheckedChange={(v) => updateSetting('aiAvatars', 'voiceMessages', v)}
            />
          </SettingsSection>

          {/* Data & Storage */}
          <SettingsSection icon={Database} title="Datos y almacenamiento">
            <SettingsRow
              type="display"
              label="Almacenamiento usado"
              value={storageUsed}
            />
            <SettingsRow
              type="link"
              label="Limpiar caché"
              onClick={handleClearCache}
            />
            <SettingsRow
              type="link"
              label="Exportar datos"
              onClick={() => setShowExportModal(true)}
            />
          </SettingsSection>

          {/* About */}
          <SettingsSection icon={Info} title="Acerca de">
            <SettingsRow
              type="display"
              label="Versión"
              value="1.0.0"
            />
            <SettingsRow
              type="link"
              label="Términos y condiciones"
              onClick={() => toast.info('Próximamente')}
            />
            <SettingsRow
              type="link"
              label="Política de privacidad"
              onClick={() => toast.info('Próximamente')}
            />
            <SettingsRow
              type="link"
              label="Licencias open source"
              onClick={() => toast.info('Próximamente')}
            />
            <SettingsRow
              type="link"
              label="Contactar soporte"
              onClick={() => window.open('mailto:soporte@netia.app', '_blank')}
            />
          </SettingsSection>

          {/* Onboarding */}
          <SettingsSection icon={RotateCcw} title="Configuración inicial">
            <SettingsRow
              type="link"
              label="Rehacer onboarding"
              description="Volvé a pasar por la configuración inicial para actualizar tus datos"
              onClick={() => setShowResetOnboardingDialog(true)}
            />
          </SettingsSection>

          {/* Session */}
          <SettingsSection icon={LogOut} title="Sesión">
            <SettingsRow
              type="button"
              label="Cerrar sesión"
              variant="outline"
              onClick={() => setShowLogoutDialog(true)}
            />
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection icon={AlertTriangle} title="Zona de peligro" danger>
            <SettingsRow
              type="button"
              label="Eliminar mi cuenta"
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            />
          </SettingsSection>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />
      
      <DeleteAccountModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
      
      <ExportDataModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
      />

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cerrar tu sesión en este dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Onboarding Confirmation */}
      <AlertDialog open={showResetOnboardingDialog} onOpenChange={setShowResetOnboardingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rehacer la configuración inicial?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a volver a pasar por los pasos del onboarding. Tus datos actuales quedarán
              guardados y podrás actualizarlos. No perdés tus logs, entrenamientos ni progreso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resettingOnboarding}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetOnboarding} disabled={resettingOnboarding}>
              {resettingOnboarding ? 'Reiniciando...' : 'Rehacer ahora'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Settings;
