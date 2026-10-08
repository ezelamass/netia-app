import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DemoPicker } from '@/components/demo/DemoPicker';

const Demo = () => (
  <main className="min-h-screen-dvh bg-surface px-4 py-8 sm:py-14">
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />Volver
      </Link>
      <img src="/logo.png" alt="NETIA" className="mb-4 h-10 w-10 rounded-md" />
      <h1 className="text-2xl font-bold font-heading sm:text-3xl">¿Cómo querés verlo?</h1>
      <p className="mb-6 mt-2 text-muted-foreground">
        Entrás a un club de ejemplo con 186 socios, sin crear cuenta. Podés registrar pagos, tomar lista y mandar avisos de verdad: todo se reinicia al cerrar.
      </p>
      <DemoPicker />
    </div>
  </main>
);

export default Demo;
