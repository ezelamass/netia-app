import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Section = ({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-20 border-t border-border py-8 first:border-t-0">
    <h2 id={`${id}-t`} className="font-heading text-xl font-bold">{title}</h2>
    {lead && <p className="mb-5 mt-1 max-w-2xl text-sm text-muted-foreground">{lead}</p>}
    {children}
  </section>
);

export const Rule = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <li className="flex gap-2 text-sm">
    <span className={cn('mt-0.5 shrink-0 font-semibold', ok ? 'text-success' : 'text-danger')}>{ok ? 'Sí' : 'No'}</span>
    <span>{children}</span>
  </li>
);

export const SubTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">{children}</h3>
);

/** Demo con botón "Reproducir": remonta el contenido para repetir la animación. */
export const Replay = ({ label, onReplay, children }: { label: string; onReplay: () => void; children: ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="text-sm font-semibold">{label}</p>
      <button
        type="button"
        onClick={onReplay}
        className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-[background-color,transform] duration-fast hover:bg-primary-soft active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Reproducir
      </button>
    </div>
    {children}
  </div>
);
