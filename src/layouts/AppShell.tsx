import { Suspense, createContext, lazy, useContext, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { isChatConversation, prefetchMainTabs } from '@/components/navigation/navConfig';
import { PageTransition } from '@/layouts/PageTransition';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/play-skin.css';
import { CommandPaletteProvider } from '@/components/navigation/CommandPalette';
import { SidebarProvider } from '@/components/ui/sidebar';
const DemoBanner = lazy(() => import('@/components/demo/DemoBanner').then((m) => ({ default: m.DemoBanner })));
import { useDemo } from '@/contexts/DemoContext';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';
import { cn } from '@/lib/utils';
const ProductTour = lazy(() => import('@/components/demo/ProductTour').then((m) => ({ default: m.ProductTour })));
const LeadForm = lazy(() => import('@/components/demo/LeadForm').then((m) => ({ default: m.LeadForm })));
import { demoSession } from '@/demo/session';
import { demoUi } from '@/demo/ui';
import { toast } from 'sonner';

const ShellContext = createContext(false);
/** true cuando ya estamos dentro del AppShell (evita montar un shell anidado). */
export const useInsideShell = () => useContext(ShellContext);

/** Microcopy de carga por contexto (una por pantalla, nunca al azar). */
const LOADING_COPY: Record<string, string> = {
  '/training': 'Preparando tu sesión…',
  '/calendar': 'Ordenando tu semana…',
};

export const AppShell = () => {
  const { isDemoMode, presentation } = useDemo();
  const { user } = useAuth();
  const playSkin = user?.role === 'player' || user?.role === 'parent';
  const { pathname, search } = useLocation();
  const immersive = isChatConversation(pathname, search);

  // Precarga las pestañas principales del rol cuando el navegador está ocioso.
  useEffect(() => { prefetchMainTabs(user?.role); }, [user?.role]);

  // La piel también tiene que alcanzar a los portales (drawers, diálogos), que cuelgan de <body>.
  useEffect(() => {
    if (!playSkin) return;
    const root = document.documentElement;
    root.setAttribute('data-skin', 'play');
    return () => root.removeAttribute('data-skin');
  }, [playSkin]);

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
          {isDemoMode && (
            <Suspense fallback={null}>
              <DemoBanner />
              <ProductTour />
              <LeadForm />
            </Suspense>
          )}
          <div
            data-skin={playSkin ? 'play' : undefined}
            className={cn('min-h-screen-dvh bg-surface flex w-full', isDemoMode && !presentation && 'pt-10')}
            style={{ ['--banner-h' as string]: isDemoMode && !presentation ? '2.5rem' : '0px' }}
          >
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className={cn('flex-1 lg:pb-8 px-4 lg:px-6 pt-5 min-w-0', immersive ? 'pb-4' : 'pb-24')}>
                <Suspense fallback={<PageSkeleton message={LOADING_COPY[pathname]} />}>
                  <PageTransition key={pathname}>
                    <Outlet />
                  </PageTransition>
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
