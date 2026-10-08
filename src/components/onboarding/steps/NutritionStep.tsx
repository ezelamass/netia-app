import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingStep } from '../OnboardingStep';
import { AvatarGuide } from '../AvatarGuide';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { Utensils, Droplets, Pill, Apple } from 'lucide-react';

const breakfastOptions = [
  { value: 'siempre', label: 'Siempre', emoji: '✅' },
  { value: 'aveces', label: 'A veces', emoji: '🤔' },
  { value: 'nunca', label: 'Nunca', emoji: '❌' },
];

const mealCounts = [2, 3, 4, 5, 6];

const restrictions = [
  { value: 'vegano', label: '🌱 Vegano' },
  { value: 'vegetariano', label: '🥗 Vegetariano' },
  { value: 'sin-gluten', label: '🌾 Sin gluten' },
  { value: 'sin-lactosa', label: '🥛 Sin lactosa' },
  { value: 'halal', label: '☪️ Halal' },
  { value: 'kosher', label: '✡️ Kosher' },
  { value: 'otro', label: '📝 Otro' },
];

export const NutritionStep = () => {
  const { data, updateData } = useOnboarding();

  const toggleRestriction = (restriction: string) => {
    const current = data.dietaryRestrictions || [];
    if (current.includes(restriction)) {
      updateData({ dietaryRestrictions: current.filter(r => r !== restriction) });
    } else {
      updateData({ dietaryRestrictions: [...current, restriction] });
    }
  };

  return (
    <OnboardingStep>
      <div className="space-y-6">
        <AvatarGuide
          avatar="zahia"
          message="¡Hola! Soy ZAHIA 🥗 Me encargo de tu nutrición. Una buena alimentación es clave para rendir al máximo. ¡Contame cómo te alimentás!"
        />

        <motion.div
          className="glass rounded-2xl p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Breakfast Before Training */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Utensils className="w-4 h-4 text-zahia" />
              ¿Desayunás antes de entrenar?
            </Label>
            <RadioGroup
              value={data.breakfastBeforeTraining}
              onValueChange={(value) => updateData({ breakfastBeforeTraining: value })}
              className="flex gap-2"
            >
              {breakfastOptions.map((opt) => (
                <Label
                  key={opt.value}
                  htmlFor={`breakfast-${opt.value}`}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    data.breakfastBeforeTraining === opt.value
                      ? 'border-zahia bg-zahia/10'
                      : 'border-border hover:border-zahia/50'
                  }`}
                >
                  <RadioGroupItem value={opt.value} id={`breakfast-${opt.value}`} className="sr-only" />
                  <span>{opt.emoji}</span>
                  <span className="font-medium text-sm">{opt.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Meals Per Day */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Apple className="w-4 h-4 text-zahia" />
              ¿Cuántas comidas hacés por día?
            </Label>
            <div className="flex gap-2">
              {mealCounts.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => updateData({ mealsPerDay: count })}
                  className={`flex-1 p-3 rounded-xl text-lg font-bold transition-all ${
                    data.mealsPerDay === count
                      ? 'bg-zahia text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Hydration Level */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="w-4 h-4 text-zahia" />
              ¿Cómo calificás tu hidratación?
            </Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateData({ hydrationLevel: level })}
                  className={`p-2 rounded-xl transition-all ${
                    data.hydrationLevel >= level
                      ? 'text-blue-500 scale-110'
                      : 'text-muted-foreground'
                  }`}
                >
                  <span className="text-3xl">💧</span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {data.hydrationLevel === 1 && 'Necesito mejorar mucho'}
              {data.hydrationLevel === 2 && 'Podría ser mejor'}
              {data.hydrationLevel === 3 && 'Regular'}
              {data.hydrationLevel === 4 && 'Bastante bien'}
              {data.hydrationLevel === 5 && '¡Excelente! 💪'}
            </p>
          </div>

          {/* Supplements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Pill className="w-4 h-4 text-zahia" />
                ¿Tomás suplementos?
              </Label>
              <Switch
                checked={data.usesSupplements}
                onCheckedChange={(checked) => updateData({ usesSupplements: checked })}
              />
            </div>

            {data.usesSupplements && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input
                  placeholder="¿Cuáles? (ej: vitaminas, proteínas...)"
                  value={data.supplements}
                  onChange={(e) => updateData({ supplements: e.target.value })}
                  className="h-12"
                />
              </motion.div>
            )}
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              ¿Tenés restricciones alimentarias?
            </Label>
            <div className="flex flex-wrap gap-2">
              {restrictions.map((rest) => (
                <button
                  key={rest.value}
                  type="button"
                  onClick={() => toggleRestriction(rest.value)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    data.dietaryRestrictions?.includes(rest.value)
                      ? 'bg-zahia text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {rest.label}
                </button>
              ))}
            </div>
          </div>

          {/* ZAHIA Meal Plan */}
          <div className="flex items-center justify-between p-4 rounded-xl gradient-zahia text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <div>
                <p className="font-medium text-sm">Plan alimenticio de ZAHIA</p>
                <p className="text-xs opacity-80">Recibir sugerencias de comidas</p>
              </div>
            </div>
            <Switch
              checked={data.zahiaMealPlan}
              onCheckedChange={(checked) => updateData({ zahiaMealPlan: checked })}
              className="data-[state=checked]:bg-white/20"
            />
          </div>
        </motion.div>
      </div>
    </OnboardingStep>
  );
};
