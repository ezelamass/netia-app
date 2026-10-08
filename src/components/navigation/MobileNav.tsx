import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { footerNav, getMobileNav, isChatConversation, prefetchRoute } from './navConfig';

export const MobileNav = () => {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  const { primary, more } = getMobileNav(user?.role);
  const overflow = [...more, ...footerNav];
  const barRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<{ x: number } | null>(null);

  // El indicador de fondo se desliza hasta el ítem activo (transform, sin layout).
  useLayoutEffect(() => {
    const bar = barRef.current;
    const pill = bar?.querySelector<HTMLElement>('a[aria-current="page"] > span:first-child');
    if (!bar || !pill) { setSlot(null); return; }
    setSlot({ x: pill.getBoundingClientRect().left - bar.getBoundingClientRect().left });
  }, [pathname, user?.role]);

  // MOB-05: dentro de una conversación la barra inferior se oculta y reaparece en la lista.
  if (isChatConversation(pathname, search)) return null;

  const itemClass =
    'group flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-md min-w-[56px] text-muted-foreground transition-[color,transform] duration-fast active:scale-[.97] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const pill = 'relative flex h-7 w-10 items-center justify-center rounded-full';

  return (
    <nav
      aria-label="Navegación principal"
      className="no-print fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur border-t border-border pb-safe"
    >
      <div ref={barRef} className="relative flex justify-around items-center h-[60px] px-1">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[11px] h-7 w-10 rounded-full bg-primary-soft transition-[transform,opacity] duration-base ease-out"
          style={{ transform: `translateX(${slot?.x ?? 0}px)`, opacity: slot ? 1 : 0 }}
        />
        {primary.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={itemClass}
            activeClassName="text-primary [&>span:first-child_svg]:animate-pop-in"
            onPointerEnter={() => prefetchRoute(item.href)}
            onTouchStart={() => prefetchRoute(item.href)}
          >
            <span className={pill}><item.icon className="h-5 w-5" strokeWidth={2} /></span>
            <span className="text-xs font-medium leading-none">{item.short ?? item.label}</span>
          </NavLink>
        ))}
        <Sheet>
          <SheetTrigger asChild>
            <button type="button" className={itemClass} aria-label="Más opciones">
              <span className={pill}><MoreHorizontal className="h-5 w-5" strokeWidth={2} /></span>
              <span className="text-xs font-medium leading-none">Más</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl pb-safe">
            <SheetHeader>
              <SheetTitle>Más opciones</SheetTitle>
            </SheetHeader>
            <ul className="mt-4 grid grid-cols-1 gap-1">
              {overflow.map((item) => (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className="flex items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-muted"
                    activeClassName="bg-primary-soft text-primary font-medium"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
