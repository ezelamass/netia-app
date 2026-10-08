import { useCountUp } from '@/hooks/useCountUp';

interface CountUpProps {
  value: number;
  /** Con `id`, el conteo corre una sola vez por sesión (no al volver de caché) */
  id?: string;
  className?: string;
}

/** Número que cuenta de 0 al valor la primera vez que entra en pantalla. */
export const CountUp = ({ value, id, className }: CountUpProps) => {
  const [n, ref] = useCountUp<HTMLSpanElement>(value, { key: id });
  return <span ref={ref} className={className}>{n}</span>;
};
