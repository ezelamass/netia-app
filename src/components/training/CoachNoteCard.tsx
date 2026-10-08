import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CoachNoteCardProps {
  coach: string;
  text: string;
  date: Date;
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

export const CoachNoteCard = ({ coach, text, date }: CoachNoteCardProps) => (
  <figure className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3">
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
      {initials(coach)}
    </span>
    <div className="min-w-0">
      <blockquote className="text-sm">{text}</blockquote>
      <figcaption className="mt-1 text-xs text-muted-foreground">
        {coach} · {formatDistanceToNow(date, { addSuffix: true, locale: es })}
      </figcaption>
    </div>
  </figure>
);
