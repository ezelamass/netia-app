import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStep } from '../OnboardingStep';
import { AvatarGuide } from '../AvatarGuide';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Brain, Target } from 'lucide-react';

const motivationLevels = [
  { value: 1, emoji: '😔', label: 'Muy bajo' },
  { value: 2, emoji: '😐', label: 'Bajo' },
  { value: 3, emoji: '🙂', label: 'Normal' },
  { value: 4, emoji: '😊', label: 'Alto' },
  { value: 5, emoji: '🔥', label: 'Muy alto' },
];

const feelings = [
  { value: 'nervioso', emoji: '😰', label: 'Nervioso' },
  { value: 'tranquilo', emoji: '😌', label: 'Tranquilo' },
  { value: 'motivado', emoji: '💪', label: 'Motivado' },
  { value: 'distraido', emoji: '🤔', label: 'Distraído' },
];

const concentrationHelpers = [
  { value: 'musica', emoji: '🎵', label: 'Música' },
  { value: 'respiracion', emoji: '🧘', label: 'Respiración' },
  { value: 'visualizacion', emoji: '👁️', label: 'Visualización' },
  { value: 'silencio', emoji: '🤫', label: 'Silencio' },
  { value: 'rutina', emoji: '📋', label: 'Rutina' },
  { value: 'charla', emoji: '💬', label: 'Charla motivacional' },
];

export const MentalProfileStep = () => {
  const { data, updateData } = useOnboarding();

  const toggleHelper = (helper: string) => {
    const current = data.concentrationHelpers || [];
    if (current.includes(helper)) {
      updateData({ concentrationHelpers: current.filter(h => h !== helper) });
    } else {
      updateData({ concentrationHelpers: [...current, helper] });
    }
  };

  return (
    <OnboardingStep>
      <div className="space-y-6">
        <AvatarGuide
          avatar="roma"
          message="¡Hola! Soy ROMA 🧠 Tu bienestar mental es tan importante como el físico. Contame cómo te sentís y cómo te preparás mentalmente."
        />

        <motion.div
          className="glass rounded-2xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Motivation Level */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Brain className="w-4 h-4 text-roma" />
              ¿Cómo está tu motivación ahora?
            </Label>
            <div className="flex gap-2 justify-center">
              {motivationLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => updateData({ motivationLevel: level.value })}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    data.motivationLevel === level.value
                      ? 'bg-roma text-white scale-110'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <span className="text-2xl">{level.emoji}</span>
                  <span className="text-xs mt-1 font-medium">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pre-Competition Feeling */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Brain className="w-4 h-4 text-roma" />
              Antes de competir, ¿cómo te sentís?
            </Label>
            <RadioGroup
              value={data.preCompetitionFeeling}
              onValueChange={(value) => updateData({ preCompetitionFeeling: value })}
              className="grid grid-cols-2 gap-2"
            >
              {feelings.map((feeling) => (
                <Label
                  key={feeling.value}
                  htmlFor={`feeling-${feeling.value}`}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    data.preCompetitionFeeling === feeling.value
                      ? 'border-roma bg-roma/10'
                      : 'border-border hover:border-roma/50'
                  }`}
                >
                  <RadioGroupItem value={feeling.value} id={`feeling-${feeling.value}`} className="sr-only" />
                  <span className="text-2xl">{feeling.emoji}</span>
                  <span className="font-medium">{feeling.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Concentration Helpers */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-roma" />
              ¿Qué te ayuda a concentrarte?
            </Label>
            <div className="flex flex-wrap gap-2">
              {concentrationHelpers.map((helper) => (
                <button
                  key={helper.value}
                  type="button"
                  onClick={() => toggleHelper(helper.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    data.concentrationHelpers?.includes(helper.value)
                      ? 'bg-roma text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {helper.emoji} {helper.label}
                </button>
              ))}
            </div>
          </div>

          {/* Post Training Relaxation */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-roma/10 border border-roma/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧘</span>
              <div>
                <p className="font-medium text-sm">Ejercicios de relajación</p>
                <p className="text-xs text-muted-foreground">Después de entrenar</p>
              </div>
            </div>
            <Switch
              checked={data.postTrainingRelaxation}
              onCheckedChange={(checked) => updateData({ postTrainingRelaxation: checked })}
            />
          </div>

          {/* ROMA Weekly Goals */}
          <div className="flex items-center justify-between p-4 rounded-xl gradient-roma text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium text-sm">Metas con ROMA</p>
                <p className="text-xs opacity-80">Te ayudo con objetivos semanales/mensuales</p>
              </div>
            </div>
            <Switch
              checked={data.romaWeeklyGoals}
              onCheckedChange={(checked) => updateData({ romaWeeklyGoals: checked })}
              className="data-[state=checked]:bg-white/20"
            />
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  );
};
