import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStep } from '../OnboardingStep';
import { AvatarGuide } from '../AvatarGuide';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { User, MapPin, Globe, Trophy, Hand, UserCheck } from 'lucide-react';

// NOTE: only 'tenis' is fully supported right now. Other sports are shown as
// "próximamente" placeholders and disabled in the Select so users can see the
// roadmap without being silently downgraded to a tennis experience.
const sports = [
  { value: 'tenis', label: '🎾 Tenis', available: true },
  { value: 'futbol', label: '⚽ Fútbol', available: false },
  { value: 'hockey', label: '🏑 Hockey', available: false },
  { value: 'patin', label: '⛸️ Patín', available: false },
  { value: 'karting', label: '🏎️ Karting', available: false },
  { value: 'natacion', label: '🏊 Natación', available: false },
  { value: 'basquet', label: '🏀 Básquet', available: false },
  { value: 'voley', label: '🏐 Vóley', available: false },
  { value: 'rugby', label: '🏉 Rugby', available: false },
  { value: 'atletismo', label: '🏃 Atletismo', available: false },
  { value: 'gimnasia', label: '🤸 Gimnasia', available: false },
  { value: 'otro', label: '🎯 Otro', available: false },
];

const levels = [
  { value: 'iniciacion', label: 'Iniciación', emoji: '🌱', description: 'Recién empezando' },
  { value: 'desarrollo', label: 'Desarrollo', emoji: '📈', description: 'Aprendiendo y creciendo' },
  { value: 'entrenamiento', label: 'Entrenamiento', emoji: '💪', description: 'Entrenando en serio' },
  { value: 'competencia', label: 'Competencia', emoji: '🏆', description: 'Compitiendo activamente' },
];

const lateralities = [
  { value: 'derecho', label: 'Derecho', emoji: '👉' },
  { value: 'zurdo', label: 'Zurdo', emoji: '👈' },
  { value: 'ambidiestro', label: 'Ambidiestro', emoji: '🙌' },
];

const languages = [
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'pt', label: '🇧🇷 Português' },
];

export const PersonalDataStep = () => {
  const { data, updateData } = useOnboarding();

  return (
    <OnboardingStep>
      <div className="space-y-6">
        <AvatarGuide
          avatar="tino"
          message="¡Hola! 👋 Soy TINO, tu entrenador virtual. Vamos a conocernos mejor para personalizar tu experiencia. ¡Esto será rápido y divertido!"
        />

        <motion.div
          className="glass rounded-2xl p-6 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-primary" />
              ¿Cómo te llamás? *
            </Label>
            <Input
              id="fullName"
              placeholder="Tu nombre completo"
              value={data.fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-2 text-sm font-medium">
              🎂 ¿Cuándo naciste? *
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={data.birthDate}
              onChange={(e) => updateData({ birthDate: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                País *
              </Label>
              <Input
                id="country"
                placeholder="Argentina"
                value={data.country}
                onChange={(e) => updateData({ country: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">Ciudad</Label>
              <Input
                id="city"
                placeholder="Buenos Aires"
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value })}
                className="h-12"
              />
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="w-4 h-4 text-primary" />
              Idioma preferido
            </Label>
            <Select value={data.language} onValueChange={(value) => updateData({ language: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Main Sport */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="w-4 h-4 text-primary" />
              ¿Cuál es tu deporte principal? *
            </Label>
            <Select value={data.mainSport} onValueChange={(value) => updateData({ mainSport: value })}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Elegí tu deporte" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem
                    key={sport.value}
                    value={sport.value}
                    disabled={!sport.available}
                  >
                    <span className="flex items-center gap-2">
                      {sport.label}
                      {!sport.available && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          próximamente
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Estamos arrancando con tenis. Muy pronto sumamos más deportes.
            </p>
          </div>

          {/* Level */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              📊 ¿En qué nivel estás? *
            </Label>
            <RadioGroup
              value={data.level}
              onValueChange={(value) => updateData({ level: value })}
              className="grid grid-cols-2 gap-2"
            >
              {levels.map((level) => (
                <Label
                  key={level.value}
                  htmlFor={level.value}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    data.level === level.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={level.value} id={level.value} className="sr-only" />
                  <span className="text-2xl mb-1">{level.emoji}</span>
                  <span className="font-medium text-sm">{level.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{level.description}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Laterality */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Hand className="w-4 h-4 text-primary" />
              ¿Cuál es tu mano/pierna dominante?
            </Label>
            <RadioGroup
              value={data.laterality}
              onValueChange={(value) => updateData({ laterality: value })}
              className="flex gap-2"
            >
              {lateralities.map((lat) => (
                <Label
                  key={lat.value}
                  htmlFor={`lat-${lat.value}`}
                  className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    data.laterality === lat.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={lat.value} id={`lat-${lat.value}`} className="sr-only" />
                  <span className="text-xl mb-1">{lat.emoji}</span>
                  <span className="font-medium text-sm">{lat.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Has Coach */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <UserCheck className="w-4 h-4 text-primary" />
                ¿Tenés entrenador?
              </Label>
              <Switch
                checked={data.hasCoach}
                onCheckedChange={(checked) => updateData({ hasCoach: checked })}
              />
            </div>
            
            {data.hasCoach && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pl-6"
              >
                <Input
                  placeholder="Nombre de tu entrenador"
                  value={data.coachName}
                  onChange={(e) => updateData({ coachName: e.target.value })}
                  className="h-12"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  );
};
