import type { AvatarId } from '@/lib/avatars';

/** Burbuja entrante con 3 puntos, sin bordes. */
export const TypingIndicator = ({ avatar }: { avatar: AvatarId }) => (
  <div className="flex justify-start" role="status" aria-label={`${avatar} está escribiendo`}>
    <div className="flex items-center gap-1 rounded-lg bg-card px-3 py-3 shadow-bubble animate-bubble-in-left">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-typing" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-typing [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-typing [animation-delay:300ms]" />
    </div>
  </div>
);
