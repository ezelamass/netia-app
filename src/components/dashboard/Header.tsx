import { Moon, Sun, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { UserMenu } from '@/components/navigation/UserMenu';
import { useCommandPalette } from '@/components/navigation/CommandPalette';
import { useTheme } from '@/hooks/useTheme';

export const Header = () => {
  const { user } = useAuth();
  const { setOpen: openPalette } = useCommandPalette();
  const { isDark, toggle } = useTheme();

  return (
    <header className="no-print h-14 bg-card/90 backdrop-blur border-b border-border sticky top-0 z-30 px-4 lg:px-6">
      <div className="h-full flex items-center justify-between gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <img src="/logo.png" alt="NETIA" className="w-7 h-7 rounded-md" />
          <span className="font-bold font-heading">NETIA</span>
        </div>

        <div className="hidden lg:block text-sm text-muted-foreground">
          {user?.name ? <>Hola, <span className="font-medium text-foreground">{user.name}</span></> : null}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => openPalette(true)} aria-label="Buscar (Ctrl K)" className="lg:hidden">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <NotificationBell />

          <div className="lg:hidden">
            <UserMenu variant="header" />
          </div>
        </div>
      </div>
    </header>
  );
};
