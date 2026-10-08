import { MoreHorizontal } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { footerNav, getMobileNav, prefetchRoute } from './navConfig';

export const MobileNav = () => {
  const { user } = useAuth();
  const { primary, more } = getMobileNav(user?.role);
  const overflow = [...more, ...footerNav];

  const itemClass =
    'group flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-md min-w-[56px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const pill = 'flex h-7 w-10 items-center justify-center rounded-full transition-colors duration-150';

  return (
    <nav
      aria-label="Navegación principal"
      className="no-print fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur border-t border-border pb-safe"
    >
      <div className="flex justify-around items-center h-[60px] px-1">
        {primary.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={itemClass}
            activeClassName="text-primary [&>span:first-child]:bg-primary-soft"
            onPointerEnter={() => prefetchRoute(item.href)}
            onTouchStart={() => prefetchRoute(item.href)}
          >
            <span className={pill}><item.icon className="h-5 w-5" strokeWidth={2} /></span>
            <span className="text-[11px] font-medium leading-none">{item.short ?? item.label}</span>
          </NavLink>
        ))}
        <Sheet>
          <SheetTrigger asChild>
            <button type="button" className={itemClass} aria-label="Más opciones">
              <span className={pill}><MoreHorizontal className="h-5 w-5" strokeWidth={2} /></span>
              <span className="text-[11px] font-medium leading-none">Más</span>
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
