import { ReactNode } from 'react';
import { useInsideShell } from './AppShell';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Compatibilidad: las páginas viejas siguen envolviéndose en AppLayout, pero
 * el shell real (sidebar + header) ahora vive en AppShell como layout route,
 * así que acá solo se renderiza el contenido.
 */
export const AppLayout = ({ children }: AppLayoutProps) => {
  const insideShell = useInsideShell();
  if (insideShell) return <>{children}</>;
  return <div className="min-h-screen-dvh bg-surface px-4 py-6">{children}</div>;
};
