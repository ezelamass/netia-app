import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'netia_settings';

const readIsDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

/** Alterna dark mode y lo persiste en el mismo storage que usa /settings. */
export const useTheme = () => {
  const [isDark, setIsDark] = useState(readIsDark);

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(readIsDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const next = !readIsDark();
    document.documentElement.classList.toggle('dark', next);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.appearance = { ...(parsed.appearance ?? {}), theme: next ? 'dark' : 'light' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      /* storage no disponible */
    }
  }, []);

  return { isDark, toggle };
};
