import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Estado vacío simple con CTA, para tablas y listas de gestión. */
export const EmptyPanel = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyPanelProps) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
    <div className="mb-3 rounded-full bg-muted p-3">
      <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
    </div>
    <h3 className="font-semibold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    {actionLabel && onAction && (
      <Button className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
