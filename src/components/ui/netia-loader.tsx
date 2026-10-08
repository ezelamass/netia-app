import { cn } from '@/lib/utils';

export interface NetiaLoaderProps {
  size?: 'sm' | 'md';
  message?: string;
  className?: string;
}

const DOT = { sm: 'h-1.5 w-1.5', md: 'h-2.5 w-2.5' } as const;

/** Espera corta sin forma conocida (< 2 s): los 3 puntos del equipo saltando en secuencia. */
export const NetiaLoader = ({ size = 'md', message, className }: NetiaLoaderProps) => (
  <div className={cn('flex flex-col items-center justify-center gap-3', className)} role="status" aria-live="polite">
    <span className="flex items-end gap-1.5" aria-hidden="true">
      <span className={cn('rounded-full bg-tino animate-dot-hop', DOT[size])} />
      <span className={cn('rounded-full bg-zahia animate-dot-hop [animation-delay:150ms]', DOT[size])} />
      <span className={cn('rounded-full bg-roma animate-dot-hop [animation-delay:300ms]', DOT[size])} />
    </span>
    {message ? <p className="text-sm text-muted-foreground">{message}</p> : <span className="sr-only">Cargando</span>}
  </div>
);
