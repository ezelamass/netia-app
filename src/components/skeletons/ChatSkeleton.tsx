import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChatSkeletonProps {
  className?: string;
  messageCount?: number;
}

const SHAPES = [
  { user: false, w: 'w-56', h: 'h-12' },
  { user: true, w: 'w-40', h: 'h-9' },
  { user: false, w: 'w-64', h: 'h-16' },
  { user: true, w: 'w-48', h: 'h-12' },
  { user: false, w: 'w-44', h: 'h-9' },
];

/** Burbujas alternadas izquierda/derecha con shimmer. */
export const ChatSkeleton = ({ className, messageCount = 4 }: ChatSkeletonProps) => (
  <div className={cn('flex flex-col gap-2 p-4', className)} role="status" aria-busy="true" aria-label="Cargando conversación">
    {SHAPES.slice(0, messageCount).map((s, i) => (
      <div key={i} className={cn('flex', s.user ? 'justify-end' : 'justify-start')}>
        <Skeleton className={cn('max-w-[80%] rounded-lg', s.w, s.h)} />
      </div>
    ))}
  </div>
);
