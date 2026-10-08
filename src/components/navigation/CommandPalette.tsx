import { Suspense, createContext, lazy, useContext, useEffect, useState, type ReactNode } from 'react';

const PaletteDialog = lazy(() => import('./PaletteDialog'));

interface PaletteCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<PaletteCtx>({ open: false, setOpen: () => {} });
export const useCommandPalette = () => useContext(Ctx);

export const CommandPaletteProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // El diálogo (cmdk) se descarga la primera vez que se abre.
  useEffect(() => { if (open) setMounted(true); }, [open]);

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      {mounted && (
        <Suspense fallback={null}>
          <PaletteDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </Ctx.Provider>
  );
};
