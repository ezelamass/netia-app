import { Suspense, lazy, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
const NotificationPanel = lazy(() => import('./NotificationPanel').then((m) => ({ default: m.NotificationPanel })));
import { useNotifications } from '@/hooks/useNotifications';
const NotificationGeneratorRunner = lazy(() => import('./NotificationGeneratorRunner'));
import { useIsMobile } from '@/hooks/use-mobile';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    groupedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    addNotification,
  } = useNotifications();

  // El generador (que trae hooks de calendario y registro diario) arranca recién con el navegador ocioso.
  const [generatorReady, setGeneratorReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number; cancelIdleCallback?: (id: number) => void };
    const go = () => setGeneratorReady(true);
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(go); return () => w.cancelIdleCallback?.(id); }
    const id = window.setTimeout(go, 3000);
    return () => window.clearTimeout(id);
  }, []);

  const handleClose = () => setIsOpen(false);

  const bellButton = (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
    >
      <Bell className={cn(
        "w-5 h-5 transition-colors",
        unreadCount > 0 ? "text-primary" : "text-muted-foreground"
      )} />
      
      {/* Badge */}
      {unreadCount > 0 && (
          <span
            className={cn(
              "animate-in zoom-in-50 duration-150 motion-reduce:animate-none absolute flex items-center justify-center",
              "min-w-[18px] h-[18px] px-1 text-xs font-bold",
              "bg-destructive text-destructive-foreground rounded-full",
              "-top-0.5 -right-0.5"
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
      )}
    </Button>
  );

  const generator = generatorReady ? (
    <Suspense fallback={null}><NotificationGeneratorRunner addNotification={addNotification} /></Suspense>
  ) : null;

  // Mobile: Use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <>
      {generator}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {bellButton}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh] px-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Notificaciones</SheetTitle>
          </SheetHeader>
          <Suspense fallback={<div className="h-40" />}>
          <NotificationPanel
            groupedNotifications={groupedNotifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
            onClearAllRead={clearAllRead}
            onClose={handleClose}
          />
          </Suspense>
        </SheetContent>
      </Sheet>
      </>
    );
  }

  // Desktop: Use Popover (dropdown)
  return (
    <>
    {generator}
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {bellButton}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-96 p-0 overflow-hidden"
        sideOffset={8}
      >
        <Suspense fallback={<div className="h-40" />}>
        <NotificationPanel
          groupedNotifications={groupedNotifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClearAllRead={clearAllRead}
          onClose={handleClose}
        />
        </Suspense>
      </PopoverContent>
    </Popover>
    </>
  );
};
