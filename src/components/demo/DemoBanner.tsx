import { ChevronDown, Check, Footprints, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDemo, DEMO_ROLES } from '@/contexts/DemoContext';
import { demoUi } from '@/demo/ui';

/** Banner fino de la demo. Se oculta en modo presentación (?modo=presentacion). */
export function DemoBanner() {
  const { isDemoMode, presentation, demoRole, switchDemoRole, resetDemo, exitDemo } = useDemo();
  if (!isDemoMode || presentation) return null;

  const current = DEMO_ROLES.find((r) => r.role === demoRole);

  return (
    <div className="no-print fixed top-0 left-0 right-0 z-[60] h-10 bg-foreground text-background" role="region" aria-label="Demo">
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-2 px-3 sm:px-4">
        <p className="shrink-0 text-xs">
          <span className="font-semibold">Demo</span>
          <span className="hidden sm:inline"> · datos de ejemplo</span>
        </p>

        <div className="flex min-w-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-background hover:bg-background/15 hover:text-background">
                <span className="hidden sm:inline">Vista:</span> {current?.label ?? 'Elegir'}
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {DEMO_ROLES.map((r) => (
                <DropdownMenuItem key={r.role} onClick={() => switchDemoRole(r.role)} className="gap-2">
                  {r.role === demoRole ? <Check className="h-3.5 w-3.5" /> : <span className="w-3.5" />}
                  {r.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-background hover:bg-background/15 hover:text-background" onClick={() => demoUi.startTour()} aria-label="Recorrido guiado">
            <Footprints className="h-3.5 w-3.5 sm:mr-1" aria-hidden="true" /><span className="hidden sm:inline">Recorrido</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-background hover:bg-background/15 hover:text-background" onClick={() => { resetDemo(); toast.success('Demo reiniciada'); }} aria-label="Reiniciar demo">
            <RotateCcw className="h-3.5 w-3.5 sm:mr-1" aria-hidden="true" /><span className="hidden sm:inline">Reiniciar</span>
          </Button>
          <Button size="sm" className="h-7 bg-secondary px-2.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/90" onClick={() => demoUi.openLead()}>
            <span className="sm:hidden">Lo quiero</span><span className="hidden sm:inline">Quiero esto para mi club</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-background hover:bg-background/15 hover:text-background" onClick={() => exitDemo()} aria-label="Salir de la demo">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
