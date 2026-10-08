import type { ReactNode } from 'react';

/** Entrada de página en CSS (fade + 6 px). Sin animación de salida: navegar nunca espera. Usalo con `key={pathname}`. */
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <div className="animate-fade-up">{children}</div>
);
