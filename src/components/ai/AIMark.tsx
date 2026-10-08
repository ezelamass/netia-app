import { memo, useId } from 'react';
import { cn } from '@/lib/utils';

interface AIMarkProps {
  size?: 14 | 16 | 20;
  className?: string;
  /** Si lo tiene, el ícono se anuncia; si no, es decorativo */
  title?: string;
}

/**
 * Chispa de 4 puntas con el gradiente del equipo (TINO → ZAHIA → ROMA).
 * Es la marca de "esto lo armó la IA". Reemplaza a `Sparkles` de Lucide en todo lo que sea IA.
 */
export const AIMark = memo(({ size = 16, className, title }: AIMarkProps) => {
  const gid = `ai-grad-${useId().replace(/:/g, '')}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'hsl(var(--avatar-tino))' }} />
          <stop offset="0.5" style={{ stopColor: 'hsl(var(--avatar-zahia))' }} />
          <stop offset="1" style={{ stopColor: 'hsl(var(--avatar-roma))' }} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gid})`}
        d="M12 1.5c.5 4.9 1.9 8.4 3.6 9.9 1.5 1.4 4.3 2.2 8.4 2.6v.01c-4.1.4-6.9 1.2-8.4 2.6-1.7 1.5-3.1 5-3.6 9.9-.5-4.9-1.9-8.4-3.6-9.9C6.9 15.2 4.1 14.4 0 14v-.01c4.1-.4 6.9-1.2 8.4-2.6C10.1 9.9 11.5 6.4 12 1.5Z"
      />
    </svg>
  );
});
AIMark.displayName = 'AIMark';
