import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Chip centrado de sistema (aviso honesto, derivación): amarillo suave, como el aviso de cifrado de WhatsApp. */
export const SystemChip = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex justify-center px-4', className)}>
    <div className="max-w-sm rounded-lg bg-chat-system px-3 py-1.5 text-center text-xs leading-relaxed text-foreground shadow-bubble">
      {children}
    </div>
  </div>
);

/** Aviso honesto del primer mensaje de cada agente (chicos de 8 a 16 años). */
export const AI_NOTICE = 'Soy una IA: puedo equivocarme. Si algo te duele o te preocupa, contale a un adulto.';
