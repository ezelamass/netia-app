import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEMO_ROLES } from '@/contexts/DemoContext';

/** "¿Cómo querés verlo?": una tarjeta por vista, una frase de valor cada una. */
export const DemoPicker = () => {
  const navigate = useNavigate();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {DEMO_ROLES.map((r) => (
        <li key={r.role}>
          <button
            type="button"
            onClick={() => navigate(`/demo/${r.slug}`)}
            className={`group flex h-full w-full flex-col items-start gap-3 rounded-xl border border-border bg-gradient-to-br ${r.gradient} p-5 text-left transition hover:border-primary hover:shadow-pop focus-visible:ring-2`}
          >
            <r.icon className={`h-8 w-8 ${r.iconColor}`} aria-hidden="true" />
            <div>
              <p className="text-lg font-semibold font-heading">Soy {r.label.toLowerCase()}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
              Entrar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
