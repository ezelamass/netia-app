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

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PaletteDialog = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const groups = [...getNavGroups(user?.role), { label: 'Cuenta', items: footerNav }];
  const setOpen = onOpenChange;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
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
  );
};

export default PaletteDialog;
