import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Section = ({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-28 border-t border-border py-8 first:border-t-0">
    <h2 id={`${id}-t`} className="font-heading text-xl font-bold">{title}</h2>
    {lead && <p className="mb-5 mt-1 max-w-2xl text-sm text-muted-foreground">{lead}</p>}
    {children}
  </section>
);

export const Rule = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <li className="flex gap-2 text-sm">
    <span className={cn('mt-0.5 w-6 shrink-0 font-semibold', ok ? 'text-success' : 'text-danger')}>{ok ? 'Sí' : 'No'}</span>
    <span>{children}</span>
  </li>
);

export const Sub = ({ children }: { children: ReactNode }) => (
  <h3 className="mb-2 mt-6 font-heading text-sm font-semibold text-muted-foreground first:mt-0">{children}</h3>
);

export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('rounded-xl border border-border bg-card p-4', className)}>{children}</div>
);
