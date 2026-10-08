import { useEffect, useRef, useState } from 'react';

/**
 * Anti-parpadeo (EST-04): `true` solo si `active` dura más de `delay` ms y, una vez mostrado,
 * se mantiene al menos `minVisible` ms. Úsalo para decidir cuándo mostrar un skeleton.
 */
export function useDelayedFlag(active: boolean, delay = 150, minVisible = 300): boolean {
  const [shown, setShown] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (active) {
      if (shown) return;
      const id = window.setTimeout(() => { shownAt.current = Date.now(); setShown(true); }, delay);
      return () => window.clearTimeout(id);
    }
    if (!shown) return;
    const left = Math.max(0, minVisible - (Date.now() - shownAt.current));
    const id = window.setTimeout(() => setShown(false), left);
    return () => window.clearTimeout(id);
  }, [active, shown, delay, minVisible]);

  return shown;
}
