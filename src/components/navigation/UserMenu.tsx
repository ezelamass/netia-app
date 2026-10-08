import { LogOut, User, Settings, ChevronsUpDown, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { prefetchRoute, roleLabels } from '@/components/navigation/navConfig';

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

interface UserMenuProps {
  /** `sidebar`: bloque abajo a la izquierda (se adapta al sidebar colapsado). `header`: avatar compacto (mobile). */
  variant: 'sidebar' | 'header';
  /** Solo `sidebar`: si el sidebar está expandido. */
  expanded?: boolean;
}

export const UserMenu = ({ variant, expanded = true }: UserMenuProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const avatar = (
    <Avatar className="w-8 h-8 shrink-0">
      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
        {initials(user?.name ?? '') || 'U'}
      </AvatarFallback>
    </Avatar>
  );

  const trigger =
    variant === 'sidebar' ? (
      <button
        type="button"
        aria-label="Menú de usuario"
        className={cn('flex w-full items-center gap-2.5 rounded-md text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted', expanded ? 'p-2' : 'justify-center p-0')}
      >
        {avatar}
        {expanded && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium leading-tight">{user?.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{user?.role ? roleLabels[user.role] : ''}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </button>
    ) : (
      <Button variant="ghost" className="flex items-center gap-2 px-2" aria-label="Menú de usuario">
        {avatar}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </Button>
    );

  const collapsed = variant === 'sidebar' && !expanded;
  const menu = (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{user?.name}</TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      )}
      <DropdownMenuContent
        side={variant === 'sidebar' ? 'top' : 'bottom'}
        align={variant === 'sidebar' ? 'start' : 'end'}
        className="w-56"
      >
        <DropdownMenuLabel>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-xs text-muted-foreground font-normal truncate">{user?.email}</p>
          <p className="text-xs text-primary font-medium mt-1">{user?.role ? roleLabels[user.role] : ''}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')} onPointerEnter={() => prefetchRoute('/profile')}>
          <User className="w-4 h-4 mr-2" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} onPointerEnter={() => prefetchRoute('/settings')}>
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
  );

  return menu;
};
