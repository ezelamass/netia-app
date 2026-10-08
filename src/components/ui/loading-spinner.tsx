import { cn } from '@/lib/utils';
import { NetiaLoader } from './netia-loader';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  overlay?: boolean;
  className?: string;
}

/** Alias de `NetiaLoader` para no romper imports viejos. */
export const LoadingSpinner = ({ size = 'md', message, overlay = false, className }: LoadingSpinnerProps) => {
  const loader = <NetiaLoader size={size === 'sm' ? 'sm' : 'md'} message={message} className={className} />;
  if (!overlay) return loader;
  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-background/80 animate-fade-in')}>
      {loader}
    </div>
  );
};
