import { motion } from 'framer-motion';
import { Trash2, Check, MoreHorizontal, TriangleAlert, Bell, Trophy, MessageCircle, Flame, Info, Flag, type LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/play/IconBadge';
import type { Tone } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Notification,
  NotificationType,
  formatRelativeTime,
} from '@/types/notification';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

/** El tipo se comunica con un ícono en su tono, no con bordes de color. */
const TYPE_ICON: Record<NotificationType, { icon: LucideIcon; tone: Tone }> = {
  health_alert: { icon: TriangleAlert, tone: 'warning' },
  reminder: { icon: Bell, tone: 'blue' },
  achievement: { icon: Trophy, tone: 'orange' },
  ai_message: { icon: MessageCircle, tone: 'tino' },
  streak: { icon: Flame, tone: 'orange' },
  info: { icon: Info, tone: 'slate' },
  tournament: { icon: Flag, tone: 'zahia' },
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const typeIcon = TYPE_ICON[notification.type];

  const handleClick = () => {
    // Mark as read
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate if action URL exists
    if (notification.actionUrl) {
      onClose?.();
      navigate(notification.actionUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10, height: 0 }}
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        notification.isRead
          ? "bg-background hover:bg-muted/50"
          : "bg-muted/30 hover:bg-muted/50"
      )}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      <div className="flex-shrink-0 mt-1">
        {!notification.isRead ? (
          <div className="w-2 h-2 rounded-full bg-destructive" />
        ) : (
          <div className="w-2 h-2" />
        )}
      </div>

      {/* Icon */}
      <IconBadge icon={typeIcon.icon} tone={typeIcon.tone} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          !notification.isRead && "text-foreground"
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.description}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
          >
            <Check className="w-4 h-4 mr-2" />
            {notification.isRead ? 'Marcar no leída' : 'Marcar leída'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};
