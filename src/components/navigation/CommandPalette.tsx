import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { footerNav, getNavGroups } from './navConfig';

interface PaletteCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<PaletteCtx>({ open: false, setOpen: () => {} });
export const useCommandPalette = () => useContext(Ctx);

export const CommandPaletteProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const groups = [...getNavGroups(user?.role), { label: 'Cuenta', items: footerNav }];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Ir a… (socios, cuotas, aptos)" />
        <CommandList>
          <CommandEmpty>No encontramos nada.</CommandEmpty>
          {groups.map((g) => (
            <CommandGroup key={g.label} heading={g.label}>
              {g.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${g.label}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate(item.href);
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </Ctx.Provider>
  );
};
