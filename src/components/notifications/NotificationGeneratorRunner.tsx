import { useNotificationGenerator } from '@/hooks/useNotificationGenerator';
import type { Notification } from '@/types/notification';

interface Props {
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
}

/** Corre el generador de notificaciones fuera del camino crítico (se carga en tiempo ocioso). */
const NotificationGeneratorRunner = ({ addNotification }: Props) => {
  useNotificationGenerator({ addNotification });
  return null;
};

export default NotificationGeneratorRunner;
