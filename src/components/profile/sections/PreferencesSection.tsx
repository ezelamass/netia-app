import { UseFormReturn } from 'react-hook-form';
import { Settings } from 'lucide-react';
import { ProfileSection } from '../ProfileSection';
import { 
  FieldDisplay, 
  EditableTextField,
  EditableRadioGroup,
  EditableSwitchField,
} from '../EditableField';
import { UserProfile } from '@/types/profile';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/avatars';

interface PreferencesSectionProps {
  profile: UserProfile;
  form: UseFormReturn<UserProfile>;
  isEditing: boolean;
}

// Imágenes por agente
const AVATAR_OPTIONS = [
  { value: 'TINO', label: 'TINO', image: AGENTS.TINO.image, description: 'Entrenamiento físico' },
  { value: 'ZAHIA', label: 'ZAHIA', image: AGENTS.ZAHIA.image, description: 'Nutrición' },
  { value: 'ROMA', label: 'ROMA', image: AGENTS.ROMA.image, description: 'Mental' },
] as const;

const COMMUNICATION_MODES = [
  { value: 'text', label: 'Texto' },
  { value: 'voice', label: 'Voz' },
] as const;

export const PreferencesSection = ({
  profile,
  form,
  isEditing,
}: PreferencesSectionProps) => {
  const selectedAvatar = form.watch('preferredAvatar');

  return (
    <ProfileSection
      title="Avatar y Preferencias"
      icon={Settings}
      iconColor="text-gray-500"
      isEditing={isEditing}
    >
      {isEditing ? (
        <div className="space-y-4">
          {/* Avatar selection cards */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Avatar principal
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.value}
                  type="button"
                  onClick={() => form.setValue('preferredAvatar', avatar.value as 'TINO' | 'ZAHIA' | 'ROMA', { shouldDirty: true })}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                    selectedAvatar === avatar.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden mb-2">
                    <img
                      src={avatar.image}
                      alt={avatar.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-sm">{avatar.label}</span>
                  <span className="text-xs text-muted-foreground">{avatar.description}</span>
                </button>
              ))}
            </div>
          </div>

          <EditableTextField
            form={form}
            name="avatarNickname"
            label="Apodo del avatar para ti"
            placeholder="Ej: Campeón, Crack, etc."
          />

          <EditableRadioGroup
            form={form}
            name="communicationMode"
            label="Modo de comunicación"
            options={COMMUNICATION_MODES}
          />

          <EditableSwitchField
            form={form}
            name="championModeChallenges"
            label="Desafíos Modo Campeón"
            description="Recibir retos diarios personalizados"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={AVATAR_OPTIONS.find(a => a.value === profile.preferredAvatar)?.image}
                alt={profile.preferredAvatar}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Avatar principal</span>
              <p className="font-medium">{profile.preferredAvatar}</p>
            </div>
          </div>
          <FieldDisplay label="Apodo" value={profile.avatarNickname || '—'} />
          <FieldDisplay 
            label="Modo comunicación" 
            value={profile.communicationMode === 'text' ? 'Texto' : 'Voz'} 
          />
          <FieldDisplay label="Desafíos Modo Campeón" value={profile.championModeChallenges} />
        </div>
      )}
    </ProfileSection>
  );
};
