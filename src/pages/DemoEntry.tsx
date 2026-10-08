import { useEffect } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getDemoConfigBySlug } from '@/contexts/DemoContext';
import { demoSession, type DemoScenario } from '@/demo/session';
import { PageSkeleton } from '@/components/skeletons/PageSkeleton';

const SCENARIOS: DemoScenario[] = ['inicio', 'morosidad', 'aptos'];

/** Deep link: /demo/club | /demo/entrenador | /demo/familia | /demo/jugador (+ ?escenario= & ?modo=presentacion). */
const DemoEntry = () => {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cfg = getDemoConfigBySlug(slug);
  const esc = params.get('escenario') as DemoScenario | null;
  const scenario: DemoScenario = esc && SCENARIOS.includes(esc) ? esc : 'inicio';
  const presentation = params.get('modo') === 'presentacion';

  useEffect(() => {
    if (!cfg) return;
    demoSession.start(cfg.role, { scenario, presentation });
    demoSession.setScenario(scenario);
    navigate(cfg.dashboard, { replace: true });
  }, [cfg, scenario, presentation, navigate]);

  if (!cfg) return <Navigate to="/demo" replace />;
  return <div className="p-6"><PageSkeleton /></div>;
};

export default DemoEntry;
