import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Play, Building2 } from 'lucide-react';

const navLinks = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Campus', href: '#campus' },
  { label: 'Avatares', href: '#avatares' },
  { label: 'Planes', href: '/clubes#planes' },
];

interface LandingNavbarProps {
  onDemoClick?: () => void;
}

const LandingNavbar = ({ onDemoClick }: LandingNavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-heading font-bold text-secondary">
          Netia
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[18px] font-medium text-foreground hover:text-secondary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/clubes">
            <Button variant="ghost" className="rounded-full px-4 py-2 text-sm font-medium gap-1.5 text-muted-foreground hover:text-foreground">
              <Building2 className="w-3.5 h-3.5" />
              Para clubes
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-full px-5 py-2 text-sm font-medium gap-1.5 border-secondary text-secondary hover:bg-secondary/10"
            onClick={onDemoClick}
          >
            <Play className="w-3.5 h-3.5" />
            Probar Demo
          </Button>
          <Link to="/register">
            <Button className="rounded-full px-6 py-2 text-[16px] font-medium">
              Inscribite
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4">
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[18px] font-medium text-foreground hover:text-secondary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link to="/clubes" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="rounded-full w-full text-[16px] font-medium gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                Para clubes
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-full w-full text-[16px] font-medium gap-2 border-secondary text-secondary"
              onClick={() => { setMobileOpen(false); onDemoClick?.(); }}
            >
              <Play className="w-4 h-4" />
              Probar Demo
            </Button>
            <Link to="/register" onClick={() => setMobileOpen(false)}>
              <Button className="rounded-full w-full text-[16px] font-medium">
                Inscribite
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
