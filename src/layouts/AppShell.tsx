import { Suspense, createContext, useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { CommandPaletteProvider } from '@/components/navigation/CommandPalette';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { useDemo } from '@/contexts/DemoContext';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { cn } from '@/lib/utils';
import { ProductTour } from '@/components/demo/ProductTour';
import { LeadForm } from '@/components/demo/LeadForm';
import { demoSession } from '@/demo/session';
import { demoUi } from '@/demo/ui';
import { toast } from 'sonner';

const ShellContext = createContext(false);
/** true cuando ya estamos dentro del AppShell (evita montar un shell anidado). */
export const useInsideShell = () => useContext(ShellContext);

export const AppShell = () => {
  const { isDemoMode, presentation } = useDemo();

  // A los 3 minutos de demo, una invitación (una sola vez por sesión).
  useEffect(() => {
    if (!isDemoMode || presentation) return;
    const KEY = 'netia_demo_cta_shown';
    try { if (sessionStorage.getItem(KEY)) return; } catch { /* sin storage */ }
    const startedAt = demoSession.get().startedAt ?? Date.now();
    const id = window.setTimeout(() => {
      try { sessionStorage.setItem(KEY, '1'); } catch { /* sin storage */ }
      toast('¿Te gustó lo que viste?', {
        description: 'Armamos una propuesta para tu club.',
        duration: 15000,
        action: { label: 'Quiero esto', onClick: () => demoUi.openLead() },
      });
    }, Math.max(0, startedAt + 180_000 - Date.now()));
    return () => window.clearTimeout(id);
  }, [isDemoMode, presentation]);

  return (
    <ShellContext.Provider value={true}>
      <SidebarProvider defaultOpen={true}>
        <CommandPaletteProvider>
          {isDemoMode && <DemoBanner />}
          {isDemoMode && <ProductTour />}
          {isDemoMode && <LeadForm />}
          <div
            className={cn('min-h-screen-dvh bg-surface flex w-full', isDemoMode && !presentation && 'pt-10')}
            style={{ ['--banner-h' as string]: isDemoMode && !presentation ? '2.5rem' : '0px' }}
          >
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 pb-24 lg:pb-8 px-4 lg:px-6 pt-5 min-w-0">
                <Suspense fallback={<PageSkeleton />}>
                  <Outlet />
                </Suspense>
              </main>
            </div>
            <MobileNav />
          </div>
        </CommandPaletteProvider>
      </SidebarProvider>
    </ShellContext.Provider>
  );
};
