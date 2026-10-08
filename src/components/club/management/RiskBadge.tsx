import type { RiskLevel } from '@/types/club';
import { StatusChip } from '@/components/domain/StatusChip';

export const RiskBadge = ({ level }: { level: RiskLevel }) => {
  if (level === 'rojo') return <StatusChip tone="danger">Riesgo alto</StatusChip>;
  if (level === 'amarillo') return <StatusChip tone="warning">Atención</StatusChip>;
  return <StatusChip tone="success">Sin alertas</StatusChip>;
};
