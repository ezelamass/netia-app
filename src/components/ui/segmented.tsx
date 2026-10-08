import { cn } from '@/lib/utils';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
  className?: string;
}

/** Control segmentado con indicador que se desliza (transform) hasta la opción activa. */
export function Segmented<T extends string>({ options, value, onChange, className, ...rest }: SegmentedProps<T>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      role="tablist"
      aria-label={rest['aria-label']}
      className={cn('relative grid auto-cols-fr grid-flow-col rounded-full bg-muted p-0.5', className)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-full bg-card shadow-bubble transition-transform duration-base ease-out"
        style={{ width: `calc((100% - 0.25rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-10 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === o.value ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
