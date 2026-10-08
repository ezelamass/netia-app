import { useEffect, useState } from 'react';

const seen = new Set<string>();

/** true solo la primera vez en la sesión que se monta `key`: la entrada escalonada no se repite al volver de caché. */
export function useEnterOnce(key: string): boolean {
  const [first] = useState(() => !seen.has(key));
  useEffect(() => { seen.add(key); }, [key]);
  return first;
}

/** Props de entrada escalonada (máx. 6 ítems, 30 ms entre uno y otro). */
export const staggerProps = (enabled: boolean, i: number) =>
  enabled ? { className: 'animate-fade-up', style: { animationDelay: `${Math.min(i, 5) * 30}ms` } } : {};
