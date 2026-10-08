import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/play/IconBadge';
import { TONE_CLASSES } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { DRILLS, type Drill, type DrillSkill } from '@/data/training-preview';
import { PREVIEW_ICONS } from './previewIcons';

const SKILLS: Array<DrillSkill | 'Todos'> = ['Todos', 'Saque', 'Revés', 'Velocidad', 'Coordinación'];

export const DrillCarousel = () => {
  const [skill, setSkill] = useState<DrillSkill | 'Todos'>('Todos');
  const [open, setOpen] = useState<Drill | null>(null);
  const list = skill === 'Todos' ? DRILLS : DRILLS.filter((d) => d.skill === skill);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Filtrar por habilidad">
        {SKILLS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={skill === s}
            onClick={() => setSkill(s)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-[color,background-color,border-color,transform] duration-fast active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              skill === s ? 'border-primary bg-primary-soft text-primary' : 'border-border/60 bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        {list.map((d) => {
          const Icon = PREVIEW_ICONS[d.icon];
          const t = TONE_CLASSES[d.tone];
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setOpen(d)}
              className="w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-[color,background-color,border-color,transform] duration-fast active:scale-[.97] hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={cn('flex h-20 items-center justify-center', t.bg, t.text)}>
                <Icon className="h-9 w-9" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="block space-y-0.5 p-2.5">
                <span className="block truncate text-sm font-semibold">{d.title}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />{d.minutes} min · {d.level}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Drawer open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DrawerContent className="mx-auto max-w-lg">
          {open && (
            <>
              <DrawerHeader className="text-left">
                <div className="mb-1 flex items-center gap-2">
                  <IconBadge icon={PREVIEW_ICONS[open.icon]} tone={open.tone} />
                  <span className="text-xs font-semibold text-muted-foreground">{open.skill} · {open.minutes} min · {open.level}</span>
                </div>
                <DrawerTitle className="font-heading">{open.title}</DrawerTitle>
                <DrawerDescription>Paso a paso</DrawerDescription>
              </DrawerHeader>
              <ol className="space-y-2 px-4 pb-2">
                {open.steps.map((st, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">{i + 1}</span>
                    <span className="pt-0.5">{st}</span>
                  </li>
                ))}
              </ol>
              <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button className="w-full" onClick={() => setOpen(null)}>Entendido</Button>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};
