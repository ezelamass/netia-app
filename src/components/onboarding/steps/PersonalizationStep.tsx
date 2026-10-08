import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStep } from '../OnboardingStep';
import { AvatarGuide } from '../AvatarGuide';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { MessageCircle, Volume2, Trophy } from 'lucide-react';
import { AGENTS } from '@/lib/avatars';

const avatars = [
  { 
    value: 'tino', 
    name: 'TINO', 
    image: AGENTS.TINO.image, 
    description: 'Entrenador físico',
    gradient: 'from-tino to-tino/80',
    emoji: '💪'
  },
  { 
    value: 'zahia', 
    name: 'ZAHIA', 
    image: AGENTS.ZAHIA.image, 
    description: 'Nutrición y bienestar',
    gradient: 'from-zahia to-zahia/80',
    emoji: '🥗'
  },
  { 
    value: 'roma', 
    name: 'ROMA', 
    image: AGENTS.ROMA.image, 
    description: 'Entrenadora mental',
    gradient: 'from-roma to-roma/80',
    emoji: '🧠'
  },
];

const communicationOptions = [
  { value: 'text', icon: MessageCircle, label: 'Texto', emoji: '💬' },
  { value: 'voice', icon: Volume2, label: 'Voz', emoji: '🔉' },
];

export const PersonalizationStep = () => {
  const { data, updateData } = useOnboarding();

  return (
    <OnboardingStep>
      <div className="space-y-6">
        <AvatarGuide
          avatar="tino"
          message="¡Último paso! 🎉 Elegí tu avatar favorito y personalizá tu experiencia. ¡Estamos listos para comenzar esta aventura juntos!"
        />

        <motion.div
          className="glass rounded-2xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Avatar Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              🎭 Elegí tu avatar inicial
            </Label>
            <RadioGroup
              value={data.selectedAvatar}
              onValueChange={(value) => updateData({ selectedAvatar: value })}
              className="grid gap-3"
            >
              {avatars.map((avatar) => (
                <Label
                  key={avatar.value}
                  htmlFor={`avatar-${avatar.value}`}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    data.selectedAvatar === avatar.value
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={avatar.value} id={`avatar-${avatar.value}`} className="sr-only" />
                  
                  {/* Avatar Image */}
                  <div className={`relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-br ${avatar.gradient} shrink-0`}>
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {data.selectedAvatar === avatar.value && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>

                  {/* Avatar Info */}
                  <div className="flex-1">
                    <p className="font-bold text-lg">{avatar.name} {avatar.emoji}</p>
                    <p className="text-sm text-muted-foreground">{avatar.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Avatar Nickname */}
          <div className="space-y-2">
            <Label htmlFor="avatarNickname" className="text-sm font-medium">
              ✨ ¿Querés darle un nombre personalizado? (opcional)
            </Label>
            <Input
              id="avatarNickname"
              placeholder="Ej: Coach, Profe, Amigo..."
              value={data.avatarNickname}
              onChange={(e) => updateData({ avatarNickname: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Communication Preference */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              📢 ¿Cómo preferís que te hable tu avatar?
            </Label>
            <RadioGroup
              value={data.communicationPreference}
              onValueChange={(value) => updateData({ communicationPreference: value })}
              className="flex gap-3"
            >
              {communicationOptions.map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`comm-${opt.value}`}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    data.communicationPreference === opt.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={`comm-${opt.value}`} className="sr-only" />
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="font-medium">{opt.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Champion Challenges */}
          <div className="flex items-center justify-between p-4 rounded-xl gradient-netia text-white">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div>
                <p className="font-medium">Desafíos "Modo Campeón" 🏆</p>
                <p className="text-xs opacity-80">Participar en retos y ganar recompensas</p>
              </div>
            </div>
            <Switch
              checked={data.championChallenges}
              onCheckedChange={(checked) => updateData({ championChallenges: checked })}
              className="data-[state=checked]:bg-white/20"
            />
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  );
};
