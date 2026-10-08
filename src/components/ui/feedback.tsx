import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Check que se dibuja solo (check-draw 300 ms). Confirma una acción sin que se pierda en un toast (CMP-03). */
export const SavedCheck = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} aria-hidden="true">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="24"
      className="animate-check-draw"
    />
  </svg>
);

/** "+20 XP" que sube y se desvanece desde el botón (float-up, 700 ms). Posicionalo dentro de un contenedor `relative`. */
export const XpFloat = ({ amount, className }: { amount: number; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn('pointer-events-none absolute -top-1 right-3 text-sm font-bold tabular-nums text-success animate-float-up', className)}
  >
    +{amount} XP
  </span>
);

/** `[activo, disparar]`: queda activo `ms` milisegundos (por defecto 800) y vuelve a false. */
export function useFlash(ms = 800): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const fire = useCallback(() => {
    setOn(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOn(false), ms);
  }, [ms]);
  return [on, fire];
}
