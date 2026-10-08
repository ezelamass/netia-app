import { Eye } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';

/** Chip "Vista previa" para lo que es mockup. En la demo no se muestra. */
export const PreviewBadge = ({ className }: { className?: string }) => {
  const { isDemoMode } = useDemo();
  if (isDemoMode) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary',
        className,
      )}
    >
      <Eye className="h-3 w-3" aria-hidden="true" />
      Vista previa
    </span>
  );
};
