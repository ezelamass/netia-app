import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Producto', href: '#producto' },
  { label: 'Para quién', href: '#para-quien' },
  { label: 'Precios', href: '#planes' },
  { label: 'FAQ', href: '#faq' },
];

interface Props {
  onContactClick: () => void;
}

const LandingNavbar = ({ onContactClick }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <nav aria-label="Principal" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="NETIA, inicio">
          <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-md" />
          <span className="font-heading text-xl font-bold">NETIA</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild><Link to="/login">Ingresar</Link></Button>
          <Button variant="outline" onClick={onContactClick}>Contacto</Button>
          <Button asChild><Link to="/demo">Probá la demo</Link></Button>
        </div>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md md:hidden"
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div id="landing-mobile-menu" className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-base font-medium">{l.label}</a>
              </li>
            ))}
            <li><Link to="/login" className="flex min-h-11 items-center text-base font-medium">Ingresar</Link></li>
          </ul>
          <div className="flex flex-col gap-2">
            <Button asChild className="h-11"><Link to="/demo">Probá la demo</Link></Button>
            <Button variant="outline" className="h-11" onClick={() => { setOpen(false); onContactClick(); }}>Contacto</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
