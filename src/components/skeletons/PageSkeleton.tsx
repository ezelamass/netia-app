import { Skeleton } from '@/components/ui/skeleton';
import { useDelayedFlag } from '@/hooks/useDelayedFlag';

/** Se muestra solo si la carga pasa 150 ms (EST-04): sin parpadeo en cargas rápidas. */
export const PageSkeleton = ({ message }: { message?: string }) => {
  const show = useDelayedFlag(true, 150, 0);
  if (!show) return null;
  return (
  <div className="space-y-6" role="status" aria-label={message ?? 'Cargando'}>
    {message && <p className="text-sm text-muted-foreground">{message}</p>}
    <div className="space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-lg" />
  </div>
  );
};
