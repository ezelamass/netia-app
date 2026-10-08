import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIStagesProps {
  /** Etapas reales del trabajo, en orden ("Leyendo tu registro", "Armando la sesión", "Listo") */
  stages: string[];
  /** Índice de la etapa en curso; igual a stages.length = todo terminado */
  current: number;
  className?: string;
}

/**
 * Para esperas de IA de más de 2 s. Muestra etapas, nunca una barra de % que no se mide de verdad.
 */
export const AIStages = ({ stages, current, className }: AIStagesProps) => (
  <ol className={cn('space-y-2', className)} role="status" aria-live="polite">
    {stages.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li
          key={label}
          className={cn(
            'flex items-center gap-2.5 text-sm transition-colors duration-base',
            done && 'text-foreground',
            active && 'font-medium text-foreground',
            !done && !active && 'text-muted-foreground',
          )}
          aria-current={active ? 'step' : undefined}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
            {done ? (
              <Check className="h-4 w-4 animate-pop-in text-success" strokeWidth={2.5} />
            ) : active ? (
              <span className="flex items-center gap-0.5">
                <span className="h-1 w-1 rounded-full bg-ai animate-typing" />
                <span className="h-1 w-1 rounded-full bg-ai animate-typing [animation-delay:150ms]" />
                <span className="h-1 w-1 rounded-full bg-ai animate-typing [animation-delay:300ms]" />
              </span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-border" />
            )}
          </span>
          {label}
        </li>
      );
    })}
  </ol>
);
