import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SavedCheck, useFlash } from '@/components/ui/feedback';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from './ProfileAvatar';
import { UserProfile, SPORTS, LEVELS, COUNTRIES } from '@/types/profile';

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarChange?: (url: string) => void;
}

export const ProfileHeader = ({
  profile,
  isEditing,
  isDirty,
  isSaving,
  onEdit,
  onSave,
  onCancel,
  onAvatarChange,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  // Guardado confirmado (CMP-03): cuando termina de guardar, un check dibujado junto al botón.
  const [justSaved, flashSaved] = useFlash(1500);
  const wasSaving = useRef(false);
  useEffect(() => {
    if (wasSaving.current && !isSaving) flashSaved();
    wasSaving.current = isSaving;
  }, [isSaving, flashSaved]);

  const sportLabel = SPORTS.find(s => s.value === profile.sport)?.label || profile.sport;
  const levelLabel = LEVELS.find(l => l.value === profile.level)?.label || profile.level;
  const countryLabel = COUNTRIES.find(c => c.value === profile.country)?.label || profile.country;

  // Gradient based on preferred avatar
  const gradientClass = {
    TINO: 'from-avatar-tino/20 to-transparent',
    ZAHIA: 'from-avatar-zahia/20 to-transparent',
    ROMA: 'from-avatar-roma/20 to-transparent',
  }[profile.preferredAvatar];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 p-6 mb-6",
        "bg-gradient-to-b",
        gradientClass
      )}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={!isDirty || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {justSaved && (
              <span className="flex items-center gap-1 text-sm font-medium text-success animate-fade-up" role="status">
                <SavedCheck />
                Guardado
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </Button>
          </div>
        )}
      </div>

      {/* Avatar and info */}
      <div className="flex flex-col items-center text-center">
        <ProfileAvatar
          avatarUrl={profile.avatarUrl}
          fullName={profile.fullName}
          preferredAvatar={profile.preferredAvatar}
          isEditing={isEditing}
          onAvatarChange={onAvatarChange}
        />

        <h1 className="mt-4 text-2xl font-bold text-foreground">
          {profile.fullName}
        </h1>

        <p className="mt-1 text-muted-foreground">
          🎾 {sportLabel} · {levelLabel}
        </p>

        <p className="text-sm text-muted-foreground">
          📍 {profile.city}, {countryLabel}
        </p>
      </div>
    </motion.div>
  );
};
