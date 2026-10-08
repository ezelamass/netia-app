import { memo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Megaphone } from 'lucide-react';
import { ICONS } from '@/lib/icons';
import { IconBadge } from '@/components/play/IconBadge';
import { JoinClubModal } from '@/components/enrollment/JoinClubModal';
import type { Enrollment } from '@/hooks/useEnrollment';
import type { CalendarEvent } from '@/hooks/useCalendarEvents';
import type { Announcement } from '@/hooks/useClubAnnouncements';

interface ClubCardProps {
  enrollment: Enrollment | null;
  nextClubEvent: CalendarEvent | null;
  lastAnnouncement: Announcement | null;
}

export const ClubCard = memo(({ enrollment, nextClubEvent, lastAnnouncement }: ClubCardProps) => {
  if (!enrollment) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <IconBadge icon={ICONS.club.icon} tone="blue" />
          <div>
            <p className="text-sm font-semibold">Sumate a tu club</p>
            <p className="text-xs text-muted-foreground">Con el código que te da tu club ves sus eventos y avisos.</p>
          </div>
        </div>
        <JoinClubModal />
      </div>
    );
  }

  const pending = enrollment.status !== 'active';
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <IconBadge icon={ICONS.club.icon} tone="blue" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{enrollment.clubName}</p>
          <p className="text-xs text-muted-foreground">{pending ? 'Solicitud pendiente de aprobación' : 'Tu club'}</p>
        </div>
      </div>
      {!pending && (
        <dl className="mt-3 space-y-2">
          {nextClubEvent && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 text-sm">
                <dt className="sr-only">Próximo evento</dt>
                <dd>
                  <span className="font-medium">{nextClubEvent.title}</span>
                  <span className="text-muted-foreground">
                    {' · '}{format(nextClubEvent.date, "EEE d 'a las' HH:mm", { locale: es })}
                  </span>
                </dd>
              </div>
            </div>
          )}
          {lastAnnouncement && (
            <div className="flex items-start gap-2">
              <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 text-sm">
                <dt className="sr-only">Último aviso</dt>
                <dd>
                  <span className="font-medium">{lastAnnouncement.title}</span>
                  <p className="line-clamp-1 text-muted-foreground">{lastAnnouncement.content}</p>
                </dd>
              </div>
            </div>
          )}
          {!nextClubEvent && !lastAnnouncement && (
            <p className="text-sm text-muted-foreground">Todavía no hay eventos ni avisos de tu club.</p>
          )}
        </dl>
      )}
      {!pending && (
        <Link to="/calendar" className="mt-3 inline-block rounded text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Ver eventos del club
        </Link>
      )}
    </div>
  );
});
ClubCard.displayName = 'ClubCard';
