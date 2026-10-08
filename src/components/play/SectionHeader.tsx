import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  action?: { label: string; to: string };
}

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <div className="mb-2 flex items-center justify-between">
    <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
    {action && (
      <Link
        to={action.to}
        className="inline-flex items-center gap-0.5 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {action.label}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    )}
  </div>
);
