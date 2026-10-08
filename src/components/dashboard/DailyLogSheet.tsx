import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SavedCheck, XpFloat } from '@/components/ui/feedback';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useHaptic } from '@/hooks/useHaptic';
import { DailyLog } from '@/hooks/useDailyLog';
import { toast } from 'sonner';
import { ICONS, type IconKey } from '@/lib/icons';
import { IconBadge } from '@/components/play/IconBadge';

interface DailyLogSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<DailyLog, 'id' | 'date' | 'completedAt'>) => void;
  initialStep?: number;
}

const STEPS: Array<{ key: IconKey; title: string }> = [
  { key: 'sleep', title: '¿Cuántas horas dormiste anoche?' },
  { key: 'hydration', title: '¿Cuánta agua tomaste ayer?' },
  { key: 'energy', title: '¿Cómo te sentís hoy?' },
  { key: 'pain', title: '¿Tenés alguna molestia física?' },
];

const SLEEP_EMOJIS = ['😫', '😫', '😔', '😐', '😐', '😊', '😊', '🤩', '🤩'];
const ENERGY_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Agotado' },
  { value: 2, emoji: '😔', label: 'Bajo' },
  { value: 3, emoji: '😐', label: 'Normal' },
  { value: 4, emoji: '😊', label: 'Bien' },
  { value: 5, emoji: '🔥', label: 'Increíble' },
];

export const DailyLogSheet = ({ open, onClose, onSave, initialStep = 0 }: DailyLogSheetProps) => {
  const isMobile = useIsMobile();
  const { trigger: haptic } = useHaptic();
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState({
    sleep: 7,
    hydration: 1.5,
    energy: 4 as 1 | 2 | 3 | 4 | 5,
    pain: 0,
    painLocation: '',
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleNext = () => {
    haptic('light');
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const playCelebrationSound = () => {
    // Create a simple celebration sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // Play a cheerful ascending melody
    const now = audioContext.currentTime;
    playTone(523.25, now, 0.15);        // C5
    playTone(659.25, now + 0.15, 0.15); // E5
    playTone(783.99, now + 0.3, 0.15);  // G5
    playTone(1046.50, now + 0.45, 0.3); // C6
  };

  const triggerConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#22C55E', '#10B981', '#34D399', '#6EE7B7', '#FFD700'];

    // Play celebration sound and haptic
    playCelebrationSound();
    haptic('celebration');

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleSave = () => {
    const isAllGreen = data.sleep >= 7 && data.hydration >= 1.5 && data.energy >= 4 && data.pain <= 2;
    
    if (isAllGreen) {
      setShowCelebration(true);
      triggerConfetti();
      setTimeout(() => {
        onSave(data);
        toast.success('+10 XP por completar tu registro diario!');
        setShowCelebration(false);
        onClose();
        setStep(0);
      }, 2000);
    } else {
      haptic('success');
      onSave(data);
      setSaved(true);
      
      // Show contextual message
      if (data.sleep < 7) {
        toast('😴 Descansá más esta noche', { icon: '💜' });
      } else if (data.hydration < 1.5) {
        toast('💧 Llevá tu botella hoy', { icon: '💚' });
      } else if (data.pain >= 4) {
        toast('🦵 Hoy toca recuperación activa', { icon: '💙' });
      } else {
        toast.success('+10 XP por completar tu registro!');
      }

      // Confirmación en el botón (check + XP) antes de cerrar.
      setTimeout(() => {
        setSaved(false);
        onClose();
        setStep(0);
      }, 900);
    }
  };

  const getSleepEmoji = (hours: number) => {
    const index = Math.min(Math.max(Math.floor(hours - 4), 0), SLEEP_EMOJIS.length - 1);
    return SLEEP_EMOJIS[index];
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <IconBadge icon={ICONS[STEPS[step].key].icon} tone={ICONS[STEPS[step].key].tone} />
          <span className="font-semibold text-sm">
            Paso {step + 1} de {STEPS.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {showCelebration ? (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <PartyPopper className="w-16 h-16 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold text-center">¡Excelente día!</h3>
              <p className="text-muted-foreground text-center">
                Todos tus indicadores están en verde 💚
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-center">{STEPS[step].title}</h3>

              {step === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-6xl">{getSleepEmoji(data.sleep)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-bold">{data.sleep}h</span>
                  </div>
                  <Slider
                    value={[data.sleep]}
                    onValueChange={([v]) => setData({ ...data, sleep: v })}
                    min={4}
                    max={12}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4h</span>
                    <span>8h</span>
                    <span>12h</span>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {[0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map((value, index) => (
                      <button
                        key={index}
                        onClick={() => setData({ ...data, hydration: value })}
                        className={cn(
                          "text-3xl transition-all",
                          data.hydration >= value 
                            ? "opacity-100 scale-110" 
                            : "opacity-30 scale-90"
                        )}
                      >
                        🥛
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-bold">{data.hydration.toFixed(1)}L</span>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Cada vaso = 200ml
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-5 gap-2">
                  {ENERGY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, energy: option.value as 1|2|3|4|5 })}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                        data.energy === option.value
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <span className="text-3xl mb-1">{option.emoji}</span>
                      <span className="text-xs text-muted-foreground">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className={cn(
                      "text-5xl font-bold",
                      data.pain <= 2 ? "text-emerald-600" :
                      data.pain <= 6 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {data.pain}
                    </span>
                    <span className="text-xl text-muted-foreground">/10</span>
                  </div>
                  <Slider
                    value={[data.pain]}
                    onValueChange={([v]) => setData({ ...data, pain: v })}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sin dolor</span>
                    <span>Moderado</span>
                    <span>Muy fuerte</span>
                  </div>
                  {data.pain > 0 && (
                    <Input
                      placeholder="¿Dónde te duele? (opcional)"
                      value={data.painLocation}
                      onChange={(e) => setData({ ...data, painLocation: e.target.value })}
                      className="mt-4"
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!showCelebration && (
        <div className="p-4 border-t flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
          )}
          <Button onClick={handleNext} disabled={saved} className="relative flex-1 disabled:opacity-100">
            {saved ? (
              <>
                <SavedCheck />
                Guardado
                <XpFloat amount={10} />
              </>
            ) : (
              <>
                {step === STEPS.length - 1 ? 'Guardar' : 'Siguiente'}
                {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 [&>button:last-child]:hidden">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 [&>button:last-child]:hidden">
        {content}
      </DialogContent>
    </Dialog>
  );
};
