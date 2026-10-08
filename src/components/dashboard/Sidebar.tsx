import { ChevronLeft, Search } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getNavGroups, prefetchRoute, roleLabels } from '@/components/navigation/navConfig';
import { UserMenu } from '@/components/navigation/UserMenu';
import { useCommandPalette } from '@/components/navigation/CommandPalette';

export const Sidebar = () => {
  const { user } = useAuth();
  const { open, toggleSidebar } = useSidebar();
  const { setOpen: openPalette } = useCommandPalette();
  const groups = getNavGroups(user?.role);

  const linkClass =
    'flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';
  const activeClass = 'bg-primary-soft text-primary font-medium hover:bg-primary-soft hover:text-primary';

  return (
    <SidebarUI className="hidden lg:flex border-r border-border" collapsible="icon">
      <SidebarContent className="bg-card">
        <SidebarHeader>
          <div className="h-14 flex items-center justify-between px-3 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src="/logo.png" alt="NETIA" className="w-8 h-8 rounded-md shrink-0 object-contain" />
              {open && (
                <div className="min-w-0">
                  <h1 className="text-base font-bold font-heading leading-tight truncate">NETIA</h1>
                  <p className="text-xs text-muted-foreground truncate">{user?.role ? roleLabels[user.role] : ''}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={toggleSidebar}
              aria-label={open ? 'Contraer menú' : 'Expandir menú'}
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${!open ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          {open && (
            <button
              type="button"
              onClick={() => openPalette(true)}
              className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Buscar…</span>
              <kbd className="text-xs rounded border border-border bg-background px-1.5 py-0.5">Ctrl K</kbd>
            </button>
          )}
        </SidebarHeader>

        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {open && <SidebarGroupLabel className="text-xs uppercase tracking-wide">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.href} className={linkClass} activeClassName={activeClass} aria-label={item.label} onPointerEnter={() => prefetchRoute(item.href)}>
                            <item.icon className="w-[18px] h-[18px] shrink-0" />
                            {open && <span className="truncate">{item.label}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {!open && (
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarFooter className="mt-auto border-t border-border p-2">
          <UserMenu variant="sidebar" expanded={open} />
        </SidebarFooter>
      </SidebarContent>
    </SidebarUI>
  );
};
