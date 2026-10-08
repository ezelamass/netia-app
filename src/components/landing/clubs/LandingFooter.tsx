import { Link } from 'react-router-dom';

const LandingFooter = ({ onContactClick }: { onContactClick: () => void }) => (
  <footer className="border-t border-border bg-background py-12">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      <div>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" width={32} height={32} loading="lazy" className="h-8 w-8 rounded-md" />
          <span className="font-heading text-lg font-bold">NETIA</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Software para la gestión de clubes y asociaciones deportivas.</p>
      </div>
      <nav aria-label="Producto">
        <h2 className="mb-3 text-sm font-semibold">Producto</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a className="hover:text-foreground" href="#producto">Funciones</a></li>
          <li><a className="hover:text-foreground" href="#planes">Precios</a></li>
          <li><a className="hover:text-foreground" href="#faq">Preguntas frecuentes</a></li>
          <li><Link className="hover:text-foreground" to="/demo">Probar la demo</Link></li>
        </ul>
      </nav>
      <nav aria-label="Cuenta y contacto">
        <h2 className="mb-3 text-sm font-semibold">Contacto</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><button type="button" className="hover:text-foreground" onClick={onContactClick}>Hablar con nosotros</button></li>
          <li><Link className="hover:text-foreground" to="/login">Ingresar</Link></li>
          <li><Link className="hover:text-foreground" to="/register">Crear cuenta</Link></li>
        </ul>
      </nav>
      <nav aria-label="Legales">
        <h2 className="mb-3 text-sm font-semibold">Legales</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a className="hover:text-foreground" href="/TERMINOS_Y_CONDICIONES.pdf" target="_blank" rel="noopener noreferrer">Términos y condiciones</a></li>
          <li><a className="hover:text-foreground" href="/Politica_de_Privacidad_NETIA.pdf" target="_blank" rel="noopener noreferrer">Política de privacidad</a></li>
        </ul>
      </nav>
    </div>
    <p className="mx-auto mt-10 max-w-7xl px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">© {new Date().getFullYear()} NETIA. Las capturas y cifras de la demo son datos de ejemplo de un club ficticio.</p>
  </footer>
);
export default LandingFooter;
