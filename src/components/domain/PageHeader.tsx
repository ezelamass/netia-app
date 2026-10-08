import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, breadcrumb, actions }: PageHeaderProps) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Ruta" className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <Fragment key={b.label}>
              {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
              {b.href ? <Link to={b.href} className="hover:text-foreground">{b.label}</Link> : <span>{b.label}</span>}
            </Fragment>
          ))}
        </nav>
      )}
      <h1 className="text-xl lg:text-2xl font-bold font-heading truncate">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 no-print">{actions}</div>}
  </div>
);
