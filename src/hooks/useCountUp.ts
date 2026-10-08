import { useEffect, useRef, useState } from 'react';

const seen = new Set<string>();
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Options {
  duration?: number;
  /** Con `key`, el conteo corre solo la primera vez que entra en pantalla en toda la sesión */
  key?: string;
}

/**
 * Cuenta de 0 al valor en 600 ms (requestAnimationFrame, ease-out) la primera vez que el elemento entra en pantalla.
 * Devuelve [valorMostrado, ref]. Con "reducir movimiento" muestra el valor final directo.
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(target: number, { duration = 600, key }: Options = {}) {
  const ref = useRef<T>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const skip = reduced || (key !== undefined && seen.has(key));
  const [value, setValue] = useState(skip ? target : 0);

  useEffect(() => {
    if (skip) { setValue(target); return; }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setValue(target); return; }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (key !== undefined) seen.add(key);
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setValue(Math.round(target * easeOut(p)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration, key, skip]);

  return [value, ref] as const;
}
