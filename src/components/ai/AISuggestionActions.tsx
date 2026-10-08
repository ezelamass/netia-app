import { Button } from '@/components/ui/button';
import { SavedCheck, useFlash } from '@/components/ui/feedback';
import { cn } from '@/lib/utils';

interface AISuggestionActionsProps {
  onUse: () => void;
  onDiscard: () => void;
  useLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Toda salida de IA se puede usar o descartar. Nunca "Aceptar": la persona decide. */
export const AISuggestionActions = ({ onUse, onDiscard, useLabel = 'Usar', disabled, className }: AISuggestionActionsProps) => {
  const [done, flash] = useFlash();
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button type="button" size="sm" onClick={() => { onUse(); flash(); }} disabled={disabled}>
        {done ? <><SavedCheck />Listo</> : useLabel}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onDiscard} disabled={disabled}>Descartar</Button>
    </div>
  );
};
