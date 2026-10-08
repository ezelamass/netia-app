import { Suspense, createContext, useContext } from 'react';
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

const ShellContext = createContext(false);
/** true cuando ya estamos dentro del AppShell (evita montar un shell anidado). */
export const useInsideShell = () => useContext(ShellContext);

export const AppShell = () => {
  const { isDemoMode } = useDemo();

  return (
    <ShellContext.Provider value={true}>
      <SidebarProvider defaultOpen={true}>
        <CommandPaletteProvider>
          {isDemoMode && <DemoBanner />}
          <div className={cn('min-h-screen-dvh bg-surface flex w-full', isDemoMode && 'pt-10')}>
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
