import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/contexts/DemoContext';
import { clubStore } from '@/demo/store';
import { demoUi, useDemoUi } from '@/demo/ui';
import type { UserRole } from '@/contexts/AuthContext';

interface Step {
  role: UserRole;
  route: string;
  target: string;
  title: string;
  body: string;
  action?: { label: string; run: () => void };
}

const overdueIds = () => {
  const d = clubStore.get();
  const period = new Date().toISOString().slice(0, 7);
  return d.fees.filter((f) => f.period === period && f.status === 'vencida').map((f) => f.memberId);
};

const STEPS: Step[] = [
  { role: 'club_admin', route: '/club/dashboard', target: '[data-tour="kpis"]', title: 'Así se ve tu club hoy', body: 'Socios, cuotas, aptos y asistencia en una sola pantalla, siempre actualizada.' },
  {
    role: 'club_admin', route: '/club/dashboard', target: '[data-tour="attention"]', title: 'Lo que requiere tu atención',
    body: 'El panel te dice qué hacer primero. Probá mandar el recordatorio a todos los morosos de una vez.',
    action: { label: 'Enviar recordatorio a todos', run: () => { const ids = overdueIds(); clubStore.sendFeeReminder(ids); toast.success(`Recordatorio enviado a ${ids.length} familias`); } },
  },
  { role: 'club_admin', route: '/club/members', target: '[data-tour="members-table"]', title: 'Todos tus socios', body: 'Filtrá por categoría, cuota o apto. Tocá un socio para abrir su ficha con cuotas, documentación y notas.' },
  { role: 'club_admin', route: '/club/medical', target: '[data-tour="medical-kpis"]', title: 'Aptos médicos en semáforo', body: 'Ves quién tiene el apto vencido o por vencer y avisás a las familias con un clic.' },
  { role: 'club_admin', route: '/club/attendance', target: '[data-tour="attendance-controls"]', title: 'Tomá lista en 10 segundos', body: 'Elegí la categoría y tocá a cada presente. La asistencia se acumula por socio y por categoría.' },
  { role: 'club_admin', route: '/club/communication', target: '[data-tour="composer"]', title: 'Avisos por categoría', body: 'Usá una plantilla, elegí a quién va y listo. Queda registrado en el historial.' },
  { role: 'parent', route: '/parent/dashboard', target: '[data-tour="family-panel"]', title: 'Lo que ve una familia', body: 'Cuota, apto médico, próximo partido y avisos del club, desde el celular. Sin llamados a secretaría.' },
];

const PAD = 8;

export const ProductTour = () => {
  const { tourActive, tourStep } = useDemoUi();
  const { isDemoMode, presentation, demoRole, switchDemoRole } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[tourStep];

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  // Lleva a la ruta/rol del paso
  useEffect(() => {
    if (!tourActive || !step) return;
    if (demoRole !== step.role) { switchDemoRole(step.role).then(() => navigate(step.route)); return; }
    if (location.pathname !== step.route) navigate(step.route);
  }, [tourActive, step, demoRole, location.pathname, navigate, switchDemoRole]);

  // Espera al target y lo centra
  useLayoutEffect(() => {
    if (!tourActive || !step || location.pathname !== step.route) { setRect(null); return; }
    let tries = 0;
    const id = window.setInterval(() => {
      const el = document.querySelector(step.target);
      tries++;
      if (el) {
        window.clearInterval(id);
        el.scrollIntoView({ block: 'center', behavior: 'auto' });
        window.setTimeout(measure, 50);
      } else if (tries > 40) {
        window.clearInterval(id);
        // Si no existe, seguimos con el próximo paso
        demoUi.setStep(Math.min(tourStep + 1, STEPS.length));
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [tourActive, step, tourStep, location.pathname, measure]);

  useEffect(() => {
    if (!tourActive) return;
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [tourActive, measure]);

  useEffect(() => {
    if (!tourActive) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') demoUi.stopTour(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tourActive]);

  // Pasó el último paso → cierre con CTA
  useEffect(() => {
    if (tourActive && tourStep >= STEPS.length) demoUi.openLead();
  }, [tourActive, tourStep]);

  if (!isDemoMode || presentation || !tourActive || !step || !rect) return null;

  const last = tourStep === STEPS.length - 1;
  const mobile = window.innerWidth < 640;

  return createPortal(
    <div className="fixed inset-0 z-[9990] pointer-events-none" role="dialog" aria-label="Recorrido guiado" aria-live="polite">
      <div
        className="absolute rounded-lg ring-2 ring-primary transition-all"
        style={{
          top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2,
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
        }}
      />
      <div
        className="pointer-events-auto absolute w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-pop"
        style={
          mobile
            ? { left: '1rem', bottom: 'calc(5rem + env(safe-area-inset-bottom))' }
            : {
                left: Math.min(Math.max(16, rect.left), window.innerWidth - 368),
                top: rect.bottom + 20 + 200 > window.innerHeight ? Math.max(56, rect.top - 220) : rect.bottom + 20,
              }
        }
      >
        <p className="text-xs font-medium text-muted-foreground">Paso {tourStep + 1} de {STEPS.length}</p>
        <h3 className="mt-1 font-semibold">{step.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
        {step.action && (
          <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={step.action.run}>{step.action.label}</Button>
        )}
        <div className="mt-3 flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={() => demoUi.stopTour()}>Salir</Button>
          <div className="flex gap-2">
            {tourStep > 0 && <Button size="sm" variant="outline" onClick={() => demoUi.setStep(tourStep - 1)}>Atrás</Button>}
            <Button size="sm" onClick={() => demoUi.setStep(tourStep + 1)}>{last ? 'Terminar' : 'Siguiente'}</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
