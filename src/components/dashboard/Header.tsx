import { LogOut, User, Settings, ChevronDown, Moon, Sun, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/notifications';
import { roleLabels } from '@/components/navigation/navConfig';
import { useCommandPalette } from '@/components/navigation/CommandPalette';
import { useTheme } from '@/hooks/useTheme';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setOpen: openPalette } = useCommandPalette();
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2" aria-label="Menú de usuario">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {user?.name ? initials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="hidden lg:block w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                <p className="text-xs text-primary font-medium mt-1">{user?.role ? roleLabels[user.role] : ''}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
