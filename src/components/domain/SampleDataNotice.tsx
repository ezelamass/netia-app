import { Info } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';

/** Aviso honesto: los módulos de gestión usan datos de ejemplo hasta que exista el modelo en la base. */
export const SampleDataNotice = () => {
  const { isDemoMode, presentation } = useDemo();
  if (isDemoMode || presentation) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-md border border-info/30 bg-info-soft px-3 py-2 text-sm text-info" role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Módulo en preparación: por ahora muestra datos de ejemplo del club ficticio “Los Ceibos”.</span>
    </div>
  );
};
