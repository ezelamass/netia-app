import { useEffect, useState } from 'react';

/** Arranca en 0 y pasa al valor real en el frame siguiente: las barras y anillos "crecen" al montar (transition en CSS). */
export function useGrowIn(value: number): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setV(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return v;
}
